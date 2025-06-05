'use client';

import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import CustomTooltip from './CustomTooltip';


interface Props {
    data: {
        timestamp: string;
        time: number;
        temperature: number | null;
        humidityPct: number | null;
        lightPct: number | null;
        rainPct: number | null;
    }[];
    visibleLines: {
        temperature: boolean;
        humidityPct: boolean;
        lightPct: boolean;
        rainPct: boolean;
    };
}

const lineColors: Record<string, string> = {
    temperature: 'rgb(249, 115, 22)',
    humidityPct: 'rgb(59, 130, 246)',
    rainPct: 'rgb(28, 166, 68)',
    lightPct: 'rgb(212, 0, 255)'
};

export default function AggregatedChart({ data, visibleLines }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid
                    stroke="#ccc"
                    strokeDasharray="5 5"
                    horizontal={true}
                    vertical={true}
                />
                <XAxis
                    dataKey="time"
                    type="number"
                    domain={[
                        new Date().setHours(0, 0, 0, 0),
                        new Date().setHours(23, 59, 59, 999)
                    ]}
                    tickFormatter={(v) =>
                        new Date(v).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }
                    ticks={Array.from({ length: 11 }, (_, i) =>
                        new Date().setHours((i + 1) * 2, 0, 0, 0)
                    )}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip visibleLines={visibleLines} />} />
                <Legend
                    payload={[
                        {
                            value: 'Temperature',
                            type: 'line',
                            id: 'temperature',
                            color: visibleLines.temperature ? lineColors.temperature : 'rgba(249, 115, 22, 0.3)'
                        },
                        {
                            value: 'Humidity',
                            type: 'line',
                            id: 'humidityPct',
                            color: visibleLines.humidityPct ? lineColors.humidityPct : 'rgba(59, 130, 246, 0.3)'
                        },
                        {
                            value: 'Soil Moisture',
                            type: 'line',
                            id: 'rainPct',
                            color: visibleLines.rainPct ? lineColors.rainPct : 'rgba(28, 166, 68, 0.3)'
                        },
                        {
                            value: 'Brightness',
                            type: 'line',
                            id: 'lightPct',
                            color: visibleLines.lightPct ? lineColors.lightPct : 'rgba(212, 0, 255, 0.3)'
                        }
                    ]}
                />

                <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke={visibleLines.temperature ? 'rgb(249, 115, 22)' : 'transparent'}
                    name="Temperature"
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="humidityPct"
                    stroke={visibleLines.humidityPct ? 'rgb(59, 130, 246)' : 'transparent'}
                    name="Humidity"
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="rainPct"
                    stroke={visibleLines.rainPct ? 'rgb(28, 166, 68)' : 'transparent'}
                    name="Soil Moisture"
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="lightPct"
                    stroke={visibleLines.lightPct ? 'rgb(212, 0, 255)' : 'transparent'}
                    name="Brightness"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
