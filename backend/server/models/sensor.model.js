const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true }, // ← aggiunto
    sensorType: {
        type: String,
        enum: ['temperature', 'humidity', 'rain', 'light'],
        required: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'warning', 'maintenance'],
        default: 'online'
    },
    battery: { type: Number, min: 0, max: 100, required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sensor', sensorSchema);
