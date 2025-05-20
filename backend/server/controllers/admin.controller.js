// controllers/admin.controller.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const RejectedUser = require("../models/rejectedUser.model");
const transporter = require("../config/mailer.config");
const { jwtSecret } = require("../config/jwt.config");

// GET /api/admin/users/pending
exports.getPending = async (req, res, next) => {
    try {
        const users = await User.find({ status: "pending" })
            .select("firstName lastName email _id");
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/admin/users/:id/approve
exports.approve = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        user.status = "active";
        await user.save();

        // invio mail
        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Account approvato",
            html: `
        <h3>Ciao ${user.firstName},</h3>
        <p>Il tuo account è stato <strong>approvato</strong>.</p>
        <p><a href="http://localhost:3000/dashboard/user">Vai alla dashboard</a></p>
      `,
        });

        res.json({ message: "Utente approvato e mail inviata" });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/admin/users/:id/reject
exports.reject = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        // archivia in RejectedUser
        const data = user.toObject();
        delete data._id;
        data.originalId = user._id;
        data.rejectedAt = new Date();
        data.reason = "Rifiutato dall’admin";
        await RejectedUser.create(data);

        // invio mail di rifiuto
        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Account rifiutato",
            html: `
        <h3>Ciao ${user.firstName},</h3>
        <p>La tua richiesta di accesso è stata <strong>rifiutata</strong>.</p>
        <p><a href="http://localhost:3000/auth/register">Registrati nuovamente</a></p>
      `,
        });

        // elimina da User
        await User.deleteOne({ _id: user._id });

        res.json({ message: "Utente rifiutato, mail inviata e record archiviato" });
    } catch (err) {
        next(err);
    }
};

// POST /api/admin/users/invite
exports.invite = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email richiesta" });

        const token = jwt.sign({ email, role: "manager" }, jwtSecret, {
            expiresIn: "1d",
        });
        const invitationUrl = `${process.env.FRONTEND_URL}/auth/register?invitationToken=${token}`;

        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Invito come Manager su GreenOps AI",
            html: `
        <p>Sei stato invitato come Manager.</p>
        <a href="${invitationUrl}">Completa la registrazione</a>
      `,
        });

        res.json({ message: "Link di invito inviato" });
    } catch (err) {
        next(err);
    }
};
