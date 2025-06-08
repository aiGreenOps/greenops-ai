'use client';

import styles from "./sensors.module.css";
import React, { useEffect, useState } from "react";
import { PiSlidersHorizontal } from "react-icons/pi";
import { IoSearchOutline } from "react-icons/io5";
import { BsList } from "react-icons/bs";
import { LuThermometerSun, LuDroplets, LuLeaf } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import { FiBattery, FiEdit } from "react-icons/fi";
import { RxDotsHorizontal } from "react-icons/rx";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface Station {
    _id: string;
    name: string;
}

const unitMap: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    rain: '%',
    light: '%',
    default: ''
};

interface Sensor {
    _id: string;
    name: string;
    sensorType: 'temperature' | 'humidity' | 'rain' | 'light';
    status: 'online' | 'offline' | 'warning' | 'maintenance';
    model: string;
    battery: number;
    station: Station;
}

const sensorIcons = {
    temperature: <LuThermometerSun />,
    humidity: <LuDroplets />,
    rain: <LuLeaf />,
    light: <FaRegLightbulb />
};

export default function SensorsDashboardPage() {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSensors() {
            try {
                const res = await fetch(`${API_BASE}/api/sensors/all`);
                const data = await res.json();
                setSensors(data);
            } catch (err) {
                console.error("Errore nel recupero sensori:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSensors();
    }, []);

    const filteredSensors = sensors.filter(sensor => {
        const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sensor.status === statusFilter;
        const matchesType = typeFilter === 'all' || sensor.sensorType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    function getBatteryColor(battery: number): string {
        if (battery <= 33) return '#e74c3c';       // rosso
        if (battery <= 66) return '#f1c40f';       // giallo
        if (battery <= 90) return '#2ecc71';       // verde chiaro
        return '#27ae60';                          // verde pieno
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.titleContainer}>
                    <p className={styles.title}>Sensors</p>
                    <p className={styles.subTitle}>Monitor and manage all connected sensors</p>
                </div>
                <div className={styles.buttonContainer}>
                </div>
            </div>

            <div className={styles.secondContainer}>
                <div className={styles.filterWrapper}>

                    {/* Search bar con icona */}
                    <div className={styles.searchInputWrapper}>
                        <IoSearchOutline className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Search sensors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        ></input>
                    </div>

                    {/* Select Status */}
                    <div className={styles.selectWrapper}>
                        <BsList className={styles.inputIcon} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="all">All Statuses</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="warning">Warning</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    {/* Select Type */}
                    <div className={styles.selectWrapper}>
                        <PiSlidersHorizontal className={styles.inputIcon} />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="all">All Sensor Types</option>
                            <option value="temperature">Temperature</option>
                            <option value="humidity">Humidity</option>
                            <option value="rain">Soil</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.thirdContainer}>
                {loading ? (
                    <p className={styles.loading}>Loading sensors...</p>
                ) : (
                    <div className={styles.sensorGrid}>
                        {filteredSensors.map(sensor => (
                            <div key={sensor._id} className={styles.sensorCard}>

                                <div className={styles.headerContainer}>
                                    {React.cloneElement(sensorIcons[sensor.sensorType], {
                                        className: `${styles.sensorIcon} ${styles[sensor.sensorType]}`
                                    })}
                                    <div className={styles.infoSensor}>
                                        <p className={styles.nameSensor}>{sensor.name}</p>
                                        <p className={styles.modelSensor}>{sensor.model}</p>
                                    </div>
                                    <div className={`${styles.statusContainer} ${styles[sensor.status]}`}>
                                        <div className={styles.ballStatus}></div>
                                        <p className={styles.status}>{sensor.status}</p>
                                    </div>
                                </div>
                                <div className={styles.bodySensorContainer}>
                                    <div className={styles.valueContainer}>
                                        <p className={styles.value}>24.5</p>
                                        <p className={styles.format}>
                                            {unitMap[sensor.sensorType] || unitMap.default}
                                        </p>                                    </div>
                                    <p className={styles.locationSensor}>{sensor.station?.name}</p>
                                </div>
                                <div className={styles.optionSensorContainer}>
                                    <div className={styles.batteryContainer} style={{ color: getBatteryColor(sensor.battery) }}>
                                        <FiBattery />
                                        <p className={styles.valueBattery}>{sensor.battery}%</p>
                                    </div>
                                    <div className={styles.optionContainer}>
                                        <FiEdit className={styles.buttonOption} />
                                        <RxDotsHorizontal className={styles.buttonOption} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
