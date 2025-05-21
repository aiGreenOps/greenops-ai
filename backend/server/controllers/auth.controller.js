const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const User = require("../models/user.model");
const { jwtSecret, jwtExpire } = require("../config/jwt.config");

// setup del transporter (puoi spostarlo in config/mailer.js)
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// mappa i ruoli dal client mobile a quelli del database
const ROLE_MAP = {
    dipendente: "employee",
    manutentore: "maintainer",
};

exports.register = async (req, res) => {
    const isMobile = req.get("X-Client") === "mobile";
    const {
        firstName, lastName, email, password, phone,
        fiscalCode,      // web only
        role,            // mobile only: "dipendente"|"manutentore"
        invitationToken, // web invited OR mobile invited
    } = req.body;

    // 1) Campi obbligatori
    if (!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (!isMobile && !fiscalCode) {
        return res.status(400).json({ message: "Fiscal code required for web" });
    }

    // 2) Unicità
    if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email already in use" });
    }
    if (await User.findOne({ phone })) {
        return res.status(400).json({ message: "Phone already in use" });
    }
    if (!isMobile && await User.findOne({ fiscalCode })) {
        return res.status(400).json({ message: "Fiscal code already in use" });
    }

    // 3) Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4) Determina role / status / emailVerified
    let serverRole, status, emailVerified = false;

    if (isMobile) {
        // --- Mobile flow ---

        // se arriva token (invitato), è maintainer invitato
        if (invitationToken) {
            let payload;
            try {
                payload = jwt.verify(invitationToken, jwtSecret);
                if (payload.email !== email) {
                    return res.status(400).json({ message: "Token and email mismatch" });
                }
            } catch {
                return res.status(400).json({ message: "Invalid or expired invitation token" });
            }
            serverRole = "maintainer";
            emailVerified = true;
            status = "active";

        } else {
            // self‐signup da mobile
            if (role === "dipendente") {
                serverRole = "employee";
                emailVerified = false;
                status = "active";
            } else if (role === "manutentore") {
                serverRole = "maintainer";
                emailVerified = false;
                status = "unverified";   // in attesa di approvazione
            } else {
                return res.status(400).json({ message: "Invalid role for mobile signup" });
            }
        }

    } else {
        // --- Web flow (manager invites) ---
        let isInvited = false;
        if (invitationToken) {
            try {
                const p = jwt.verify(invitationToken, jwtSecret);
                if (p.email !== email) {
                    return res.status(400).json({ message: "Token and email mismatch" });
                }
                isInvited = true;
            } catch {
                return res.status(400).json({ message: "Invalid or expired invitation token" });
            }
        }
        serverRole = "manager";
        emailVerified = isInvited;
        status = isInvited ? "active" : "unverified";
    }

    // 5) Create user
    const u = await User.create({
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role: serverRole,
        emailVerified,
        status,
        authProvider: "local",
        ...(!isMobile && { fiscalCode }),
    });

    // 6) Se non è verificato, mandiamo la mail di verifica
    if (!emailVerified) {
        const token = jwt.sign({ email }, jwtSecret, { expiresIn: "15m" });
        const url = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            html: `<p>Hello ${firstName},</p>
                  <a href="${url}">Click here to verify your email</a>
                  <p>Link expires in 15 minutes.</p>`,
        });
    }

    // 7) Risposta mobile vs web
    if (isMobile) {
        const payload = {
            userId: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
        };
        const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });
        return res.status(201).json({ token: jwtToken, user: payload });
    } else {
        return res.status(201).json({
            message: emailVerified
                ? "Registration complete. You can now log in."
                : "Registration received. Please verify your email before logging in.",
        });
    }
};
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const { email } = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });
        }
        if (user.emailVerified) {
            return res.status(400).json({ message: "Email già verificata" });
        }

        user.emailVerified = true;
        // se dipendente → active, se manutentore → pending, se manager → pending
        if (user.role === "employee") {
            user.status = "active";
        } else if (user.role === "maintainer" || user.role === "manager") {
            user.status = "pending";
        }
        await user.save();

        // notifica real-time al canale giusto
        const io = req.app.get("io");
        const payload = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
        if (user.role === "manager") {
            io.emit("newPendingManager", payload);
        } else if (user.role === "maintainer") {
            io.emit("newPendingMaintainer", payload);
        }

        return res.status(200).json({
            message:
                user.status === "active"
                    ? "✅ Email verificata. Puoi ora effettuare il login."
                    : "✅ Email verificata. In attesa di approvazione.",
        });
    } catch {
        return res.status(400).json({ message: "❌ Link non valido o scaduto." });
    }
};


exports.login = async (req, res) => {
    const { email, password, deviceId } = req.body;
    const isMobile = req.get("x-client") === "mobile";

    // 1) Trova utente
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
    }
    if (!user.emailVerified) {
        return res.status(403).json({ message: "Email non verificata" });
    }
    if (user.status !== "active") {
        return res.status(403).json({ message: "Utente non approvato" });
    }

    // 2) Verifica password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        return res.status(401).json({ message: "Credenziali non valide" });
    }

    // 3) Su mobile permetti solo employee/maintainer
    if (isMobile && !["employee", "maintainer"].includes(user.role)) {
        return res.status(403).json({ message: "Accesso non consentito da mobile" });
    }

    // Funzione per creare token + payload
    const makePayload = () => ({
        userId: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    });

    // 4) Branch ADMIN (web only, perché mobile viene bloccato sopra)
    if (user.role === "admin") {
        const payload = makePayload();
        const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });

        if (isMobile) {
            // non dovrebbe succedere perché admin è vietato in mobile
            return res.status(403).json({ message: "Accesso non consentito da mobile" });
        }

        // WEB: imposta cookie
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({ user: payload });
    }

    // 5) Branch non-admin senza 2FA (includendo manager senza 2FA e employee)
    if (!user.twoFactorEnabled) {
        const payload = makePayload();
        const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });
        if (isMobile) {
            // MOBILE: restituisco token + profilo
            return res.json({ token, user: payload });
        }

        // WEB: imposta cookie managerToken
        res.cookie("managerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({ user: payload });
    }

    // 6) Manager + 2FA e device trusted
    if (deviceId && user.twoFactorDevices.includes(deviceId)) {
        const payload = makePayload();
        const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });

        if (isMobile) {
            return res.json({ token, user: payload });
        }

        res.cookie("managerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({ user: payload });
    }

    // 7) Altrimenti avvia flusso 2FA
    const twoFaPayload = {
        ...makePayload(),
        twoFa: true
    };
    const twoFaToken = jwt.sign(twoFaPayload, jwtSecret, { expiresIn: "5m" });
    return res.json({
        requires2FA: true,
        twoFaToken,
    });
};

// cancella solo il cookie managerToken
exports.logoutManager = (req, res) => {
    res.clearCookie("managerToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",      // lo stesso path usato in res.cookie
    });
    res.status(200).json({ message: "Logout manager effettuato" });
};

// cancella solo il cookie adminToken
exports.logoutAdmin = (req, res) => {
    res.clearCookie("adminToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",      // lo stesso path usato in res.cookie
    });
    res.status(200).json({ message: "Logout admin effettuato" });
};

exports.me = (req, res) => {
    // req.user è il payload estratto da JWT: userId, role, firstName, lastName, email
    // Carichiamo però dal DB lo stato della 2FA
    User.findById(req.user.userId).select('firstName lastName email role twoFactorEnabled')
        .then(user => {
            if (!user) return res.status(404).json({ message: 'Utente non trovato' });
            res.json({ user });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Errore interno' });
        });
};


