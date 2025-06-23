const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['maintenance', 'pruning', 'fertilizing', 'repair'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    location: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'inProgress', 'completed'], default: 'scheduled' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    acceptedAt: { type: Date, default: null },  // nuovo campo
    completedAt: { type: Date, default: null }, // nuovo campo
    createdAt: { type: Date, default: Date.now },
    generatedByAI: { type: Boolean, default: false }
});

module.exports = mongoose.model('Activity', activitySchema);
