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

exports.getActivitiesForMaintainer = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ message: 'Missing userId' });

        const activities = await Activity.find({
            $or: [
                { status: 'scheduled', assignedTo: null },
                { assignedTo: userId }
            ]
        }).sort({ scheduledAt: 1 });

        res.json(activities);
    } catch (err) {
        console.error('Error fetching maintainer activities:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

