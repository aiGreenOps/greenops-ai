const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Activity = require('../models/activity.model');

const types = ['maintenance', 'pruning', 'fertilizing', 'repair'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['scheduled', 'inProgress', 'completed'];
const locations = ['North', 'South', 'East', 'West'];

const titles = {
    maintenance: 'Routine Maintenance',
    pruning: 'Tree Pruning',
    fertilizing: 'Fertilizer Distribution',
    repair: 'System Repair',
};

const descriptions = {
    maintenance: 'Scheduled maintenance for garden area.',
    pruning: 'Pruning session to promote plant growth.',
    fertilizing: 'Fertilizer application to nutrient-deficient areas.',
    repair: 'Urgent repair to broken irrigation system.',
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateDate = (daysFromNow, hour) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
};

const seedActivities = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Activity.deleteMany();

        const activities = [];

        for (let i = 0; i < 12; i++) {
            const type = getRandom(types);
            const priority = getRandom(priorities);
            const status = getRandom(statuses);
            const location = getRandom(locations);
            const scheduledAt = generateDate(Math.floor(Math.random() * 6), 8 + (i % 5) * 2);

            activities.push({
                title: titles[type] + ` #${i + 1}`,
                description: descriptions[type],
                type,
                priority,
                status,
                location,
                scheduledAt,
            });
        }

        await Activity.insertMany(activities);
        console.log('✔️  Attività seed inserite con successo.');
    } catch (err) {
        console.error('Errore:', err);
    } finally {
        mongoose.disconnect();
    }
};

seedActivities();
