const axios = require("axios");
const { buildPromptPotaturaFertilizzazione } = require("./buildPromptPotaturaFertilizzazione");

async function eseguiRichiestaGiornalieraLLM({ stazioni }) {
    const { prompt, outputJson } = buildPromptPotaturaFertilizzazione(stazioni);

    let output = "";

    try {
        const res = await axios.post("http://localhost:11434/api/generate", {
            model: "mistral",
            prompt, // adesso è una stringa corretta
            stream: false
        });

        output = res.data.response;
    } catch (err) {
        console.error("❌ Errore richiesta LLM:", err.message);
        throw new Error("Errore nella richiesta LLM");
    }

    try {
        const json = JSON.parse(output);

        // ⚠️ Abbina solo le motivazioni
        for (const [station, reasons] of Object.entries(json)) {
            if (outputJson[station]) {
                outputJson[station].pruningReason = reasons.pruningReason;
                outputJson[station].fertilizationReason = reasons.fertilizationReason;
            }
        }

        return outputJson;

    } catch (err) {
        console.error("❌ Errore parsing JSON:", err);
        throw new Error("Output LLM non valido o malformato.");
    }
}

module.exports = { eseguiRichiestaGiornalieraLLM };
