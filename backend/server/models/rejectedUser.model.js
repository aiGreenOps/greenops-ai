const mongoose = require("mongoose");

const RejectedUserSchema = new mongoose.Schema({
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    fiscalCode: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "manager" },
    rejectedAt: { type: Date, default: Date.now },
    reason: { type: String },           // opzionale: puoi salvare un motivo
});

module.exports = mongoose.model("RejectedUser", RejectedUserSchema);
