const mongoose = require('mongoose');

const reportMobileSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high', 'urgent'] },
    photos: [{ type: String }],
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

module.exports = mongoose.model('ReportMobile', reportMobileSchema);
