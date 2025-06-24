// seedReports.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ReportMobile = require('../models/report-mobile.model'); // aggiorna il path se necessario

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/greenops';

const userId = '68596a503cc4d24c76a1ade9';

const reports = [
    {
        title: 'Broken irrigation pipe',
        description: 'Water is leaking near the north garden. Needs urgent repair.',
        location: 'North',
        priority: 'urgent',
        status: 'pending',
    },
    {
        title: 'Low soil moisture in east area',
        description: 'Sensor shows very low moisture level, might require irrigation.',
        location: 'East',
        priority: 'high',
        status: 'pending',
    },
    {
        title: 'Tree branch fallen',
        description: 'A large branch fell after the storm, blocking the path.',
        location: 'West',
        priority: 'medium',
        status: 'accepted',
    },
    {
        title: 'Weeds spreading in flowerbed',
        description: 'Weeds are spreading too fast in the flowerbed near the south entrance.',
        location: 'South',
        priority: 'low',
        status: 'pending',
    },
    {
        title: 'Suspicious fungus on hedges',
        description: 'White spots noticed on several hedge plants, might be fungal infection.',
        location: 'East',
        priority: 'medium',
        status: 'rejected',
    },
    {
        title: 'Lights not working in garden path',
        description: 'Several pathway lights in the central garden are not functioning.',
        location: 'Central',
        priority: 'high',
        status: 'accepted',
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('🔌 Connected to DB');

        await ReportMobile.deleteMany({});
        console.log('🧹 Cleared existing reports');

        const withUser = reports.map(r => ({
            ...r,
            submittedBy: userId,
            submittedAt: new Date(),
            photos: [],
        }));

        const created = await ReportMobile.insertMany(withUser);
        console.log(`✅ Inserted ${created.length} reports`);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        mongoose.disconnect();
    }
}

seed();
