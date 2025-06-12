const { eseguiRichiestaLLM } = require("../utils/eseguiRichiestaLlm");
const { eseguiAnalisiGreenOpsLLM } = require("../utils/eseguiAnalisiGreenOpsLLM");

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


