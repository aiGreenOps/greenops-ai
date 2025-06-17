const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const http = require("http");
const dotenv = require("dotenv");
const cron = require("node-cron");
dotenv.config();
require("./config/passport.config");

const connectDB = require("./config/db.config");
const seedAdmin = require("./scripts/seedAdmin");
const Activity = require("./models/activity.model");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const sensorRoutes = require('./routes/sensors.routes');
const managerRoutes = require("./routes/manager.routes");
const aiRoutes = require("./routes/ai.routes");
const stationRoutes = require('./routes/station.routes');
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const activityRoutes = require('./routes/activity.routes');
const irrigationRoutes = require("./routes/irrigation.routes");
const reportRoutes = require('./routes/reports.routes');

const { eseguiRichiestaGiornalieraLLM } = require("./utils/eseguiRichiestaGiornalieraLLM");
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
app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/activities', activityRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use('/api/reports', reportRoutes);

connectDB()
    .then(async () => {
        await seedAdmin();

        const stopIrrigationIfDue = require("./scripts/autoStopIrrigation");

        cron.schedule("* * * * *", async () => {
            try {
                await stopIrrigationIfDue(io);
            } catch (err) {
                console.error("❌ Errore auto-stop irrigazione:", err);
            }
        });

        // ✅ Avvio cron job per analisi potatura/fertilizzazione ogni giorno alle 6:00
        cron.schedule("0 6 * * *", async () => {
            console.log("🧪 ESECUZIONE MANUALE DEL CRON LLM");
            try {
                const stazioniRaw = await Station.find().lean();

                const stazioni = stazioniRaw.map(s => ({
                    name: s.name.toLowerCase(),
                    plantType: s.plantType || "non specificato",
                    lastPruning: s.lastPruning
                        ? new Date(s.lastPruning).toISOString().split("T")[0]
                        : null,
                    lastFertilization: s.lastFertilization
                        ? new Date(s.lastFertilization).toISOString().split("T")[0]
                        : null
                }));

                const risultato = await eseguiRichiestaGiornalieraLLM({ stazioni });

                const oggi = new Date();
                const domaniAlle9 = new Date(oggi);
                domaniAlle9.setDate(domaniAlle9.getDate() + 1);
                domaniAlle9.setHours(9, 0, 0, 0);

                for (const [stationName, values] of Object.entries(risultato)) {
                    if (values.pruning) {
                        const exists = await Activity.findOne({
                            location: stationName,
                            type: "pruning",
                            status: { $in: ["scheduled", "inProgress"] }
                        });

                        if (!exists) {
                            const pruningTask = new Activity({
                                title: `Scheduled pruning - ${stationName}`,
                                description: values.pruningReason || `The AI system has detected the need for pruning at the ${stationName} station.`,
                                type: "pruning",
                                priority: "medium",
                                location: stationName,
                                scheduledAt: domaniAlle9,
                                generatedByAI: true
                            });
                            await pruningTask.save();
                            console.log(`🌿 Pruning activity created for ${stationName}`);
                        } else {
                            console.log(`⚠️ Pruning already scheduled or in progress for ${stationName}, skipping.`);
                        }
                    }

                    if (values.fertilization) {
                        const exists = await Activity.findOne({
                            location: stationName,
                            type: "fertilizing",
                            status: { $in: ["scheduled", "inProgress"] }
                        });

                        if (!exists) {
                            const fertilizingTask = new Activity({
                                title: `Scheduled fertilization - ${stationName}`,
                                description: values.fertilizationReason || `The AI system has detected the need for fertilization at the ${stationName} station.`,
                                type: "fertilizing",
                                priority: "medium",
                                location: stationName,
                                scheduledAt: domaniAlle9,
                                generatedByAI: true
                            });
                            await fertilizingTask.save();
                            console.log(`🌱 Fertilization activity created for ${stationName}`);
                        } else {
                            console.log(`⚠️ Fertilization already scheduled or in progress for ${stationName}, skipping.`);
                        }
                    }
                }

            } catch (err) {
                console.error("❌ Errore esecuzione LLM giornaliero:", err);
            }
        })

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

        const stationDetailsMap = {};
        for (const s of stations) {
            stationDetailsMap[s._id.toString()] = {
                _id: s._id,
                name: s.name,
                plantType: s.plantType,
                status: s.status,
                lastIrrigation: s.lastIrrigation,
                isIrrigating: s.isIrrigating,
                irrigationStartTime: s.irrigationStartTime,
                coordinates: s.coordinates
            };
        }

        if (Object.values(stationMap).some(v => !v)) {
            console.error("❌ Nomi stazioni nel DB non corrispondono a North/East/South/West");
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
                lightPct: avg.light.toFixed(1),
                rainPct: Math.min(100, ((avg.rain / 200) * 100)).toFixed(1),
                timestamp
            };

            try {
                await SensorData.insertMany(allEntries);
                await AggregatedSensorData.create(aggregated);

                const stationsWithDetails = allEntries.map(entry => {
                    const details = stationDetailsMap[entry.stationId.toString()] || {};
                    return {
                        ...entry,
                        ...details
                    };
                });

                const { classifyAndHandleIrrigation } = require("./utils/classifyStationStatus");
                await classifyAndHandleIrrigation(stationsWithDetails, io);

                const refreshedStations = await Station.find().lean();
                const updatedStationMap = {};
                for (const s of refreshedStations) {
                    updatedStationMap[s._id.toString()] = {
                        _id: s._id,
                        name: s.name,
                        plantType: s.plantType,
                        status: s.status,
                        lastIrrigation: s.lastIrrigation,
                        isIrrigating: s.isIrrigating,
                        irrigationStartTime: s.irrigationStartTime,
                        coordinates: s.coordinates
                    };
                }

                const updatedStationsWithDetails = allEntries.map(entry => {
                    const updated = updatedStationMap[entry.stationId.toString()] || {};
                    return {
                        ...entry,
                        ...updated
                    };
                });

                io.emit('sensor-update', {
                    aggregated,
                    stations: updatedStationsWithDetails
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
