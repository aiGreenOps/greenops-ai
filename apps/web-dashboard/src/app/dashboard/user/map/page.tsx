'use client';

import styles from './map.module.css';
import dynamic from 'next/dynamic';
import { LuThermometerSun, LuDroplets, LuLeaf } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import { useSensorData } from '@/context/SensorContext';
import { useState, useEffect } from 'react';

const MapComponent = dynamic(() => import('@/components/MapLibreComponent'), { ssr: false });

interface Station {
    _id: string;
    name: string;
    coordinates: { lat: number; lon: number };
    status: 'healthy' | 'warning' | 'critical';
    updatedAt: string;
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

    const sensorContext = useSensorData();
    if (!sensorContext) return null;
    const { current } = sensorContext;

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
                        onStationClick={(station) => {
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
                                    <p className={styles.stationName}>{selectedStation.name}</p>
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
                                            {selectedStation.humidity}%
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <LuLeaf />
                                            <p className={styles.nameValue}>Soil Moisture</p>
                                        </div>
                                        <p key={`rain-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.rain}%
                                        </p>
                                    </div>
                                    <div className={styles.value}>
                                        <div className={styles.headerValue}>
                                            <FaRegLightbulb />
                                            <p className={styles.nameValue}>Brightness</p>
                                        </div>
                                        <p key={`light-${animateKey}`} className={`${styles.dataValue} ${styles.animatedValue}`}>
                                            {selectedStation.light}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.buttonDetails}>
                                <button className={styles.buttonView}>View Details</button>
                                <button className={styles.buttonSchedule}>Schedule Task</button>
                            </div>
                        </>
                    ) : (
                        <p className={styles.subTitle}>Click a station on the map to view details.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
