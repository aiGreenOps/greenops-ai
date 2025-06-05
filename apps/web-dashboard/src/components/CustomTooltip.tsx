'use client';

import type { TooltipProps } from 'recharts';
import styles from "./Tooltip.module.css";

interface CustomTooltipProps extends TooltipProps<any, any> {
    visibleLines: {
        temperature: boolean;
        humidityPct: boolean;
        lightPct: boolean;
        rainPct: boolean;
    };
}

const tooltipColors: Record<string, string> = {
    Temperature: 'rgb(249, 115, 22)',
    Humidity: 'rgb(59, 130, 246)',
    'Soil Moisture': 'rgb(28, 166, 68)',
    Brightness: 'rgb(212, 0, 255)'
};

const getDataKeyFromName = (name: string): keyof CustomTooltipProps["visibleLines"] => {
    switch (name) {
        case 'Temperature': return 'temperature';
        case 'Humidity': return 'humidityPct';
        case 'Soil Moisture': return 'rainPct';
        case 'Brightness': return 'lightPct';
        default: return 'temperature';
    }
};

export default function CustomTooltip({ active, payload, label, visibleLines }: CustomTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const date = new Date(label);
    const time = date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={styles.tooltipContainer}>
            <p className={styles.orario}>At {time}</p>
            {payload.map((entry, index) => {
                const value = Number(entry.value).toFixed(1);
                const name = entry.name;
                const dataKey = getDataKeyFromName(name);
                const baseColor = tooltipColors[name] || '#999';
                const alpha = visibleLines?.[dataKey] ? 1 : 0.3;
                const color = baseColor.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
                const unit = name.includes('Temp') ? '°C' : '%';

                return (
                    <p key={index} className={styles.entryTool} style={{ color }}>
                        {name}: {value} {unit}
                    </p>
                );
            })}
        </div>
    );
}
