const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const { jwtSecret, jwtExpire } = require("../config/jwt.config");

exports.register = async (req, res) => {
    const { firstName, lastName, email, password, phone, fiscalCode } = req.body;

    if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email già registrata" });
    }

    if (await User.findOne({ fiscalCode })) {
        return res.status(400).json({ message: "Codice fiscale già registrato" });
    }

    if (await User.findOne({ phone })) {
        return res.status(400).json({ message: "Numero di telefono già registrato" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName,
        lastName,
        email,
        passwordHash,
        phone,
        fiscalCode,
        emailVerified: false,
        status: "unverified",
        role: "manager"
    });

    // 👉 CREA JWT VERIFICA EMAIL
    const token = jwt.sign({ email }, jwtSecret, { expiresIn: "15m" });
    const verificationUrl = `http://localhost:3001/api/auth/verify-email?token=${token}`;

    // 👉 INVIA EMAIL
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verifica il tuo indirizzo email",
        html: `
      <p>Ciao ${firstName},</p>
      <p>Clicca qui per verificare la tua email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Questo link scade tra 15 minuti.</p>
    `
    });

    res.status(201).json({ message: "Registrazione ricevuta. Verifica l'email per completare il processo." });
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const { email } = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        if (user.emailVerified) return res.status(400).json({ message: "Email già verificata" });

        user.emailVerified = true;
        user.status = "pending";
        await user.save();

        res.status(200).json({ message: "✅ Email verificata. Ora puoi essere approvato da un admin." });
    } catch (err) {
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

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        jwtSecret,
        { expiresIn: jwtExpire }
    );

    res.status(200).json({
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        }
    });
};

