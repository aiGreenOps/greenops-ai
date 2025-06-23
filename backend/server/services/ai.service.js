const { eseguiRichiestaLLM } = require("../utils/eseguiRichiestaLlm");
const { eseguiAnalisiGreenOpsLLM } = require("../utils/eseguiAnalisiGreenOpsLLM");
const { eseguiRichiestaGiornalieraLLM } = require("../utils/eseguiRichiestaGiornalieraLLM");
const { eseguiAnalisiGreenOpsMobileLLM } = require("../utils/eseguiAnalisiGreenOpsMobileLLM");

exports.getAIResponse = async (req, res) => {
    const { messaggio, posizione } = req.body;

    try {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");

        await eseguiRichiestaLLM({
            messaggioUtente: messaggio,
            posizione,
            modello: "mistral",
            res // 👉 stream diretto, lascia scrivere i chunk su res
        });

        // ⚠️ NON serve res.end() qui — lo fa già la funzione interna

    } catch (err) {
        console.error("❌ Errore nel servizio AI:", err.message);
        res.status(500).end("Errore durante la generazione AI.");
    }
};

exports.getGreenOpsLLMAnalysis = async (req, res) => {
    const stazione = req.body;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    try {
        await eseguiAnalisiGreenOpsLLM({ stazione, res });
    } catch (err) {
        res.status(500).end("Errore lato server.");
    }
};


exports.getPotaturaEFertilizzazioneSuggerimenti = async (req, res) => {
    try {
        const stazioni = req.body.stazioni;

        if (!stazioni || !Array.isArray(stazioni)) {
            return res.status(400).json({ error: "Formato dati non valido. Atteso: { stazioni: [...] }" });
        }

        const risultato = await eseguiRichiestaGiornalieraLLM({ stazioni });

        return res.status(200).json(risultato);
    } catch (err) {
        console.error("❌ Errore AI manutenzione:", err);
        return res.status(500).json({ error: "Errore durante l'elaborazione della richiesta." });
    }
};


const Station = require('../models/station.model'); // importa correttamente il modello

exports.getGreenOpsMobileAnalysis = async (req, res) => {
    const attivita = req.body;
    const location = attivita.location;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    try {
        if (!location) {
            return res.status(400).end("Campo 'location' mancante.");
        }

        const stazione = await Station.findOne({ name: location });

        if (!stazione) {
            return res.status(404).end(`Stazione '${location}' non trovata.`);
        }

        await eseguiAnalisiGreenOpsMobileLLM({ attivita, stazione, res });

    } catch (err) {
        console.error("❌ Errore AI mobile:", err.message);
        res.status(500).end("Errore lato server.");
    }
};
