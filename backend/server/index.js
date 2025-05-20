const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.config");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const passport = require("passport");
const seedAdmin = require("./scripts/seedAdmin");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const transporter = require("./config/mailer.config");

require("./config/passport.config");

const app = express();

const http = require("http");

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: { origin: "http://localhost:3000", credentials: true }
});

app.set("io", io);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

connectDB()
    .then(async () => {
        await seedAdmin();

        server.listen(3001, () =>
            console.log("🚀 Server avviato su http://localhost:3001")
        );
    })
    .catch((err) => {
        console.error("Errore avvio server:", err);
        process.exit(1);
    });
