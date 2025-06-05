import { AggregatedSensor } from "@/context/SensorContext";

export function generateDayTemplate(): AggregatedSensor[] {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const points = [];

    for (let i = 0; i < 24 * 60; i += 5) {
        const t = new Date(dayStart.getTime() + i * 60 * 1000);
        points.push({
            timestamp: t.toISOString(),
            temperature: null,
            humidityPct: null,
            lightPct: null,
            rainPct: null
        });
    }

    return points;
}

export function mergeWithTemplate(template: AggregatedSensor[], data: AggregatedSensor[]) {
    const map = new Map(
        data.map(d => [d.timestamp.slice(0, 16), d])
    );

    return template.map(slot => {
        const key = slot.timestamp.slice(0, 16);
        return map.has(key) ? { ...slot, ...map.get(key) } : slot;
    });
}
