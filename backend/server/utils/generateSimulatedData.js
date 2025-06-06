function generateSimulatedData(baseData) {
    const vary = (val, range) => {
        const num = Number(val);
        if (isNaN(num)) return 0;
        return Math.max(0, +(num + ((Math.random() * 2 - 1) * range)).toFixed(2));
    };

    return Array.from({ length: 3 }, () => ({
        temperature: vary(baseData.temperature, 0.1),
        humidity: vary(baseData.humidity, 0.3),
        light: vary(baseData.light, 2),
        rain: vary(baseData.rain, 0.5),
        timestamp: new Date()
    }));
}

module.exports = generateSimulatedData;
