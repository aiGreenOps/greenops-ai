const mongoose = require('mongoose');
const Sensor = require('../models/sensor.model');
const Station = require('../models/station.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const sensorTypes = ['temperature', 'humidity', 'rain', 'light'];

const sensorModels = {
    temperature: ['DHT11'],
    humidity: ['DHT11'],
    rain: ['YL83'],
    light: ['LDR']
};

const possibleStatuses = ['online', 'maintenance', 'warning'];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedSensors() {
    await mongoose.connect(process.env.MONGO_URI);

    const stations = await Station.find();
    if (stations.length === 0) {
        console.error("❌ Nessuna stazione trovata. Esegui prima seedStation.js");
        return;
    }

    for (const station of stations) {
        for (const type of sensorTypes) {
            const model = getRandomElement(sensorModels[type]);
            const status = getRandomElement(possibleStatuses);
            const battery = Math.floor(Math.random() * 96) + 5; // 5–100

            const sensor = new Sensor({
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Sensor`,
                model,
                sensorType: type,
                status,
                battery,
                station: station._id
            });

            await sensor.save();
        }
    }

    console.log("✅ Sensori creati con successo.");
    mongoose.disconnect();
}

seedSensors();
