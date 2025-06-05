'use client';

import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

export type AggregatedSensor = {
    temperature: number | null;
    humidityPct: number | null;
    lightPct: number | null;
    rainPct: number | null;
    timestamp: string;
};

type Station = {
    stationId: string;
    temperature: number;
    humidity: number;
    light: number;
    rain: number;
    timestamp: string;
};

type SensorPayload = {
    aggregated: AggregatedSensor;
    stations: Station[];
};

type SensorContextValue = {
    current: SensorPayload | null;
    history: AggregatedSensor[];
    today: AggregatedSensor[];
};


const SensorContext = createContext<SensorContextValue | null>(null);

export const SensorProvider = ({ children }: { children: React.ReactNode }) => {
    const [sensorData, setSensorData] = useState<SensorPayload | null>(null);
    const [sensorHistory, setSensorHistory] = useState<AggregatedSensor[]>([]);
    const [todayData, setTodayData] = useState<AggregatedSensor[]>([]);


    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // 1. Ultimo valore aggregato
                const resLatest = await fetch("http://localhost:3001/api/sensors/latest", {
                    credentials: "include"
                });
                if (resLatest.ok) {
                    const latest: SensorPayload = await resLatest.json();
                    setSensorData(latest);
                }

                // 2. Tutti i valori della giornata
                const resToday = await fetch("http://localhost:3001/api/sensors/today", {
                    credentials: "include"
                });
                if (resToday.ok) {
                    const today: AggregatedSensor[] = await resToday.json();
                    setSensorHistory(today);
                    setTodayData(today);                    
                }
            } catch (err) {
                console.error("❌ Errore fetch iniziale o today:", err);
            }
        };

        fetchInitial();

        const socket = io("http://localhost:3001", {
            withCredentials: true
        });

        socket.on("sensor-update", (data: SensorPayload) => {
            setSensorData(data);

            // Aggiungi all'elenco solo se non esiste già
            setSensorHistory(prev => {
                const alreadyInList = prev.some(p => p.timestamp === data.aggregated.timestamp);
                if (alreadyInList) return prev;
                return [...prev, data.aggregated];
            });

            setTodayData(prev => {
                const already = prev.find(d => d.timestamp === data.aggregated.timestamp);
                return already ? prev : [...prev, data.aggregated];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    return (
        <SensorContext.Provider value={{ current: sensorData, history: sensorHistory, today: todayData }}>
            {children}
        </SensorContext.Provider>
    );
};

export const useSensorData = () => useContext(SensorContext);
