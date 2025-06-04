const mongoose = require("mongoose");

const recoveryCodeSchema = new mongoose.Schema({
    code: { type: String, required: true },
    used: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    fiscalCode: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["admin", "manager", "maintainer", "employee"], default: "manager" },
    profilePicture: { type: String, default: null },
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
    recoveryCodes: [recoveryCodeSchema],
    twoFactorDevices: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
