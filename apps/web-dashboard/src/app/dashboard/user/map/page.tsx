'use client';

import styles from './map.module.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from "leaflet";
import { useState } from "react";
import 'leaflet/dist/leaflet.css';

const areaData = [
    {
        name: "Area A",
        lat: 40.713,
        lon: -74.006,
        status: "healthy",
    },
    {
        name: "Area B",
        lat: 40.717,
        lon: -74.01,
        status: "warning",
    },
    {
        name: "Area C",
        lat: 40.709,
        lon: -74.005,
        status: "critical",
    },
];

const statusColors = {
    healthy: "#2ecc71",
    warning: "#f1c40f",
    critical: "#e74c3c",
};

export default function MapViewDashboardPage() {
    const [activeFilter, setActiveFilter] = useState("all");
    const center: LatLngTuple = [40.7128, -74.006];

    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.titleContainer}>
                    <p className={styles.title}>Space Map</p>
                    <p className={styles.subTitle}>View and monitor all green spaces in real time</p>
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        className={`${styles.button} ${styles.all} ${activeFilter === "all" ? styles.active : ""}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        All Spaces
                    </button>
                    <button
                        className={`${styles.button} ${styles.healthy} ${activeFilter === "healthy" ? styles.active : ""}`}
                        onClick={() => setActiveFilter("healthy")}
                    >
                        Healthy
                    </button>
                    <button
                        className={`${styles.button} ${styles.warning} ${activeFilter === "warning" ? styles.active : ""}`}
                        onClick={() => setActiveFilter("warning")}
                    >
                        Warning
                    </button>
                    <button
                        className={`${styles.button} ${styles.critical} ${activeFilter === "critical" ? styles.active : ""}`}
                        onClick={() => setActiveFilter("critical")}
                    >
                        Critical
                    </button>
                </div>

            </div>
            <div className={styles.secondContainer}>
                <div className={styles.mapContainer}>
                    <MapContainer center={[40.7128, -74.006]} zoom={14} className={styles.map}>
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {areaData
                            .filter(area => activeFilter === "all" || area.status === activeFilter)
                            .map((area, idx) => (
                                <Circle
                                    key={idx}
                                    center={[area.lat, area.lon]}
                                    radius={100}
                                    color={statusColors[area.status as keyof typeof statusColors]}
                                    fillColor={statusColors[area.status as keyof typeof statusColors]}
                                    fillOpacity={0.4}
                                >
                                    <Popup>{area.name}</Popup>
                                </Circle>
                            ))}
                    </MapContainer>
                </div>
                <div className={styles.detailsContainer}>
                    <p className={styles.titleDetails}>Space Details</p>
                </div>
            </div>
        </div>
    );
}
