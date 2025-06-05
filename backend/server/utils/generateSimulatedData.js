function generateSimulatedData(baseData) {
    const vary = (val, range) => {
        const num = Number(val);
        if (isNaN(num)) return 0;
        return Math.max(0, +(num + ((Math.random() * 2 - 1) * range)).toFixed(2));
    };

    return Array.from({ length: 3 }, (_, i) => ({
        stationId: `station-${i + 2}`,
        temperature: vary(baseData.temperature, 0.1),  // prima 0.4
        humidity: vary(baseData.humidity, 0.3),        // prima 1
        light: vary(baseData.light, 2),                // prima 5
        rain: vary(baseData.rain, 0.5),                // prima 2
        timestamp: new Date()
    }));
}

module.exports = generateSimulatedData;
