// routes/2fa.routes.js
const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");               // ← aggiunto
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");
const { jwtSecret } = require("../config/jwt.config");    // ← aggiunto

const router = express.Router();

router.post('/disable', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Utente non trovato' });

        // resetta tutti i campi 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        user.recoveryCodes = [];
        user.twoFactorDevices = [];
        await user.save();

        return res.json({ message: '2FA disabilitata' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Errore interno' });
    }
});

// 1) setup 2FA (protetto da cookie)
router.post("/setup", async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });
    const secret = speakeasy.generateSecret({ name: `GreenOpsAI: ${user.email}` });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qr: qrDataUrl });
});

// 2) verify iniziale / attivazione (protetto)
router.post("/verify", async (req, res) => {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: "Setup 2FA non inizializzato" });
    }
    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1,
    });
    if (!isValid) return res.status(400).json({ error: "Token non valido" });
    user.twoFactorEnabled = true;
    user.recoveryCodes = Array.from({ length: 10 }).map(() => ({
        code: uuidv4().slice(0, 8),
        used: false,
    }));
    await user.save();
    res.json({ recoveryCodes: user.recoveryCodes.map((c) => c.code) });
});

// 3) challenge / authenticate (NO cookie required!)
async function authenticateHandler(req, res) {
    const { twoFaToken, token, deviceId, useRecoveryCode } = req.body;

    // 3.1 decodifica il twoFaToken
    let payload;
    try {
        payload = jwt.verify(twoFaToken, jwtSecret);
        console.log(payload);
        if (!payload.twoFa) throw new Error();
    } catch {
        return res.status(401).json({ error: "Sessione 2FA non valida o scaduta" });
    }

    // 3.2 carica l’utente dal payload
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // 3.3 verifica OTP o recovery
    let valid = false;
    if (useRecoveryCode) {
        const rc = user.recoveryCodes.find((c) => c.code === token && !c.used);
        if (rc) {
            rc.used = true;
            valid = true;
        }
    } else {
        valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 1,
        });
    }
    if (!valid) {
        return res.status(400).json({ error: "Codice 2FA non valido" });
    }

    // 3.4 registra il device e salva
    const newDeviceId = deviceId || uuidv4();
    if (!user.twoFactorDevices.includes(newDeviceId)) {
        user.twoFactorDevices.push(newDeviceId);
    }
    await user.save();

    // 3.5 emetti il cookie managerToken
    const authToken = jwt.sign(
        {
            userId: user.id, role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        },
        jwtSecret,
        { expiresIn: "7d" }
    );
    return res
        .cookie("managerToken", authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        })
        .json({ deviceId: newDeviceId });
}

module.exports = {
    router,
    authenticateHandler,
};
