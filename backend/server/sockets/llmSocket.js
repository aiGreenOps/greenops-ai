// ./sockets/llmSocket.js
const axios = require("axios");
const Station = require("../models/station.model"); // 👈 importa il modello


module.exports = function (io) {
    io.on("connection", (socket) => {
        socket.on("start-llm-request", async (data) => {
            const { attivita } = data;
            const location = attivita.location;
            const stazione = await Station.findOne({ name: location });

            const prompt = `
            Sei un assistente AI per la manutenzione del verde. Un manutentore ha chiesto supporto per l'attività: "${attivita.title}".
            
            Descrizione: ${attivita.description}
            Messaggio utente: "${attivita.messaggio}"
            
            Tipo di pianta: ${stazione.plantType}
            Stato attuale della stazione: ${stazione.status}
            
            // Dai una risposta amichevole, utile e dettagliata e breve.
            `;

            try {
                const llmStream = await axios.post(
                    "http://localhost:11434/api/generate",
                    {
                        model: "mistral",
                        prompt,
                        stream: true
                    },
                    { responseType: "stream" }
                );

                llmStream.data.on("data", (chunk) => {
                    const line = chunk.toString().trim();
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            socket.emit("llm-chunk", parsed.response);
                        }
                    } catch (_) { }
                });

                llmStream.data.on("end", () => {
                    socket.emit("llm-done");
                });

                llmStream.data.on("error", (err) => {
                    console.error("LLM stream error:", err.message);
                    socket.emit("llm-error", "Errore durante la generazione.");
                });

            } catch (err) {
                console.error("❌ Errore richiesta LLM:", err.message);
                socket.emit("llm-error", "Errore lato server.");
            }
        });
    });
};
