const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['North', 'South', 'East', 'West'],
        required: true,
        unique: true,
    },
    coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
    },
    status: {
        type: String,
        enum: ['healthy', 'warning', 'critical'],
        default: 'healthy',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Station', stationSchema);
