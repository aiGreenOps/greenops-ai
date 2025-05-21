// index.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
require("./config/passport.config");

const connectDB = require("./config/db.config");
const seedAdmin = require("./scripts/seedAdmin");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const managerRoutes = require("./routes/manager.routes");

// PRIMA: require del router + handler
const { router: twoFaRouter, authenticateHandler } = require("./routes/2fa.routes");
const { protect } = require("./middleware/auth.middleware"); // o path corretto

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: { origin: "http://localhost:3000", credentials: true },
});
app.set("io", io);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

// le tue altre route
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);

// ** CHALLENGE 2FA ** (senza cookie)
app.post("/api/2fa/authenticate", authenticateHandler);

// ** SETUP / VERIFY 2FA ** (con cookie)
app.use("/api/2fa", protect, twoFaRouter);

connectDB()
    .then(async () => {
        await seedAdmin();
        server.listen(3001, "0.0.0.0", () =>
            console.log("🚀 Server avviato su http://0.0.0.0:3001")
        );
    })
    .catch((err) => {
        console.error("Errore avvio server:", err);
        process.exit(1);
    });
