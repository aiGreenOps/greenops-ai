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
            subject: "Account approvato – GreenOps AI",
            html: `
              <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; padding:30px; border-radius:8px;">
                <h2 style="margin-bottom:15px; color:#0b6c37;">Benvenuto su GreenOps AI!</h2>
          
                <p style="font-size:16px; color:#333;">
                  Ciao <strong>${user.firstName}</strong>,
                </p>
          
                <p style="font-size:16px; color:#333;">
                  Il tuo account è stato <strong>approvato</strong> e ora puoi accedere alla piattaforma GreenOps AI per iniziare a contribuire alla manutenzione sostenibile del verde aziendale.
                </p>
          
                <div style="margin:30px 0;">
                  <a href="http://localhost:3000/dashboard/auth/login" style="background-color:#0b6c37; color:#fff; padding:14px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">
                    Vai alla Dashboard
                  </a>
                </div>
          
                <p style="font-size:14px; color:#666;">
                  In caso di problemi, contatta il supporto tecnico o il tuo responsabile di struttura.
                </p>
          
                <p style="font-size:12px; color:#999; margin-top:40px;">
                  © 2025 GreenOps AI – Tutti i diritti riservati
                </p>
              </div>
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
            subject: "Account rifiutato – GreenOps AI",
            html: `
              <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; padding:30px; border-radius:8px;">
                <h2 style="margin-bottom:15px; color:#a50000;">Richiesta rifiutata</h2>
          
                <p style="font-size:16px; color:#333;">
                  Ciao <strong>${user.firstName}</strong>,
                </p>
          
                <p style="font-size:16px; color:#333;">
                  La tua richiesta di registrazione su GreenOps AI è stata <strong>rifiutata</strong> dall'amministratore. Questo può dipendere da informazioni incomplete o da requisiti non soddisfatti.
                </p>
          
                <div style="margin:30px 0;">
                  <a href="http://localhost:3000/auth/register" style="background-color:#a50000; color:#fff; padding:14px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">
                    Registrati nuovamente
                  </a>
                </div>
          
                <p style="font-size:14px; color:#666;">
                  Se ritieni che si tratti di un errore, puoi contattare il responsabile o ripetere la procedura di registrazione con dati aggiornati.
                </p>
          
                <p style="font-size:12px; color:#999; margin-top:40px;">
                  © 2025 GreenOps AI – Tutti i diritti riservati
                </p>
              </div>
            `,
        });


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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Questa email è già registrata." });
        }

        const token = jwt.sign({ email, role: "manager" }, jwtSecret, {
            expiresIn: "1d",
        });
        const invitationUrl = `${process.env.FRONTEND_URL}/auth/register?invitationToken=${token}`;

        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Invito come Manager su GreenOps AI",
            html: `
            <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; padding:30px; border-radius:8px;">
              <div>
                <h2 style="margin-bottom:15px; color:#0b6c37;">Invito come Manager</h2>
              </div>
          
              <p style="font-size:16px; color:#333;">
                Sei stato invitato a unirti a <strong>GreenOps AI</strong> come <strong>Manager</strong>.
              </p>
          
              <p style="font-size:16px; color:#333;">
                Per completare la registrazione, clicca sul pulsante qui sotto:
              </p>
          
              <div style="margin:30px 0;">
                <a href="${invitationUrl}" style="background-color:#0b6c37; color:#fff; padding:14px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">
                  Completa la Registrazione
                </a>
              </div>
          
              <p style="font-size:14px; color:#666;">
                Se non hai richiesto questo invito, puoi ignorare questa email.
              </p>
          
              <p style="font-size:12px; color:#999; margin-top:40px;">
                © 2025 GreenOps AI – Tutti i diritti riservati
              </p>
            </div>
            `,
        });

        res.json({ message: "Link di invito inviato" });
    } catch (err) {
        next(err);
    }
};
