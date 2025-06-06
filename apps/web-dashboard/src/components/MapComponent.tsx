// app/components/MapComponent.tsx
'use client';

import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import styles from '../app/dashboard/user/map/map.module.css';
import 'leaflet/dist/leaflet.css';

const areaData = [
    { name: "Area A", lat: 40.713, lon: -74.006, status: "healthy" },
    { name: "Area B", lat: 40.717, lon: -74.01, status: "warning" },
    { name: "Area C", lat: 40.709, lon: -74.005, status: "critical" },
];

const statusColors = {
    healthy: "#2ecc71",
    warning: "#f1c40f",
    critical: "#e74c3c",
};

export default function MapComponent({ activeFilter }: { activeFilter: string }) {
    const center: LatLngTuple = [40.51484647722904, 17.250968921858057];

    return (
        <MapContainer center={center} zoom={17} className={styles.map}>
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
    );
}
