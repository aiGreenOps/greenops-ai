const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.config");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const passport = require("passport");
const path = require("path");
const adminRoutes = require("./routes/admin.routes");

require("./config/passport.config");

dotenv.config();

const app = express();

app.use("/api/admin", adminRoutes);
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

connectDB().then(() => {
    app.listen(3001, () => {
        console.log("🚀 Server avviato su http://localhost:3001");
    });
});
