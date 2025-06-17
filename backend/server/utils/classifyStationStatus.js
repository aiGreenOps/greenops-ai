const Station = require("../models/station.model");
const IrrigationEvent = require("../models/irrigation.model");
const { getMeteo } = require("../utils/meteo");

function getDaysSince(date) {
    if (!date) return Infinity;
    const now = new Date();
    const then = new Date(date);
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function getIrrigationDurationByPlantType(plantType) {
    switch (plantType) {
        case "prato":
            return 5 * 60 * 1000; // 5 minuti
        case "aiuole":
            return 7 * 60 * 1000; // 7 minuti
        case "siepe":
            return 10 * 60 * 1000; // 10 minuti
        case "ulivi":
        default:
            return 15 * 60 * 1000; // 15 minuti
    }
}

function getThresholdsByPlantType(plantType) {
    switch (plantType) {
        case "prato":
        case "aiuole":
            return {
                moistureCritical: 30,
                moistureWarning: 50,
                tempCritical: 30,
                humidityCritical: 50,
                dryDaysCritical: 1,
                dryDaysWarning: 0
            };
        case "siepe":
            return {
                moistureCritical: 25,
                moistureWarning: 40,
                tempCritical: 32,
                humidityCritical: 45,
                dryDaysCritical: 2,
                dryDaysWarning: 1
            };
        case "ulivi":
        default:
            return {
                moistureCritical: 20,
                moistureWarning: 35,
                tempCritical: 34,
                humidityCritical: 40,
                dryDaysCritical: 3,
                dryDaysWarning: 2
            };
    }
}

function isCritical(station, meteo) {
    const t = getThresholdsByPlantType(station.plantType);

    const lowMoisture = station.rain < t.moistureCritical;
    const highTemp = station.temperature > t.tempCritical;
    const lowHumidity = station.humidity < t.humidityCritical;
    const dryDays = getDaysSince(station.lastIrrigation) > t.dryDaysCritical;
    const noRainToday = meteo?.precipitation === 0;

    return lowMoisture && highTemp && lowHumidity && dryDays && noRainToday;
}


function isWarning(station) {
    const t = getThresholdsByPlantType(station.plantType);

    const lowMoisture = station.rain < t.moistureWarning;
    const dryDays = getDaysSince(station.lastIrrigation) > t.dryDaysWarning;

    return lowMoisture && dryDays;
}

async function classifyAndHandleIrrigation(stationsWithDetails, io) {
    const alerts = [];
    let anyChanges = false;

    for (const station of stationsWithDetails) {
        const meteo = await getMeteo(station.coordinates.lat, station.coordinates.lon);
        let newStatus = "healthy";

        if (isCritical(station, meteo)) {
            newStatus = "critical";
        } else if (isWarning(station)) {
            newStatus = "warning";
        }

        // Recupera la versione attuale dal DB per sicurezza
        const actual = await Station.findById(station._id).lean();
        const statusChanged = actual.status !== newStatus;
        const shouldStartIrrigation = newStatus === "critical" && !actual.isIrrigating;

        if (statusChanged || shouldStartIrrigation) {
            if (statusChanged) {
                await Station.findByIdAndUpdate(station._id, { status: newStatus });
            }

            if (shouldStartIrrigation) {
                console.log(`🚨 AUTO IRRIGAZIONE per ${station.name}`);

                const durationMs = getIrrigationDurationByPlantType(station.plantType);
                const durationMinutes = durationMs / 60000;

                await IrrigationEvent.create({
                    stationId: station._id,
                    plantType: station.plantType,
                    method: "automatic",
                    startedAt: new Date(),
                    durationMinutes // ✅ nuovo campo
                });


                await Station.findByIdAndUpdate(station._id, {
                    isIrrigating: true,
                    irrigationStartTime: new Date()
                });
            }

            alerts.push({
                stationId: station._id,
                stationName: station.name,
                newStatus,
                timestamp: new Date().toISOString(),
                description:
                    newStatus === "critical"
                        ? `Automatic irrigation started in ${station.name} Garden`
                        : newStatus === "warning"
                            ? `Dry soil detected in ${station.name} Garden`
                            : `All conditions are normal in ${station.name} Garden`

            });

            anyChanges = true;
        }
    }

    if (anyChanges) {
        const updatedStations = await Station.find().lean();
        io.emit("station-alert", {
            timestamp: new Date().toISOString(),
            alerts,
            stations: updatedStations
        });
    }
}

module.exports = { classifyAndHandleIrrigation };
