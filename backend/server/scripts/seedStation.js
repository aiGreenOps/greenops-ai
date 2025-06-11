const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Station = require('../models/station.model');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    await Station.deleteMany();

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await Station.insertMany([
        {
            name: 'North',
            coordinates: { lat: 40.7528, lon: 17.3271 },
            status: 'healthy',
            plantType: 'ulivi',
            lastIrrigation: twoDaysAgo,
            lastPruning: twoDaysAgo,
            lastFertilization: twoDaysAgo,
        },
        {
            name: 'South',
            coordinates: { lat: 40.7495, lon: 17.3269 },
            status: 'healthy',
            plantType: 'siepe',
            lastIrrigation: twoDaysAgo,
            lastPruning: twoDaysAgo,
            lastFertilization: twoDaysAgo,
        },
        {
            name: 'East',
            coordinates: { lat: 40.7511, lon: 17.3299 },
            status: 'healthy',
            plantType: 'prato',
            lastIrrigation: twoDaysAgo,
            lastPruning: twoDaysAgo,
            lastFertilization: twoDaysAgo,
        },
        {
            name: 'West',
            coordinates: { lat: 40.7512, lon: 17.3225 },
            status: 'healthy',
            plantType: 'aiuole',
            lastIrrigation: twoDaysAgo,
            lastPruning: twoDaysAgo,
            lastFertilization: twoDaysAgo,
        },
    ]);

    console.log('Stazioni inizializzate con tipo di piante e date interventi');
    mongoose.disconnect();
};

seed();
