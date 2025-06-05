// routes/sensors.routes.js (o simile)
const express = require('express');
const router = express.Router();
const AggregatedSensorData = require('../models/aggregatedSensorData.model');
const SensorData = require('../models/sensorData.model');

router.get('/latest', async (req, res) => {
    try {
        const aggregated = await AggregatedSensorData.findOne().sort({ timestamp: -1 });
        const stations = await SensorData.find({ timestamp: aggregated.timestamp });

        return res.json({ aggregated, stations });
    } catch (e) {
        console.error('❌ Errore /api/sensors/latest:', e.message);
        return res.status(500).json({ error: 'Errore interno' });
    }
});


router.get('/today', async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0); // oggi alle 00:00

        const data = await AggregatedSensorData.find({
            timestamp: { $gte: start }
        }).sort({ timestamp: 1 });

        res.json(data);
    } catch (err) {
        console.error('❌ Errore /api/sensors/today:', err.message);
        res.status(500).json({ error: 'Errore interno' });
    }
});

module.exports = router;
