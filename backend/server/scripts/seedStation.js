const mongoose = require('mongoose');
require('dotenv').config();
const Station = require('../models/station.model');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    await Station.deleteMany();

    await Station.insertMany([
        { name: 'North', coordinates: { lat: 40.7528, lon: 17.3271 }, status: 'healthy' },
        { name: 'South', coordinates: { lat: 40.7495, lon: 17.3269 }, status: 'healthy' },
        { name: 'East', coordinates: { lat: 40.7511, lon: 17.3299 }, status: 'healthy' },
        { name: 'West', coordinates: { lat: 40.7512, lon: 17.3225 }, status: 'healthy' },
    ]);

    console.log('Stazioni inizializzate');
    mongoose.disconnect();
};

seed();
