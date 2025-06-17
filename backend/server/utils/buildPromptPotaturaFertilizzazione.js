function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if ([12, 1, 2].includes(month)) return "winter";
    if ([3, 4, 5].includes(month)) return "spring";
    if ([6, 7, 8].includes(month)) return "summer";
    return "autumn";
}

function getDaysSince(dateString) {
    if (!dateString) return null;
    const today = new Date();
    const date = new Date(dateString);
    return Math.floor((today - date) / (1000 * 60 * 60 * 24));
}

function checkPruning({ plantType, season, daysSince }) {
    if (!daysSince) return false;
    if (plantType === "ulivi") return season === "winter" && daysSince >= 365;
    if (plantType === "siepe") return ["spring", "summer"].includes(season) && daysSince >= 180;
    if (plantType === "prato") return ["spring", "summer"].includes(season) && daysSince >= 7;
    if (plantType === "aiuole") return !["summer"].includes(season) && daysSince >= 180;
    return false;
}

function checkFertilization({ plantType, season, daysSince }) {
    if (!daysSince) return false;
    if (plantType === "ulivi") return season === "spring" && daysSince >= 365;
    if (plantType === "siepe") return season === "spring" && daysSince >= 365;
    if (plantType === "prato") return ["spring", "autumn"].includes(season) && daysSince >= 180;
    if (plantType === "aiuole") return !["summer"].includes(season) && daysSince >= 180;
    return false;
}

function buildPromptPotaturaFertilizzazione(stations) {
    const today = new Date().toISOString().split("T")[0];
    const season = getCurrentSeason();

    const outputJson = {};
    let prompt = `📅 Today is ${today}. The current season is ${season}.\n`;
    prompt += `You will receive a list of stations and for each you must provide a short explanation for pruning and fertilization decisions.\n`;
    prompt += `The pruning and fertilization values have already been calculated and must NOT be changed.\n`;
    prompt += `Respond ONLY with reasons in this structure:\n\n`;

    for (const station of stations) {
        const name = station.name.toLowerCase();
        const plant = station.plantType?.toLowerCase() || "unknown";
        const daysSincePruning = station.lastPruning ? getDaysSince(station.lastPruning) : null;
        const daysSinceFertilization = station.lastFertilization ? getDaysSince(station.lastFertilization) : null;

        const pruning = checkPruning({ plantType: plant, season, daysSince: daysSincePruning });
        const fertilization = checkFertilization({ plantType: plant, season, daysSince: daysSinceFertilization });

        outputJson[name] = {
            pruning,
            pruningReason: "<<INSERT>>",           // 🧠 LLM will fill
            fertilization,
            fertilizationReason: "<<INSERT>>"       // 🧠 LLM will fill
        };

        prompt += `📍 Station ${station.name} (plant type: ${station.plantType})\n`;
        prompt += `- pruning: ${pruning}, days since last: ${daysSincePruning ?? "N/A"}\n`;
        prompt += `- fertilization: ${fertilization}, days since last: ${daysSinceFertilization ?? "N/A"}\n\n`;
    }

    prompt += `✏️ Respond ONLY with JSON of reasons in this format:\n`;
    prompt += `{\n`;
    prompt += `  "north": {\n`;
    prompt += `    "pruningReason": "...",\n`;
    prompt += `    "fertilizationReason": "..." \n`;
    prompt += `  },\n  ...\n}\n`;
    prompt += `No additional text.`

    console.log(prompt);

    return { prompt, outputJson };
}

module.exports = { buildPromptPotaturaFertilizzazione };
