const Station = require("../models/station.model");
const IrrigationEvent = require("../models/irrigation.model");

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

async function stopIrrigationIfDue(io) {
    const now = new Date();
    const stations = await Station.find({
        isIrrigating: true,
        irrigationStartTime: { $ne: null }
    });

    const stoppedStations = [];

    for (const station of stations) {
        const started = new Date(station.irrigationStartTime);
        const elapsed = now - started;

        const duration = getIrrigationDurationByPlantType(station.plantType);

        if (elapsed >= duration) {
            await Station.findByIdAndUpdate(station._id, {
                isIrrigating: false,
                irrigationStartTime: null,
                status: "healthy" // ✅ nuovo stato finale
            });

            await IrrigationEvent.updateOne(
                {
                    stationId: station._id,
                    method: "automatic",
                    endedAt: null
                },
                {
                    endedAt: now
                }
            );

            stoppedStations.push({
                stationId: station._id,
                stationName: station.name,
                plantType: station.plantType,
                endedAt: now.toISOString(),
                newStatus: "healthy"
            });


            console.log(`🛑 Auto-stopped irrigation for ${station.name}`);
        }
    }

    // ✅ Emit UNA SOLA VOLTA se ci sono stazioni fermate
    if (stoppedStations.length > 0 && io) {
        io.emit("irrigation-stopped-batch", {
            timestamp: now.toISOString(),
            stopped: stoppedStations
        });
    }
}

module.exports = stopIrrigationIfDue;
