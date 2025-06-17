const mongoose = require('mongoose');

const irrigationSchema = new mongoose.Schema({
    stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true,
    },
    plantType: {
        type: String,
        required: true,
        enum: ['ulivi', 'siepe', 'prato', 'aiuole'],
    },
    method: {
        type: String,
        enum: ['automatic', 'manual'],
        required: true
    },
    startedAt: {
        type: Date,
        required: true
    },
    endedAt: {
        type: Date,
        default: null
    },
    durationMinutes: {
        type: Number, // es. 10 = 10 minuti
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IrrigationEvent', irrigationSchema);
