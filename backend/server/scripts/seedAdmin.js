// scripts/seedAdmin.js
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

/**
 * Crea un admin “di default” se non esiste già.
 * Legge EMAIL e PASSWORD da env: ADMIN_EMAIL, ADMIN_PASSWORD.
 */
async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const pwd = process.env.ADMIN_PASSWORD;

    if (!email || !pwd) {
        console.warn(
            "[seedAdmin] Variabili ADMIN_EMAIL / ADMIN_PASSWORD non definite: salto il seed."
        );
        return;
    }

    const exists = await User.findOne({ email, role: "admin" });
    if (exists) {
        console.log("[seedAdmin] Admin già presente, skip.");
        return;
    }

    const hash = await bcrypt.hash(pwd, 10);
    await User.create({
        firstName: "Super",
        lastName: "Admin",
        email,
        passwordHash: hash,
        role: "admin",
        emailVerified: true,
        status: "active",
    });

    console.log(`[seedAdmin] Admin creato: ${email}`);
}

module.exports = seedAdmin;
