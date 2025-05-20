const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

exports.register = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        fiscalCode,
        invitationToken,
    } = req.body;

    // verifica invito
    let isInvited = false;
    if (invitationToken) {
        try {
            const payload = jwt.verify(invitationToken, jwtSecret);
            if (payload.email !== email) {
                return res
                    .status(400)
                    .json({ message: "Token e email non corrispondono" });
            }
            isInvited = true;
        } catch {
            return res
                .status(400)
                .json({ message: "Token di invito non valido o scaduto" });
        }
    }

    // controlli di unicità
    if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email già registrata" });
    }
    if (await User.findOne({ fiscalCode })) {
        return res.status(400).json({ message: "Codice fiscale già registrato" });
    }
    if (await User.findOne({ phone })) {
        return res.status(400).json({ message: "Numero di telefono già registrato" });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // crea utente
    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        fiscalCode,
        passwordHash,
        emailVerified: isInvited,
        status: isInvited ? "active" : "unverified",
        role: "manager",
    });

    // flusso standard di verifica email se NON invitato
    if (!isInvited) {
        const token = jwt.sign({ email }, jwtSecret, { expiresIn: "15m" });
        const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verifica il tuo indirizzo email",
            html: `
        <p>Ciao ${firstName},</p>
        <p>Clicca qui per verificare la tua email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Il link scade tra 15 minuti.</p>
      `,
        });

        return res
            .status(201)
            .json({
                message:
                    "Registrazione ricevuta. Verifica l'email per completare il processo.",
            });
    }

    // se invitato → nessuna mail di verifica, utente già attivo
    res
        .status(201)
        .json({
            message: "Registrazione completata. Ora puoi accedere alla dashboard.",
        });
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
        user.status = "pending";
        await user.save();

        // notifica in real-time
        const io = req.app.get("io");
        io.emit("newPendingUser", {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });

        res
            .status(200)
            .json({
                message:
                    "✅ Email verificata. Ora puoi essere approvato da un admin.",
            });
    } catch {
        res.status(400).json({ message: "❌ Link non valido o scaduto." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
    }

    if (!user.emailVerified) {
        return res.status(403).json({ message: "Email non verificata" });
    }

    if (user.status !== "active") {
        return res.status(403).json({ message: "Utente non approvato dall'amministratore" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        return res.status(401).json({ message: "Credenziali non valide" });
    }

    // in auth.controller.js, login e nei callback social
    const token = jwt.sign({
        userId: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }, jwtSecret, { expiresIn: jwtExpire });

    const isAdmin = user.role === "admin";
    const cookieName = isAdmin ? "adminToken" : "managerToken";

    res.cookie(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // 2) invia comunque qualche info utile (opzionale)
    res.status(200).json({
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        }
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
    res.json({ user: req.user });
};



