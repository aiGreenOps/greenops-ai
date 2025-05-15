require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const start = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: "greenops.ai@gmail.com" });

    if (existing) {
        console.log("❌ Admin già esistente.");
        return process.exit(0);
    }

    const passwordHash = await bcrypt.hash("GreenOpsAi2025!", 10);
    await User.create({
        firstName: "Giovanni",
        lastName: "Nardelli",
        email: "greenops.ai@gmail.com",
        passwordHash,
        role: "admin",
        status: "active",
        emailVerified: true
    });

    console.log("✅ Admin creato con successo.");
    process.exit(0);
};

start();
