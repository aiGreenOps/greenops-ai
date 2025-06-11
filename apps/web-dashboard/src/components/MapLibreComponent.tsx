'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '../app/dashboard/user/map/map.module.css';

interface Station {
  _id: string;
  name: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  status: 'healthy' | 'warning' | 'critical';
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  healthy: "#2ecc71",
  warning: "#f1c40f",
  critical: "#e74c3c",
};

export default function MapLibreComponent({
  activeFilter,
  stations,
  onStationClick,
}: {
  activeFilter: string;
  stations: Station[];
  onStationClick?: (station: Station) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [17.2509, 40.5148],
      zoom: 16.45,
      bearing: -45,
      pitch: 45,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !stations) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    stations
      .filter(st => activeFilter === 'all' || st.status === activeFilter)
      .forEach((station) => {
        const marker = new maplibregl.Marker({
          color: statusColors[station.status],
        })
          .setLngLat([station.coordinates.lon, station.coordinates.lat])
          .addTo(map.current!);

        const el = marker.getElement();
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          onStationClick?.(station);
        });

        markersRef.current.push(marker);
      });
      console.log("Rendering markers for stations:", stations);
  }, [activeFilter, stations]);

  return <div ref={mapContainer} className={styles.map} />;
}
