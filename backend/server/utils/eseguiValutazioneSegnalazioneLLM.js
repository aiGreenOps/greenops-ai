const axios = require("axios");
const Station = require("../models/station.model");
const Sensor = require("../models/sensor.model"); // se serve per ultime letture

async function eseguiValutazioneSegnalazioneLLM(report) {
    const { location, title, description } = report;

    const stazione = await Station.findOne({ name: location });
    if (!stazione) throw new Error(`Stazione '${location}' non trovata.`);

    const ultimaLettura = await Sensor.findOne({ station: stazione._id }).sort({ createdAt: -1 });

    const prompt = `
    Sei un assistente tecnico per la manutenzione del verde. Valuta la seguente segnalazione e rispondi SOLO con true o false (in formato JSON) se è veramente necessario creare un'attività di manutenzione.
    
    ⚠️ Attenzione:
    - Le segnalazioni potrebbero essere errate o inutili.
    - Valuta criticamente la situazione in base ai dati ambientali.
    - Se i valori dei sensori non giustificano un intervento, o se la descrizione è generica/confusa, rispondi con false.
    
    Dati della stazione:
    - Tipo pianta: ${stazione.plantType}
    - Temperatura: ${ultimaLettura?.temperature ?? 'N/A'}
    - Umidità: ${ultimaLettura?.humidity ?? 'N/A'}
    - Soil Moisture: ${ultimaLettura?.soilMoisture ?? 'N/A'}
    - Luminosità: ${ultimaLettura?.light ?? 'N/A'}
    - Pioggia: ${ultimaLettura?.rain ?? 'N/A'}
    
    Segnalazione:
    - Titolo: ${title}
    - Descrizione: ${description}
    
    Rispondi solo così: { "necessaria": true } oppure { "necessaria": false }
    `.trim();

    console.log(prompt);

    const res = await axios.post("http://localhost:11434/api/generate", {
        model: "mistral",
        prompt,
        stream: false
    });

    try {
        const parsed = JSON.parse(res.data.response);
        console.log(parsed);
        return parsed.necessaria === true;
    } catch (err) {
        console.error("❌ Errore parsing risposta LLM:", err.message);
        return false;
    }
}

module.exports = { eseguiValutazioneSegnalazioneLLM };
