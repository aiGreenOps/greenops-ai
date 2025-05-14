const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

connectDB();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const healthRoutes = require("./routes/health.routes");
app.use("/health", healthRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});
