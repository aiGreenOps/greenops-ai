'use client';

import styles from './dashboard.module.css';
import { generateDayTemplate, mergeWithTemplate } from "@/utils/dayTemplate";
import { LuThermometerSun, LuDroplets, LuLeaf } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import { IoIosNotificationsOutline } from "react-icons/io";
import Estimator from '@/components/Estimators';
import { useEffect, useRef, useState } from 'react';
import { useSensorData } from "@/context/SensorContext";
import AggregatedChart from '@/components/AggregatedChart';

export default function UserDashboardPage() {
    const sensor = useSensorData();
    const agg = sensor?.current?.aggregated;  // ✅ dati attuali
    const template = generateDayTemplate(); // 288 slot da mezzanotte a 23:55
    const merged = mergeWithTemplate(template, sensor?.today || []);

    const [visibleLines, setVisibleLines] = useState({
        temperature: true,
        humidityPct: true,
        rainPct: true,
        lightPct: true
    });

    const toggleLine = (key: keyof typeof visibleLines) => {
        setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const formattedData = merged.map(d => ({
        ...d,
        time: new Date(d.timestamp).getTime() // aggiunge il campo usato su XAxis
    }));

    const previous = useRef<typeof agg | null>(null);
    const [delta, setDelta] = useState({
        temperature: 0,
        humidity: 0,
        light: 0,
        rain: 0
    });

    useEffect(() => {
        if (agg && previous.current) {
            const prev = previous.current;

            if (
                agg.temperature == null || prev.temperature == null ||
                agg.humidityPct == null || prev.humidityPct == null ||
                agg.lightPct == null || prev.lightPct == null ||
                agg.rainPct == null || prev.rainPct == null
            ) {
                return;
            }

            const deltaTemperature = agg.temperature - prev.temperature;
            const deltaHumidity = agg.humidityPct - prev.humidityPct;
            const deltaLight = agg.lightPct - prev.lightPct;
            const deltaRain = agg.rainPct - prev.rainPct;

            setDelta({
                temperature: deltaTemperature,
                humidity: deltaHumidity,
                light: deltaLight,
                rain: deltaRain
            });
        }

        if (agg) {
            previous.current = agg;
        }
    }, [agg]);

    const [aiMessage, setAiMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStreamingReport() {
            try {
                const res = await fetch("http://localhost:3001/api/ai/response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messaggio: "Cosa suggerisce l'AI per oggi?",
                        posizione: { lat: 40.9, lon: 17.3 }
                    }),
                });

                if (!res.ok || !res.body) {
                    throw new Error("Risposta non valida dal server.");
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let firstChunk = true;
                let fullText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    let chunk = decoder.decode(value, { stream: true });
                    if (firstChunk) {
                        chunk = chunk.replace(/^\s+/, ""); // rimuove spazi iniziali
                        setLoading(false); // 🔥 rimuove skeleton
                        firstChunk = false;
                    }
                    fullText += chunk;
                    setAiMessage(fullText); // aggiorna live!
                }

            } catch (err) {
                console.error("❌ Errore AI stream:", err);
                setAiMessage("❌ Errore durante la generazione del report.");
            }
        }

        fetchStreamingReport();
    }, []);


    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.temp}`}>
                        <LuThermometerSun />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Average Temperature</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>{agg?.temperature} °C</p>
                            <Estimator value={delta.temperature} />
                        </div>
                    </div>
                </div>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.hum}`}>
                        <LuDroplets />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Average Humidity</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>{agg?.humidityPct} %</p>
                            <Estimator value={delta.humidity} />
                        </div>
                    </div>
                </div>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.soil}`}>
                        <LuLeaf />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Soil Moisture</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>{agg?.rainPct} %</p>
                            <Estimator value={delta.rain} />
                        </div>
                    </div>
                </div>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.brigh}`}>
                        <FaRegLightbulb />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Solar Brightness</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>{agg?.lightPct} %</p>
                            <Estimator value={delta.light} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.secondContainer}>
                <div className={styles.leftContainer}>
                    <div className={styles.aiReportContainer}>
                        <div className={styles.headerContainer}>
                            <p className={styles.titleContainer}>AI GreenOps Report</p>
                        </div>
                        <div className={`${styles.areaTextReport}  ${loading ? styles.loadingSkeleton : ""}`}>
                            <div className={styles.textReport}>
                                {aiMessage}
                            </div>
                        </div>
                    </div>
                    <div className={styles.sensorReadings}>
                        <div className={styles.headerContainer}>
                            <p className={styles.titleContainer}>24 hour Sensor Readings</p>
                            <div className={styles.toggleOptions}>
                                {Object.keys(visibleLines).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleLine(key as keyof typeof visibleLines)}
                                        className={`
                                        ${styles.option}
                                        ${styles[key as keyof typeof styles] || ''} 
                                        ${visibleLines[key as keyof typeof visibleLines] ? styles.active : ''}
                                    `}
                                    >
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.readingsChart}>
                            <AggregatedChart data={formattedData} visibleLines={visibleLines} />
                        </div>
                    </div>
                </div>
                <div className={styles.recentAlerts}>
                    <div className={styles.headerContainer}>
                        <p className={styles.titleContainer}>Recent Alerts</p>
                        <div className={styles.notifyAlerts}>
                            <IoIosNotificationsOutline />
                            <p className={styles.notifyNumber}>1 New</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.thirdContainer}>
            </div>
        </div>
    );
}
