const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    fiscalCode: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["admin", "manager", "maintainer", "employee"], default: "manager" },
    emailVerified: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["unverified", "pending", "active", "rejected"],
        default: "unverified"
    },
    authProvider: {
        type: String,
        enum: ["local", "google", "github", "discord"],
        default: "local"
    },
    providerId: {
        type: String,
        default: null
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
