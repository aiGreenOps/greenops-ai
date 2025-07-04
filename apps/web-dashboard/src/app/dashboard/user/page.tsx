'use client';

import styles from './dashboard.module.css';
import { generateDayTemplate, mergeWithTemplate } from "@/utils/dayTemplate";
import { LuThermometerSun, LuDroplets, LuLeaf } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import { IoIosNotificationsOutline } from "react-icons/io";
import Estimator from '@/components/Estimators';
import { useEffect, useRef, useState } from 'react';
import { StationSensorData, useSensorData } from "@/context/SensorContext";
import AggregatedChart from '@/components/AggregatedChart';
import { io } from "socket.io-client";
import { toast } from 'react-toastify';
import { GoAlert } from 'react-icons/go';

export default function UserDashboardPage() {
    const [stations, setStations] = useState<StationSensorData[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<
        { time: string; description: string; status: string }[]
    >([]);

    const sensor = useSensorData();
    const agg = sensor?.current?.aggregated;
    const template = generateDayTemplate();
    const merged = mergeWithTemplate(template, sensor?.today || []);
    const [newAlertCount, setNewAlertCount] = useState(0);
    const hasHandledFirstBatch = useRef(false); // 👈 per ignorare il primo evento

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
        time: new Date(d.timestamp).getTime()
    }));

    const previous = useRef<typeof agg | null>(null);
    const [delta, setDelta] = useState({
        temperature: 0,
        humidity: 0,
        light: 0,
        rain: 0
    });

    async function handleIrrigationToggle(stationId: string, isCurrentlyActive: boolean) {
        const url = isCurrentlyActive
            ? `${process.env.NEXT_PUBLIC_API_BASE}/api/irrigation/stop`
            : `${process.env.NEXT_PUBLIC_API_BASE}/api/irrigation/start`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stationId })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Errore");
            }

            toast.success(result.message);

            setStations(prev =>
                prev.map(s => {
                    if (s._id === stationId) {
                        return {
                            ...s,
                            isIrrigating: !isCurrentlyActive,
                            irrigationStartTime: !isCurrentlyActive ? new Date().toISOString() : null,
                            lastIrrigation: isCurrentlyActive ? new Date().toISOString() : s.lastIrrigation
                        };
                    }
                    return s;
                })
            );
        } catch (err: any) {
            toast.error(err.message || "Errore durante l'aggiornamento irrigazione");
        }
    }


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
    const hasStarted = useRef(false); // flag che vive tra i render

    function getTimeAgo(isoTime: string): string {
        const now = new Date();
        const then = new Date(isoTime);
        const diffMs = now.getTime() - then.getTime();
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) return `${diffSec} seconds ago`;
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin} minutes ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs} hours ago`;

        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays} days ago`;
    }

    function toFullISO(timeStr: string) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return new Date(`${today}T${timeStr}`);
    }


    useEffect(() => {

        async function fetchStations() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/stations`);
                if (!res.ok) throw new Error("Errore nel recupero stazioni");
                const data = await res.json();
                setStations(data);
            } catch (err) {
                console.error("❌ Errore fetch iniziale stazioni:", err);
            }
        }
        fetchStations();

        // STREAMING STATICO

        async function fetchStreamingReport() {
            if (hasStarted.current) return; // blocca se già partito
            hasStarted.current = true;

            const messaggioDemo = `Le condizioni del verde aziendale sono generalmente sfavorevoli. La temperatura è elevata, potenzialmente stressante per le piante. Il livello di umidità basso non aiuta a mantenere l'equilibrio idrico nelle piante, rendendo questo un fattore da tenere sotto controllo. La luminosità è bassa, che potrebbe causare una deficienza di luce nei giorni seguenti se il sole non splende abbastanza nel futuro. Non si prevedono precipitazioni entro le prossime 105 ore.`;

            const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));
            const chunks = messaggioDemo.split(" "); // simuliamo parola per parola
            let fullText = "";
            let firstChunk = true;

            for (let i = 0; i < chunks.length; i++) {
                await delay(150); // Simula ritardo tra chunk (puoi aumentare o diminuire)

                fullText += chunks[i] + " ";

                if (firstChunk) {
                    setLoading(false);
                    firstChunk = false;
                }

                setAiMessage(fullText);
            }
        }

        // STREAMING AI

        // async function fetchStreamingReport() {
        //     if (hasStarted.current) return; // blocca se già partito
        //     hasStarted.current = true;

        //     try {
        //         const res = await fetch("http://localhost:3001/api/ai/response", {
        //             method: "POST",
        //             headers: { "Content-Type": "application/json" },
        //             body: JSON.stringify({
        //                 messaggio: "Cosa suggerisce l'AI per oggi?",
        //                 posizione: { lat: 40.9, lon: 17.3 }
        //             }),
        //         });

        //         if (!res.ok || !res.body) {
        //             throw new Error("Risposta non valida dal server.");
        //         }

        //         const reader = res.body.getReader();
        //         const decoder = new TextDecoder();
        //         let firstChunk = true;
        //         let fullText = "";

        //         while (true) {
        //             const { done, value } = await reader.read();
        //             if (done) break;

        //             let chunk = decoder.decode(value, { stream: true });
        //             if (firstChunk) {
        //                 chunk = chunk.replace(/^\s+/, "");
        //                 setLoading(false);
        //                 firstChunk = false;
        //             }
        //             fullText += chunk;
        //             setAiMessage(fullText);
        //         }

        //     } catch (err) {
        //         console.error("❌ Errore AI stream:", err);
        //         setAiMessage("❌ Errore durante la generazione del report.");
        //     }
        // }

        fetchStreamingReport();

        const socket = io("http://localhost:3001"); // ✅ URL backend
        socket.on("station-alert", (alertData) => {
            console.log("🔔 ALERT ricevuto:", alertData);

            setStations(alertData.stations || []);

            const nuoviAlert = (alertData.alerts || []).map((alert: { timestamp: string; description: string; newStatus: string }) => ({
                time: new Date(alert.timestamp).toLocaleTimeString(),
                description: alert.description,
                status: alert.newStatus
            }));

            setRecentAlerts(prev => {
                const alreadyPresent = new Set(prev.map(a => `${a.time}-${a.description}`));
                const onlyNew = nuoviAlert.filter((a: { time: string; description: string; status: string }) =>
                    !alreadyPresent.has(`${a.time}-${a.description}`)
                );

                // ✅ aggiorna il conteggio dei nuovi alert
                if (onlyNew.length > 0) {
                    setNewAlertCount(onlyNew.length);
                }

                const combined = [...onlyNew, ...prev];
                return combined.slice(0, 6);
            });
        });


        socket.on("irrigation-stopped-batch", (data: {
            stopped: {
                stationId: string;
                stationName: string;
                plantType: string;
                endedAt: string;
                newStatus: string;
            }[];
            timestamp: string;
        }) => {
            console.log("💧 IRRIGAZIONE TERMINATA:", data);

            // 🔁 Ignora il primo evento dopo montaggio
            if (!hasHandledFirstBatch.current) {
                hasHandledFirstBatch.current = true;
                return;
            }

            if (!data.stopped?.length) return;

            setStations(prevStations =>
                prevStations.map(station => {
                    const match = data.stopped.find(s => s.stationId === station._id?.toString());
                    if (match) {
                        const updated: StationSensorData = {
                            ...station,
                            isIrrigating: false,
                            irrigationStartTime: null,
                            status: (match.newStatus as "healthy" | "warning" | "critical") ?? station.status
                        };
                        return updated;
                    }
                    return station;
                })
            );


            toast.info(`Irrigation ended for ${data.stopped.length} station(s)`);
        });


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
                            <p className={styles.value}>{agg?.lightPct} lux</p>
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
                            <p className={styles.notifyNumber}>{newAlertCount} New</p>
                        </div>
                    </div>
                    <div className={styles.alertList}>
                        {recentAlerts.map((alert, i) =>
                            <div key={i} className={`${styles.alertItem} ${styles[alert.status]}`}>
                                <GoAlert className={styles.alertIcon} />
                                <div className={styles.alertTextContainer}>
                                    <p className={styles.alertText}>{alert.description}</p>
                                    <p className={styles.alertTime}>
                                        {getTimeAgo(toFullISO(alert.time).toISOString())} - {alert.status}
                                    </p>
                                </div>
                                {/* <p className={styles.alertStatus}>{alert.status}</p> */}
                            </div>
                        )}
                    </div>
                    <button className={styles.allAlertsBtn}>View All Alerts</button>
                </div>

            </div>
            <div className={styles.thirdContainer}>
                <div className={styles.tableWrapper}>
                    <p className={styles.titleTable}>Managed Green Spaces</p>
                    <div className={styles.header}>
                        <div>Name</div>
                        <div>Status</div>
                        <div>Plant Type</div>
                        <div>Irrigation</div>
                    </div>

                    {stations.map((singleStation) => (
                        <div key={singleStation._id} className={styles.row}>
                            <p className={styles.textTitle}>{singleStation.name} Garden</p>
                            <div className={`${styles.statuStation} ${styles[singleStation.status]}`}>
                                {singleStation.status}
                            </div>
                            <div className={styles.typeContainer}>
                                <LuLeaf className={styles.iconType} />
                                <p className={styles.typePlant}>
                                    {singleStation.plantType}
                                </p>
                            </div>
                            <div className={styles.irrigationToggle}>
                                <button
                                    className={`${styles.toggleSwitch} ${singleStation.isIrrigating ? styles.active : ""}`}
                                    onClick={() => handleIrrigationToggle(singleStation._id!, singleStation.isIrrigating)}
                                >
                                    <span className={styles.toggleCircle} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
