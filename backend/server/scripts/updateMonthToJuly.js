const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Activity = require('../models/activity.model');

const updateActivitiesToEarlyJuly = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const activities = await Activity.find();

        for (const activity of activities) {
            const day = Math.floor(Math.random() * 9) + 1; // giorno da 1 a 9

            const updatedScheduled = new Date(activity.scheduledAt);
            updatedScheduled.setFullYear(2025);
            updatedScheduled.setMonth(6); // Luglio = 6
            updatedScheduled.setDate(day);

            const updatedCreated = new Date(activity.createdAt || activity._id.getTimestamp());
            updatedCreated.setFullYear(2025);
            updatedCreated.setMonth(6); // Luglio = 6
            updatedCreated.setDate(day);

            activity.scheduledAt = updatedScheduled;
            activity.createdAt = updatedCreated;

            await activity.save({ timestamps: false });
        }

        console.log(`✔️  Aggiornate ${activities.length} attività con giorno random tra 1 e 9 luglio 2025.`);
    } catch (err) {
        console.error("❌ Errore durante l'aggiornamento:", err);
    } finally {
        mongoose.disconnect();
    }
};

updateActivitiesToEarlyJuly();
