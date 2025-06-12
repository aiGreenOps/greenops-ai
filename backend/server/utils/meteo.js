const axios = require("axios");

// ⚠️ Inserisci qui la tua vera API Key
const API_KEY = "2a7d990dc3356921da56c605e3befbba";

async function getMeteo(lat, lon) {
  try {
    // 1. Meteo attuale
    const attualeURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`;
    const attualeRes = await axios.get(attualeURL);
    const attuale = attualeRes.data;
    const pioveOra = attuale.weather[0].main.toLowerCase().includes("rain");

    // 2. Previsioni (ogni 3h per 5 giorni)
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`;
    const forecastRes = await axios.get(forecastURL);
    const forecast = forecastRes.data.list;

    // 3. Tra quante ore pioverà (pioggia prevista nei dati futuri)
    let traQuanteOrePiovera = null;
    for (let i = 0; i < forecast.length; i++) {
      const item = forecast[i];
      const haPioggia = item.weather[0].main.toLowerCase().includes("rain") || item.rain;
      if (haPioggia) {
        const forecastTime = new Date(item.dt_txt); // orario previsto della pioggia
        const now = new Date();
        const diffMs = forecastTime - now;
        traQuanteOrePiovera = Math.round(diffMs / (1000 * 60 * 60)); // ore intere
        break;
      }
    }

    return {
      pioveOra,
      traQuanteOrePiovera
    };

  } catch (err) {
    console.error("❌ Errore API meteo:", err.message);
    return null;
  }
}

module.exports = { getMeteo };
