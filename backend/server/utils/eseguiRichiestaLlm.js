const axios = require("axios");
const { getMeteo } = require("./meteo");
const { reverseGeocode } = require("./reverseGeocode");
const buildPrompt = require("./buildPrompt");
const sensorReader = require("../../../iot/sensorReader"); // questo è il tuo modulo

async function eseguiRichiestaLLM({ messaggioUtente, posizione, modello, res }) {
    let rispostaCompleta = '';

    try {
        // ✅ Attendi un singolo dato dai sensori (entro 5 secondi)
        const sensors = await new Promise((resolve, reject) => {
            const handler = (data) => {
                sensorReader.off("data", handler); // disiscrive subito dopo
                resolve(data);
            };
            sensorReader.on("data", handler);

            // timeout di sicurezza
            setTimeout(() => {
                sensorReader.off("data", handler);
                reject(new Error("Timeout ricezione dati da Arduino"));
            }, 5000);
        });

        // ✅ Altri dati di contesto
        const now = new Date();
        const giornoSettimana = now.toLocaleDateString('it-IT', {
            year: "numeric", month: "long", day: "numeric"
        });
        const ora = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const oreDallUltimaIrrigazione = Math.floor(Math.random() * (50 - 5 + 1)) + 5;

        let luogo = "Posizione non disponibile";
        if (posizione) {
            const localizzazione = await reverseGeocode(posizione.lat, posizione.lon);
            luogo = localizzazione
                ? `${localizzazione} (Latitudine: ${posizione.lat}, Longitudine: ${posizione.lon})`
                : `Latitudine: ${posizione.lat}, Longitudine: ${posizione.lon}`;
        }

        const meteo = posizione ? await getMeteo(posizione.lat, posizione.lon) : null;
        let meteoInfo = "Dati meteo non disponibili.";
        if (meteo) {
            meteoInfo = `- Piove ora: ${meteo.pioveOra ? "sì" : "no"}
- Pioggia prevista tra: ${meteo.traQuanteOrePiovera !== null ? meteo.traQuanteOrePiovera + " ore" : "nessuna pioggia prevista entro 48 ore"}`;
        }

        const prompt = buildPrompt({
            messaggioUtente,
            giornoSettimana,
            ora,
            posizioneTestuale: luogo,
            sensors,
            meteoInfo,
            oreDallUltimaIrrigazione
        });

        const dataMatch = prompt.match(/<data>([\s\S]*?)<\/data>/i);
        if (dataMatch) {
            console.log("\n📦 Dati inviati al modello:\n" + dataMatch[1].trim() + "\n");
        }

        res.setHeader("Content-Type", "text/plain; charset=utf-8");

        const inizio = Date.now();
        let primoChunk = true;

        const llmStream = await axios.post("http://localhost:11434/api/generate", {
            model: modello,
            prompt,
            stream: true
        }, { responseType: "stream" });

        let oraPrimoChunk = Date.now();
        llmStream.data.on("data", chunk => {
            const line = chunk.toString().trim();
            if (primoChunk) oraPrimoChunk = Date.now();
            if (!line) return;

            if (primoChunk) {
                console.log(`🚀 Primo chunk ricevuto dopo: ${oraPrimoChunk - inizio} ms`);
                primoChunk = false;
            }

            try {
                const parsed = JSON.parse(line);

                if (parsed.response) {
                    rispostaCompleta += parsed.response;
                    res.write(parsed.response);
                }
            } catch (err) {
                console.warn("⚠️ Chunk non JSON valido:", line);
            }
        });

        llmStream.data.on("end", () => {
            const fine = Date.now();
            console.log(`✅ Risposta completata in ${fine - inizio} ms`);
            console.log(`Risposta ricevuta:\n\n${rispostaCompleta.trim()}`);
            res.end();
        });

        llmStream.data.on("error", (err) => {
            console.error("❌ Errore streaming LLM:", err.message);
            res.status(500).end("Errore nel flusso della LLM.");
        });

    } catch (err) {
        console.error("❌ Errore:", err.message);
        res.status(500).end("Errore durante l'elaborazione.");
    }
}

module.exports = { eseguiRichiestaLLM };
