const axios = require("axios");

const OPENCAGE_API_KEY = "d5a6115e35f1437b8bf1cc9f68de8782";

async function reverseGeocode(lat, lon) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}&language=it`;

    try {
        const res = await axios.get(url);
        const result = res.data.results[0];

        if (!result) return null;

        const city = result.components.city || result.components.town || result.components.village;
        const state = result.components.state;
        const country = result.components.country;

        return `${city}, ${state}, ${country}`; // es. "Bari, Puglia, Italia"
    } catch (err) {
        console.error("❌ Errore reverse geocoding:", err.message);
        return null;
    }
}

module.exports = { reverseGeocode };
