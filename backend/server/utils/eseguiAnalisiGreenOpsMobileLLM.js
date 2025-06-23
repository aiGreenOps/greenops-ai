const axios = require("axios");

exports.eseguiAnalisiGreenOpsMobileLLM = async ({ attivita, stazione, res }) => {
    const prompt = `
Sei un assistente AI per la manutenzione del verde. Un manutentore ha chiesto supporto per l'attività: "${attivita.title}".

Descrizione: ${attivita.description}
Messaggio utente: "${attivita.messaggio}"

Tipo di pianta: ${stazione.plantType}
Stato attuale della stazione: ${stazione.status}

// Dai una risposta amichevole, utile e dettagliata ma non troppo lunga.
`;

    try {
        const llmStream = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: "mistral",
                prompt,
                stream: true,
            },
            { responseType: "stream" }
        );

        let fullResponse = '';

        llmStream.data.on("data", chunk => {
            const line = chunk.toString().trim();
            try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                    fullResponse += parsed.response;
                }
            } catch (_) { }
        });

        llmStream.data.on("end", () => {
            res.setHeader("Content-Type", "application/json");
            res.status(200).json({ response: fullResponse });
        });
        
        llmStream.data.on("error", err => {
            console.error("Errore LLM:", err.message);
            res.status(500).end("Errore LLM.");
        });

    } catch (err) {
        console.error("❌ Errore analisi:", err.message);
        res.status(500).end("Errore durante l’analisi GreenOps.");
    }
};
