const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Station = require('../models/station.model');

const seed = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("MONGO_URI non definito. Controlla il file .env");
        return;
    }

    await mongoose.connect(uri);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const updates = [
        {
            name: 'North',
            update: {
                plantType: 'ulivi',
                lastIrrigation: twoDaysAgo,
                lastPruning: twoDaysAgo,
                lastFertilization: twoDaysAgo,
            },
        },
        {
            name: 'South',
            update: {
                plantType: 'siepe',
                lastIrrigation: twoDaysAgo,
                lastPruning: twoDaysAgo,
                lastFertilization: twoDaysAgo,
            },
        },
        {
            name: 'East',
            update: {
                plantType: 'prato',
                lastIrrigation: twoDaysAgo,
                lastPruning: twoDaysAgo,
                lastFertilization: twoDaysAgo,
            },
        },
        {
            name: 'West',
            update: {
                plantType: 'aiuole',
                lastIrrigation: twoDaysAgo,
                lastPruning: twoDaysAgo,
                lastFertilization: twoDaysAgo,
            },
        },
    ];

    for (const { name, update } of updates) {
        await Station.updateOne({ name }, { $set: update });
    }

    console.log('Stazioni aggiornate');
    mongoose.disconnect();
};

seed();
