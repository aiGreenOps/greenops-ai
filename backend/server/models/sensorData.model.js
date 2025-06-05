const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
    stationId: String,
    temperature: Number,
    humidity: Number,
    light: Number,
    rain: Number,
    timestamp: { type: Date }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
