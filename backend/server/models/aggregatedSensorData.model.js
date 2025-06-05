const mongoose = require('mongoose');

const AggregatedSensorSchema = new mongoose.Schema({
    temperature: Number,
    humidityPct: Number,
    lightPct: Number,
    rainPct: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AggregatedSensorData', AggregatedSensorSchema);
