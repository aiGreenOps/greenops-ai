const Station = require("../models/station.model");
const IrrigationEvent = require("../models/irrigation.model");

exports.startIrrigation = async (req, res) => {
    const { stationId, method = "manual" } = req.body;
    try {
        const station = await Station.findById(stationId);
        if (!station) return res.status(404).json({ message: "Station not found." });

        if (station.isIrrigating)
            return res.status(400).json({ message: "Irrigation is already running for this station." });

        station.isIrrigating = true;
        station.irrigationStartTime = new Date();
        await station.save();

        await IrrigationEvent.create({
            stationId: station._id,
            plantType: station.plantType,
            method,
            startedAt: station.irrigationStartTime
        });

        res.json({ message: "Irrigation started successfully." });
    } catch (err) {
        console.error("Error starting irrigation:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.stopIrrigation = async (req, res) => {
    const { stationId } = req.body;
    try {
        const station = await Station.findById(stationId);
        if (!station || !station.isIrrigating)
            return res.status(400).json({ message: "No active irrigation to stop." });

        const now = new Date();
        const start = new Date(station.irrigationStartTime);
        const durationMinutes = Math.round((now - start) / 60000);

        await IrrigationEvent.findOneAndUpdate(
            { stationId, endedAt: null },
            { endedAt: now, durationMinutes }
        );

        station.isIrrigating = false;
        station.irrigationStartTime = null;
        station.lastIrrigation = now;
        await station.save();

        res.json({ message: "Irrigation stopped successfully." });
    } catch (err) {
        console.error("Error stopping irrigation:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
