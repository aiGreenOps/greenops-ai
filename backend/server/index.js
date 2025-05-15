const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

connectDB().then(() => {
    app.listen(3001, () => {
        console.log("🚀 Server avviato su http://localhost:3001");
    });
});
