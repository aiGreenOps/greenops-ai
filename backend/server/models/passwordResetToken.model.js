const mongoose = require("mongoose");

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    token: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model("PasswordResetToken", PasswordResetTokenSchema);
