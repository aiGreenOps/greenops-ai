const axios = require("axios");
const { getMeteo } = require("./meteo");
const { reverseGeocode } = require("./reverseGeocode");

function getStagioneCorrente() {
    const mese = new Date().getMonth() + 1;
    if ([12, 1, 2].includes(mese)) return "inverno";
    if ([3, 4, 5].includes(mese)) return "primavera";
    if ([6, 7, 8].includes(mese)) return "estate";
    return "autunno";
}

async function eseguiAnalisiGreenOpsLLM({ stazione, res }) {
    try {
        const {
            name, coordinates, temperature, humidity, light, rain,
            plantType, status, lastIrrigation, lastPruning, lastFertilization
        } = stazione;

        const giorno = new Date().toLocaleDateString('it-IT', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const stagione = getStagioneCorrente();

        const meteo = await getMeteo(coordinates.lat, coordinates.lon);
        const luogo = await reverseGeocode(coordinates.lat, coordinates.lon);

        const prompt = `
Sei un assistente per la manutenzione delle aree verdi. Analizza i dati seguenti e suggerisci se è opportuno intervenire.

📍 Posizione: ${luogo}
📆 Giorno: ${giorno} — Stagione: ${stagione}

🌿 Tipo di pianta: ${plantType}
🟢 Stato attuale: ${status}

📊 Sensori attuali:
- Temperatura: ${temperature}°C
- Umidità Aria: ${humidity}%
- Umidità Terreno: ${rain}%
- Luminosità: ${light} lux

🕓 Ultimi interventi:
- Irrigazione: ${lastIrrigation || "non disponibile"}
- Potatura: ${lastPruning || "non disponibile"}
- Fertilizzazione: ${lastFertilization || "non disponibile"}

🌦️ Meteo:
- Pioggia ora: ${meteo?.pioveOra ? "sì" : "no"}
- Pioggia prevista tra: ${meteo?.traQuanteOrePiovera !== null ? meteo.traQuanteOrePiovera + " ore" : "nessuna pioggia prevista entro 48 ore"}

📌 Linee guida per piante comuni:
- Ulivi: potare in inverno (gennaio-marzo), fertilizzare in primavera.
- Prato: tagliare frequentemente in primavera ed estate, fertilizzare in primavera e inizio autunno.
- Siepi: potare in primavera e fine estate, fertilizzare in aprile/maggio.
- Aiuole: potare e fertilizzare in base alla varietà, ma evitare estate.

Sulla base dei dati forniti, fornisci una breve analisi del contesto attuale dell’area verde, come se fosse rivolta a un responsabile operativo. NON includere ancora alcuna azione o attività specifica nei primi paragrafi.

⛔ Non usare alcun tag nei primi paragrafi.

✅ Alla fine della tua analisi, aggiungi un blocco machine-readable con queste tre informazioni, adattate al caso specifico:

- <title>: breve titolo dell’intervento da eseguire.
- <description>: breve spiegazione concisa del motivo dell’intervento, basata su dati come umidità, temperatura, pioggia, stato della pianta.
- <type>: uno tra: maintenance, pruning, fertilizing, repair.

Esempio solo per struttura (non copiarlo):

<title>[Titolo dinamico generato qui]</title>
<description>[Motivazione dinamica generata qui]</description>
<type>[Una delle 4 categorie]</type>
`;


        const llmStream = await axios.post("http://localhost:11434/api/generate", {
            model: "mistral",
            prompt,
            stream: true
        }, { responseType: "stream" });

        llmStream.data.on("data", chunk => {
            const line = chunk.toString().trim();
            try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                    res.write(parsed.response);
                }
            } catch { }
        });

        llmStream.data.on("end", () => {
            res.end();
        });

        llmStream.data.on("error", err => {
            console.error("Errore LLM:", err.message);
            res.status(500).end("Errore LLM.");
        });

    } catch (err) {
        console.error("❌ Errore analisi:", err.message);
        res.status(500).end("Errore durante l’analisi GreenOps.");
    }
}

module.exports = { eseguiAnalisiGreenOpsLLM };
