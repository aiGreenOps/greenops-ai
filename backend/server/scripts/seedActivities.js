const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Activity = require('../models/activity.model');

const types = ['maintenance', 'pruning', 'fertilizing', 'repair'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['scheduled', 'inProgress', 'completed'];
const locations = ['North', 'South', 'East', 'West'];

const titles = {
    maintenance: 'Irrigation System Check',
    pruning: 'Tree Pruning Operation',
    fertilizing: 'Fertilizer Application',
    repair: 'Irrigation Repair',
    inspection: 'Green Area Inspection',
};

const descriptions = {
    maintenance: `Inspect the irrigation system in the designated area. Check water pressure, detect possible leaks, ensure all sprinklers are functioning, and verify timer automation.`,
    pruning: `Perform pruning of trees and shrubs according to seasonal guidelines. Remove dry or dangerous branches and promote healthy plant growth.`,
    fertilizing: `Apply fertilizers to nutrient-deficient zones. Follow dosage instructions, observe plant reactions, and note any abnormal signs.`,
    repair: `Urgently repair broken or malfunctioning irrigation components. Inspect pipes, joints, valves and replace defective parts if needed.`,
    inspection: `Conduct a visual inspection of the green area. Assess plant condition, soil cleanliness, and watch for signs of pests or diseases.`,
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

        for (let i = 0; i < 18; i++) {
            const type = getRandom(types);
            const priority = getRandom(priorities);
            const status = i < 10 ? 'scheduled' : getRandom(statuses);
            const location = getRandom(locations);
            const scheduledAt = generateDate(Math.floor(Math.random() * 5), 8 + (i % 5) * 2);

            activities.push({
                title: `${titles[type]} #${i + 1}`,
                description: descriptions[type],
                type,
                priority,
                status,
                location,
                scheduledAt,
            });
        }

        await Activity.insertMany(activities);
        console.log('✔️  Seed activities inserted successfully.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.disconnect();
    }
};

seedActivities();
