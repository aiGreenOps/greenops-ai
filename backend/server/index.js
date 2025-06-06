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
const sensorRoutes = require('./routes/sensors.routes');
const managerRoutes = require("./routes/manager.routes");
const aiRoutes = require("./routes/ai.routes");
const stationRoutes = require('./routes/station.routes');

const { router: twoFaRouter, authenticateHandler } = require("./routes/2fa.routes");
const { protect } = require("./middleware/auth.middleware");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: { origin: "http://localhost:3000", credentials: true },
});
app.set("io", io);

// MODELS & SENSOR
const sensorReader = require("../../iot/sensorReader");
const SensorData = require("./models/sensorData.model");
const AggregatedSensorData = require('./models/aggregatedSensorData.model');
const Station = require("./models/station.model");
const generateSimulatedData = require("./utils/generateSimulatedData");

// MIDDLEWARE
app.use(cors({
    origin: ["http://localhost:3000", "http://192.168.1.183:3000"],
    credentials: true
}));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);
app.use('/api/sensors', sensorRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/stations', stationRoutes);
app.post("/api/2fa/authenticate", authenticateHandler);
app.use("/api/2fa", protect, twoFaRouter);

connectDB()
    .then(async () => {
        await seedAdmin();

        // ✅ Mappa stazioni tramite nome
        const stations = await Station.find();
        if (stations.length !== 4) {
            throw new Error("⚠️ Devi avere esattamente 4 stazioni nel DB: North, South, East, West");
        }

        const stationMap = {
            North: stations.find(s => s.name.toLowerCase().includes('north'))?._id,
            East: stations.find(s => s.name.toLowerCase().includes('east'))?._id,
            South: stations.find(s => s.name.toLowerCase().includes('south'))?._id,
            West: stations.find(s => s.name.toLowerCase().includes('west'))?._id,
        };

        if (Object.values(stationMap).some(v => !v)) {
            console.error("❌ Nomi stazioni nel DB non corrispondono a North/East/South/West");
            console.log("🧭 stationMap:", stationMap);
            process.exit(1);
        }

        let lastSaveTimestamp = 0;

        sensorReader.on('data', async (realData) => {
            const parsed = {
                temperature: Number(realData.temp_dht),
                humidity: Number(realData.hum_dht),
                light: Number(realData.light),
                rain: Number(realData.rain),
            };

            const allValid = Object.values(parsed).every(val => typeof val === 'number' && !isNaN(val));
            if (!allValid) {
                console.warn("⚠️ Dati scartati perché non validi:", realData);
                return;
            }

            const now = Date.now();
            if (now - lastSaveTimestamp < 60000) return;

            const timestamp = new Date();

            const realEntry = {
                ...parsed,
                stationId: stationMap["North"],
                timestamp
            };

            const simulatedRaw = generateSimulatedData(parsed);
            const simulatedEntries = [
                { ...simulatedRaw[0], stationId: stationMap["East"], timestamp },
                { ...simulatedRaw[1], stationId: stationMap["South"], timestamp },
                { ...simulatedRaw[2], stationId: stationMap["West"], timestamp }
            ];

            const allEntries = [realEntry, ...simulatedEntries];

            const avg = {
                temperature: +(allEntries.reduce((a, b) => a + b.temperature, 0) / allEntries.length).toFixed(1),
                humidity: +(allEntries.reduce((a, b) => a + b.humidity, 0) / allEntries.length).toFixed(1),
                light: +(allEntries.reduce((a, b) => a + b.light, 0) / allEntries.length).toFixed(1),
                rain: +(allEntries.reduce((a, b) => a + b.rain, 0) / allEntries.length).toFixed(1),
            };

            const aggregated = {
                temperature: avg.temperature,
                humidityPct: ((avg.humidity / 100) * 100).toFixed(1),
                lightPct: Math.min(100, ((avg.light / 500) * 100)).toFixed(1),
                rainPct: Math.min(100, ((avg.rain / 200) * 100)).toFixed(1),
                timestamp
            };

            try {
                await SensorData.insertMany(allEntries);
                await AggregatedSensorData.create(aggregated);

                console.log("✅ aggregated:", aggregated);
                console.log("✅ allEntries (con stationId):", allEntries);

                io.emit('sensor-update', {
                    aggregated,
                    stations: allEntries
                });

                lastSaveTimestamp = now;
            } catch (e) {
                console.error('❌ Errore salvataggio:', e.message);
            }
        });

        server.listen(3001, "0.0.0.0", () =>
            console.log("🚀 Server avviato su http://0.0.0.0:3001")
        );
    })
    .catch((err) => {
        console.error("Errore avvio server:", err);
        process.exit(1);
    });
