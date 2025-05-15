const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

// GET utenti in attesa (pending)
router.get("/users/pending", authenticate, requireRole("admin"), async (req, res) => {
    const users = await User.find({ status: "pending" });
    res.json(users);
});

// PATCH approva utente
router.patch("/users/:id/approve", authenticate, requireRole("admin"), async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    user.status = "active";
    await user.save();

    res.json({ message: "Utente approvato" });
});

// PATCH rifiuta utente
router.patch("/users/:id/reject", authenticate, requireRole("admin"), async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    user.status = "rejected";
    await user.save();

    res.json({ message: "Utente rifiutato" });
});

router.get("/test", (req, res) => res.send("Admin API ok"));


module.exports = router;
