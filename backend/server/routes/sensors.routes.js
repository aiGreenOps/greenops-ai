// routes/sensors.routes.js (o simile)
const express = require('express');
const router = express.Router();
const AggregatedSensorData = require('../models/aggregatedSensorData.model');
const SensorData = require('../models/sensorData.model');
const Sensor = require('../models/sensor.model');

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

router.get('/latest/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;
        const latest = await SensorData.findOne({ stationId })
            .sort({ timestamp: -1 });

        if (!latest) {
            return res.status(404).json({ message: 'No data found' });
        }

        res.json(latest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const sensors = await Sensor.find().populate('station');
        res.json(sensors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Filtro opzionale per stazione e tipo
router.get('/filter', async (req, res) => {
    const { stationId, sensorType } = req.query;
    const query = {};
    if (stationId) query.station = stationId;
    if (sensorType) query.sensorType = sensorType;

    try {
        const sensors = await Sensor.find(query).populate('station');
        res.json(sensors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
