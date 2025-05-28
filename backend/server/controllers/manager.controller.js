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
            subject: "Account approvato – GreenOps AI",
            html: `
    <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; padding:30px; border-radius:8px;">
      <h2 style="margin-bottom:15px; color:#0b6c37;">Account approvato</h2>

      <p style="font-size:16px; color:#333;">
        Ciao <strong>${user.firstName}</strong>,
      </p>

      <p style="font-size:16px; color:#333;">
        La tua richiesta di accesso come <strong>Manutentore</strong> su GreenOps AI è stata approvata!
      </p>

      <div style="margin:24px 0;">
        <a href="exp://192.168.1.183:8081/--/auth/login" style="background-color:#0b6c37; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">
          Vai al Login sull'app
        </a>
      </div>

      <p style="font-size:14px; color:#666;">
        Se il pulsante non funziona, puoi aprire direttamente l’app e accedere manualmente.
      </p>

      <p style="font-size:12px; color:#999; margin-top:40px;">
        © 2025 GreenOps AI – Tutti i diritti riservati
      </p>
    </div>
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
            subject: "Account rifiutato – GreenOps AI",
            html: `
              <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; padding:30px; border-radius:8px;">
                <h2 style="margin-bottom:15px; color:#a50000;">Richiesta rifiutata</h2>
          
                <p style="font-size:16px; color:#333;">
                  Ciao <strong>${user.firstName}</strong>,
                </p>
          
                <p style="font-size:16px; color:#333;">
                  La tua richiesta di registrazione come <strong>Manutentore</strong> su GreenOps AI è stata <strong>rifiutata</strong> dal responsabile.
                </p>
          
                <p style="font-size:16px; color:#333;">
                  Puoi correggere eventuali dati e riprovare:
                </p>
          
                <div style="margin:24px 0;">
                  <a href="exp://192.168.1.183:8081/--/auth/register" style="background-color:#a50000; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">
                    Registrati nuovamente
                  </a>
                </div>
          
                <p style="font-size:14px; color:#666;">
                  Se non hai richiesto tu la registrazione, puoi ignorare questa email.
                </p>
          
                <p style="font-size:12px; color:#999; margin-top:40px;">
                  © 2025 GreenOps AI – Tutti i diritti riservati
                </p>
              </div>
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
            return res.status(400).json({ message: "Email richiesta." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email è già registrata nel sistema." });
        }

        // genera un token che include il ruolo "maintainer"
        const token = jwt.sign({ email, role: "maintainer" }, jwtSecret, {
            expiresIn: "1d",
        });
        // link per aprire l’app su mobile
        const appLink = `exp://192.168.1.183:8081/--/auth/register?invitationToken=${token}&role=maintainer&email=${email}`;
        console.log(appLink);
        // fallback web
        const webLink = `http://192.168.1.183:3000/auth/register?invitationToken=${token}`;

        await transporter.sendMail({
            from: `"GreenOps AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Invito come Manutentore – GreenOps AI",
            html: `
        <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; padding:30px; border-radius:8px;">
          <h2 style="margin-bottom:15px; color:#0b6c37;">Invito a GreenOps AI</h2>

          <p style="font-size:16px; color:#333;">
            Ciao,<br />
            Sei stato invitato a registrarti su <strong>GreenOps AI</strong> come <strong>Manutentore</strong>.
          </p>

          <p style="font-size:16px; color:#333;">Se hai l'app installata, clicca sul pulsante qui sotto:</p>

          <div style="margin:20px 0;">
            <a href="${appLink}" style="background-color:#0b6c37; color:#fff; padding:12px 20px; border-radius:5px; text-decoration:none; font-weight:bold;">
              Apri nell'app
            </a>
          </div>

          <p style="font-size:14px; color:#666;">
            Se stai usando un computer o non riesci ad aprire l’app, <a href="${webLink}">clicca qui per registrarti dal browser</a>.
          </p>

          <p style="font-size:12px; color:#999; margin-top:40px;">
            © 2025 GreenOps AI – Tutti i diritti riservati
          </p>
        </div>
      `,
        });

        res.json({ message: "Link di invito inviato al manutentore" });
    } catch (err) {
        next(err);
    }
};
