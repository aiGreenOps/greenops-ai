'use client';

import styles from './map.module.css';
import dynamic from 'next/dynamic';
import { LuThermometerSun, LuDroplets, LuLeaf } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import { useSensorData } from '@/context/SensorContext';
import { useState, useEffect } from 'react';
import { RiFlowerLine } from "react-icons/ri";
import { GrStatusInfo } from 'react-icons/gr';
import { GiFertilizerBag } from "react-icons/gi";
import { RiScissors2Line } from "react-icons/ri";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PiSprayBottle } from 'react-icons/pi';

const MapComponent = dynamic(() => import('@/components/MapLibreComponent'), { ssr: false });

interface Activity {
    _id: string;
    title: string;
    description: string;
    type: 'maintenance' | 'pruning' | 'fertilizing' | 'repair';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    location: string;
    scheduledAt: string;
    status: 'scheduled' | 'completed' | 'inProgress';
}

interface Station {
    _id: string;
    name: string;
    coordinates: { lat: number; lon: number };
    status: 'healthy' | 'warning' | 'critical';
    updatedAt: string;
    plantType: string;
    lastPruning?: string;
    lastFertilization?: string;
}

interface StationWithData extends Station {
    temperature: number;
    humidity: number;
    light: number;
    rain: number;
}

const statusColors: Record<string, string> = {
    healthy: "#2ecc71",
    warning: "#f1c40f",
    critical: "#e74c3c",
};

export default function MapViewDashboardPage() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<StationWithData | null>(null);
    const [animateKey, setAnimateKey] = useState(0);
    const [showActivityPopup, setShowActivityPopup] = useState(false);
    const [location, setLocation] = useState("all");
    const [locationLocked, setLocationLocked] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showAIReportPopup, setShowAIReportPopup] = useState(false);
    const [aiChunks, setAiChunks] = useState("");
    const [hiddenChunks, setHiddenChunks] = useState("");
    const [foundTags, setFoundTags] = useState(false);
    const [loading, setLoading] = useState(false);

    const [suggestedTitle, setSuggestedTitle] = useState("");
    const [suggestedDescription, setSuggestedDescription] = useState("");
    const [suggestedType, setSuggestedType] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [activityType, setActivityType] = useState("all");
    const [priority, setPriority] = useState("all");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");



    const sensorContext = useSensorData();
    if (!sensorContext) return null;
    const { current } = sensorContext;

    const handleScheduleTask = (preselectedLocation: string) => {
        setLocation(preselectedLocation);
        setLocationLocked(true);
        setShowActivityPopup(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const activityData = {
            title,
            description,
            type: activityType,
            priority,
            location,
            scheduledAt: `${scheduledDate}T${scheduledTime}:00`,
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData),
            });

            if (!res.ok) throw new Error('Creation failed');
            const newActivity = await res.json(); // ottieni l'attività appena creata

            setActivities((prev) => [newActivity, ...prev]);
            setShowActivityPopup(false);
            toast.success("Activity successfully created!");

            // reset optional
            setTitle('');
            setDescription('');
            setActivityType('');
            setPriority('');
            setLocation('');
            setScheduledDate('');
            setScheduledTime('');

        } catch (err) {
            console.error(err);
            toast.error("Failed to create activity.");
        }
    };

    //STREAMING STATICO

    const handleAskGreenOpsAI = async () => {
        if (!selectedStation) return;

        setAiChunks("");
        setHiddenChunks("");
        setSuggestedTitle("");
        setSuggestedDescription("");
        setSuggestedType("");
        setFoundTags(false);
        setLoading(true);
        setShowAIReportPopup(true);

        // ✅ Risposta statica per la demo (con tag)
        const fakeResponse = `Analisi dell'area verde: La posizione è Taranto, Puglia, Italia, il giorno è martedì 8 luglio 2025 durante la stagione estiva. Nell'area si trovano piante di ulivi che appaiono in stato di salute ottimale (healthy).
    
I sensori riportano le seguenti condizioni:
- Temperatura: 32,1°C
- Umidità aria: 40%
- Umidità terreno: 16%
- Luminosità: 74 lux
    
Gli ultimi interventi eseguiti sono l'irrigazione eseguita oggi, la potatura l'8 giugno 2023 e la fertilizzazione lo stesso giorno. La previsione meteorologica prevede una mancanza di pioggia per le prossime 105 ore.
    
Considerando i dati forniti, in base alle linee guida per piante comuni, i tipi di intervento per ulivi, prato, siepi e aiuole non sono necessari al momento. Tuttavia, tenendo conto della temperatura e dell'umidità del terreno, è necessario attenersi alla frequenza delle irrigazioni in base alle condizioni ambientali.
    
<title>Controllo irrigazione straordinaria</title>
<description>Verificare che le condizioni di umidità nel terreno rimangano stabili nelle prossime ore. Programmare un'irrigazione se il valore scende sotto la soglia critica.</description>
<type>maintenance</type>`;

        // ✅ Simula streaming
        const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));
        const chunks = fakeResponse.split(" "); // puoi fare anche per frase con `.split('. ')`
        let fullText = "";
        let foundTags = false;
        let firstChunkReceived = false;

        for (let i = 0; i < chunks.length; i++) {
            await delay(80); // personalizzabile

            const chunk = chunks[i] + " ";
            fullText += chunk;

            if (!firstChunkReceived) {
                setLoading(false);
                firstChunkReceived = true;
            }

            if (!foundTags) {
                const tagIndex = chunk.indexOf("<");
                if (tagIndex === -1) {
                    setAiChunks(prev => prev + chunk);
                } else {
                    setAiChunks(prev => prev + chunk.slice(0, tagIndex));
                    setHiddenChunks(prev => prev + chunk.slice(tagIndex));
                    foundTags = true;
                }
            } else {
                setHiddenChunks(prev => prev + chunk);
            }
        }

        // ✅ Estrai i tag al termine
        const titleMatch = fullText.match(/<title>(.*?)<\/title>/i);
        const descMatch = fullText.match(/<description>(.*?)<\/description>/i);
        const typeMatch = fullText.match(/<type>(.*?)<\/type>/i);

        if (titleMatch) setSuggestedTitle(titleMatch[1].trim());
        if (descMatch) setSuggestedDescription(descMatch[1].trim());

        if (typeMatch) {
            const type = typeMatch[1].trim().toLowerCase();
            const validTypes = ["maintenance", "pruning", "fertilizing", "repair"];
            if (validTypes.includes(type)) {
                setSuggestedType(type);
            } else {
                console.warn("❌ Tipo non valido ricevuto:", type);
                setSuggestedType("");
            }
        }
    };


    // STREAMING AI

    // const handleAskGreenOpsAI = async () => {
    //     if (!selectedStation) return;

    //     setAiChunks("");
    //     setHiddenChunks("");
    //     setSuggestedTitle("");
    //     setSuggestedDescription("");
    //     setSuggestedType("");
    //     setFoundTags(false);
    //     setLoading(true);
    //     setShowAIReportPopup(true);

    //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/ai/greenops-analysis`, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(selectedStation)
    //     });

    //     const reader = res.body?.getReader();
    //     const decoder = new TextDecoder();
    //     let fullText = "";

    //     if (!reader) return;

    //     let foundTags = false;
    //     let firstChunkReceived = false;

    //     while (true) {
    //         const { done, value } = await reader.read();
    //         if (done) break;

    //         const chunk = decoder.decode(value);
    //         fullText += chunk;

    //         if (!firstChunkReceived) {
    //             setLoading(false);
    //             firstChunkReceived = true;
    //         }

    //         if (!foundTags) {
    //             const tagIndex = chunk.indexOf("<");

    //             if (tagIndex === -1) {
    //                 // Nessun tag: mostra tutto il chunk
    //                 setAiChunks(prev => prev + chunk);
    //             } else {
    //                 // Tag trovato a metà chunk
    //                 const visible = chunk.slice(0, tagIndex);
    //                 const hidden = chunk.slice(tagIndex);

    //                 setAiChunks(prev => prev + visible);       // Mostra solo prima del tag
    //                 setHiddenChunks(prev => prev + hidden);    // Nasconde il resto
    //                 foundTags = true;                          // ❗ Blocca da qui in poi
    //             }
    //         } else {
    //             // Dopo aver trovato un tag → tutto va nei chunk nascosti
    //             setHiddenChunks(prev => prev + chunk);
    //         }
    //     }

    //     const titleMatch = fullText.match(/<title>(.*?)<\/title>/i);
    //     const descMatch = fullText.match(/<description>(.*?)<\/description>/i);
    //     const typeMatch = fullText.match(/<type>(.*?)<\/type>/i);

    //     if (titleMatch) setSuggestedTitle(titleMatch[1].trim());
    //     if (descMatch) setSuggestedDescription(descMatch[1].trim());

    //     if (typeMatch) {
    //         const type = typeMatch[1].trim().toLowerCase();
    //         const validTypes = ["maintenance", "pruning", "fertilizing", "repair"];
    //         if (validTypes.includes(type)) {
    //             setSuggestedType(type);
    //         } else {
    //             console.warn("❌ Tipo non valido ricevuto:", type);
    //             setSuggestedType("");
    //         }
    //     }

    // };



    const closeActivityPopup = () => {
        setShowActivityPopup(false);
        setLocationLocked(false);
        setTitle("");
        setDescription("");
        setScheduledDate("");
        setScheduledTime("");
        setActivityType("all");
        setPriority("all");
        setLocation("all");
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showActivityPopup) closeActivityPopup();
                if (showAIReportPopup) setShowAIReportPopup(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showActivityPopup, showAIReportPopup]);



    // Animazione al cambio dati
    useEffect(() => {
        if (!selectedStation?.updatedAt) return;
        setAnimateKey(prev => prev + 1);
    }, [selectedStation?.updatedAt]);

    // Carica lista stazioni
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/stations`);
                const data = await res.json();
                console.log(data);
                setStations(data);
            } catch (err) {
                console.error("Errore nel recupero stazioni:", err);
            }
        };

        fetchStations();
    }, []);


    // Aggiorna dati stazione selezionata quando arriva un nuovo update
    useEffect(() => {
        if (!selectedStation || !current?.stations?.length) return;

        const updated = current.stations.find(
            s => String(s.stationId) === String(selectedStation._id)
        );

        if (!updated) return;

        const shouldUpdate =
            selectedStation.temperature !== updated.temperature ||
            selectedStation.humidity !== updated.humidity ||
            selectedStation.light !== updated.light ||
            selectedStation.rain !== updated.rain;

        if (shouldUpdate) {
            setSelectedStation(prev => ({
                ...prev!,
                temperature: updated.temperature,
                humidity: updated.humidity,
                light: updated.light,
                rain: updated.rain,
                updatedAt: updated.timestamp
            }));
        }
    }, [current, selectedStation]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.titleContainer}>
                    <p className={styles.title}>Space Map</p>
                    <p className={styles.subTitle}>View and monitor all green spaces in real time</p>
                </div>
                <div className={styles.buttonContainer}>
                    {['all', 'healthy', 'warning', 'critical'].map((key) => (
                        <button
                            key={key}
                            className={`${styles.button} ${styles[key]} ${activeFilter === key ? styles.active : ""}`}
                            onClick={() => setActiveFilter(key)}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.secondContainer}>
                <div className={styles.mapContainer}>
                    <MapComponent
                        activeFilter={activeFilter}
                        stations={stations}
                        onStationClick={(station: Station) => {
                            const match = current?.stations?.find(
                                s => String(s.stationId) === String(station._id)
                            );

                            if (!match) {
                                setSelectedStation(null);
                                return;
                            }

                            setSelectedStation({
                                ...station,
                                temperature: match.temperature,
                                humidity: match.humidity,
                                light: match.light,
                                rain: match.rain,
                                updatedAt: match.timestamp
                            });
                        }}
                    />

                </div>

                <div className={styles.detailsContainer}>
                    <p className={styles.titleDetails}>Space Details</p>
                    {selectedStation ? (
                        <>
                            <div className={styles.detailsBox}>
                                <div className={styles.statusContainer}>
                                    <span className={`${styles.ballStatus} ${styles[selectedStation.status]}`} />
                                    <p className={styles.stationName}>{selectedStation.name} Garden</p>
                                </div>
                                <div className={styles.valuesContainer}>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <LuThermometerSun />
                                            <p className={styles.nameValue}>Temperature</p>
                                        </div>
                                        <p key={`temp-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.temperature} °C
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <LuDroplets />
                                            <p className={styles.nameValue}>Humidity</p>
                                        </div>
                                        <p key={`hum-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.humidity} %
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <LuLeaf />
                                            <p className={styles.nameValue}>Soil Moisture</p>
                                        </div>
                                        <p key={`rain-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.rain} %
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <FaRegLightbulb />
                                            <p className={styles.nameValue}>Brightness</p>
                                        </div>
                                        <p key={`light-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.light} lux
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <RiFlowerLine />
                                            <p className={styles.nameValue}>Plant Type</p>
                                        </div>
                                        <p key={`light-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.plantType.charAt(0).toUpperCase() + selectedStation.plantType.slice(1)}
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <GrStatusInfo />
                                            <p className={styles.nameValue}>Status</p>
                                        </div>
                                        <p key={`light-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.status.charAt(0).toUpperCase() + selectedStation.status.slice(1)}
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <PiSprayBottle />
                                            <p className={styles.nameValue}>Last Fertilization</p>
                                        </div>
                                        <p key={`fert-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.lastFertilization
                                                ? new Date(selectedStation.lastFertilization).toLocaleDateString()
                                                : "N/A"}
                                        </p>

                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <RiScissors2Line />
                                            <p className={styles.nameValue}>Last Pruning</p>
                                        </div>
                                        <p key={`prune-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.lastPruning
                                                ? new Date(selectedStation.lastPruning).toLocaleDateString()
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.buttonDetails}>
                                <button className={styles.buttonView} onClick={handleAskGreenOpsAI}>
                                    Ask GreenOps AI
                                </button>
                                <button
                                    className={styles.buttonSchedule}
                                    onClick={() => handleScheduleTask(selectedStation?.name || "")}
                                >
                                    Schedule Task
                                </button>

                            </div>
                            {showActivityPopup && (
                                <div className={styles.modalOverlay} onClick={closeActivityPopup}>
                                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                        <p className={styles.titlePop}>Create New Activity</p>
                                        <form className={styles.formContainer} onSubmit={handleSubmit}>
                                            <div className={styles.inputGroup}>
                                                <div className={styles.labels}>
                                                    <label htmlFor="nameActivity">Activity Title</label>
                                                </div>
                                                <input
                                                    id="nameActivity"
                                                    name="nameActivity"
                                                    type="text"
                                                    placeholder="Enter activity title"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <div className={styles.labels}>
                                                    <label htmlFor="description">Description</label>
                                                </div>
                                                <input
                                                    id="description"
                                                    name="description"
                                                    type="text"
                                                    placeholder="Describe the activity"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className={styles.selectContainer}>
                                                <div className={styles.inputGroup}>
                                                    <div className={styles.labels}>
                                                        <label htmlFor="types">Activity Type</label>
                                                    </div>
                                                    <div className={styles.selectWrapper}>
                                                        <select
                                                            value={activityType}
                                                            onChange={(e) => setActivityType(e.target.value)}
                                                            className={styles.selectInput}
                                                        >
                                                            <option value="all">All Types</option>
                                                            <option value="maintenance">Maintenance</option>
                                                            <option value="repair">Repair</option>
                                                            <option value="fertilizing">Fertilizing</option>
                                                            <option value="pruning">Pruning</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <div className={styles.labels}>
                                                        <label htmlFor="priority">Priority</label>
                                                    </div>
                                                    <div className={styles.selectWrapper}>
                                                        <select
                                                            value={priority}
                                                            onChange={(e) => setPriority(e.target.value)}
                                                            className={styles.selectInput}
                                                        >
                                                            <option value="all">All Priorities</option>
                                                            <option value="urgent">Urgent</option>
                                                            <option value="high">High</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="low">Low</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <div className={styles.labels}>
                                                    <label htmlFor="location">Location</label>
                                                </div>
                                                <div className={styles.selectWrapper}>
                                                    <select
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        className={styles.selectInput}
                                                        disabled={locationLocked} // 🔒 blocca select
                                                    >
                                                        <option value="all">All Locations</option>
                                                        <option value="North">North</option>
                                                        <option value="South">South</option>
                                                        <option value="East">East</option>
                                                        <option value="West">West</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className={styles.selectContainer}>
                                                <div className={styles.inputGroup}>
                                                    <div className={styles.labels}>
                                                        <label htmlFor="date">Scheduled Date</label>
                                                    </div>
                                                    <input
                                                        id="date"
                                                        name="date"
                                                        type="date"
                                                        value={scheduledDate}
                                                        onChange={(e) => setScheduledDate(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <div className={styles.labels}>
                                                        <label htmlFor="time">Scheduled Time</label>
                                                    </div>
                                                    <input
                                                        id="time"
                                                        name="time"
                                                        type="time"
                                                        value={scheduledTime}
                                                        onChange={(e) => setScheduledTime(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.buttonContainer}>
                                                <button type="submit" className={styles.createActivity}>Create Activity</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {showAIReportPopup && (
                                <div className={styles.modalOverlay} onClick={() => setShowAIReportPopup(false)}>
                                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                        <p className={styles.titlePop}>AI Analysis for {selectedStation.name} Garden</p>
                                        <p className={styles.subtitlePop}>Generated analysis based on current sensor data</p>

                                        <div className={`${styles.areaTextReport} ${loading ? styles.loadingSkeleton : ""}`}>
                                            <div className={styles.textReport}>
                                                {aiChunks.trim()}
                                            </div>
                                        </div>


                                        <div className={styles.buttonContainer}>
                                            <button
                                                className={`${styles.createActivity} ${(!suggestedTitle || !suggestedDescription || !suggestedType || loading) ? styles.disabled : ''}`}
                                                disabled={!suggestedTitle || !suggestedDescription || !suggestedType || loading}
                                                onClick={() => {
                                                    const tomorrow = new Date();
                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                    const yyyy = tomorrow.getFullYear();
                                                    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
                                                    const dd = String(tomorrow.getDate()).padStart(2, '0');
                                                    const defaultDate = `${yyyy}-${mm}-${dd}`;

                                                    setTitle(suggestedTitle);
                                                    setDescription(suggestedDescription);
                                                    setActivityType(suggestedType);
                                                    setPriority("medium");
                                                    setLocation(selectedStation?.name || "all");
                                                    setScheduledDate(defaultDate); // 📅 giorno successivo
                                                    setScheduledTime("09:00");     // 🕘 ora fissa
                                                    setLocationLocked(true);
                                                    setShowAIReportPopup(false);   // chiudi il popup AI
                                                    setShowActivityPopup(true);    // apri il popup Create
                                                }}

                                            >
                                                Create Activity
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </>
                    ) : (
                        <p className={styles.subTitle}>Click a station on the map to view details.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
