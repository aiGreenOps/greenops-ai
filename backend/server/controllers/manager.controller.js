// controllers/manager.controller.js

const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const RejectedUser = require("../models/rejectedUser.model");
const transporter = require("../config/mailer.config");
const { jwtSecret } = require("../config/jwt.config");

// GET /api/manager/users/pending
// restituisce solo i maintainer in status "pending"
exports.getPending = async (req, res, next) => {
    try {
        const users = await User.find({ status: "pending", role: "maintainer" })
            .select("firstName lastName email _id");
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/manager/users/:id/approve
exports.approve = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== "maintainer") {
            return res.status(404).json({ message: "Maintainer non trovato" });
        }

        user.status = "active";
        await user.save();

        // invio mail di approvazione
        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Account approvato",
            html: `
        <h3>Ciao ${user.firstName},</h3>
        <p>Il tuo account come <strong>Manutentore</strong> è stato approvato.</p>
        <p><a href="${process.env.FRONTEND_URL}/auth/login">Vai al login</a></p>
      `,
        });

        res.json({ message: "Maintainer approvato e mail inviata" });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/manager/users/:id/reject
exports.reject = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== "maintainer") {
            return res.status(404).json({ message: "Maintainer non trovato" });
        }

        // archivia in RejectedUser
        const data = user.toObject();
        delete data._id;
        data.originalId = user._id;
        data.rejectedAt = new Date();
        data.reason = "Rifiutato dal manager";
        await RejectedUser.create(data);

        // invio mail di rifiuto
        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Account rifiutato",
            html: `
        <h3>Ciao ${user.firstName},</h3>
        <p>La tua richiesta di accesso come <strong>Manutentore</strong> è stata rifiutata.</p>
        <p><a href="${process.env.FRONTEND_URL}/auth/register">Registrati nuovamente</a></p>
      `,
        });

        // elimina da User
        await User.deleteOne({ _id: user._id });

        res.json({ message: "Maintainer rifiutato, mail inviata e record archiviato" });
    } catch (err) {
        next(err);
    }
};

// POST /api/manager/users/invite
// il manager può invitare nuovi manutentori
exports.invite = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email richiesta" });
        }

        // genera un token che include il ruolo "maintainer"
        const token = jwt.sign({ email, role: "maintainer" }, jwtSecret, {
            expiresIn: "1d",
        });
        // link per aprire l’app su mobile
        const appLink = `exp://192.168.1.183:8081/--/auth/register?invitationToken=${token}&role=maintainer&email=${email}`;
        console.log(appLink);
        // fallback web

        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Invito come Manutentore su GreenOps AI",
            html: `
        <p>Sei stato invitato come Manutentore.</p>
        <a href="${appLink}">Apri nell'app</a>
      `,
        });

        res.json({ message: "Link di invito inviato al manutentore" });
    } catch (err) {
        next(err);
    }
};
