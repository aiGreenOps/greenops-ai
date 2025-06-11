const Activity = require('../models/activity.model');

exports.createActivity = async (req, res) => {
    try {
        const activity = new Activity(req.body);
        await activity.save();
        res.status(201).json(activity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllActivities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ scheduledAt: 1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero delle attività' });
    }
};


exports.deleteActivity = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Activity.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.status(204).end();
    } catch (err) {
        console.error('Error deleting activity:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

