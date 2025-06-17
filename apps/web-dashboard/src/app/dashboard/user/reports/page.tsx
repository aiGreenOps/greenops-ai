'use client';

import styles from "./reports.module.css";
import { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import Estimator from "@/components/Estimators";

export default function ReportsDashboardPage() {
    const [locationFilter, setLocationFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState('day');
    const [data, setData] = useState({
        avgTemperature: 0,
        avgHumidity: 0,
        waterUsage: 0,
        sensorUptime: 0
    });

    const [previousData, setPreviousData] = useState(data); // per Estimator

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/reports/summary?location=${locationFilter}&duration=${durationFilter}`);
                const json = await res.json();
                setData(json.current);
                setPreviousData(json.previous);
            } catch (err) {
                console.error("Errore nel recupero dei report:", err);
            }
        };

        fetchData();
    }, [locationFilter, durationFilter]);


    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.titleContainer}>
                    <p className={styles.title}>Reports & Analytics</p>
                    <p className={styles.subTitle}>Monitor trends and generate insights from your green spaces</p>
                </div>
            </div>

            <div className={styles.secondContainer}>
                <div className={styles.filterWrapper}>
                    <div className={styles.selectWrapper}>
                        <IoLocationOutline className={styles.inputIcon} />
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="all">All Locations</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="East">East</option>
                            <option value="West">West</option>
                        </select>
                    </div>
                    {['day', 'week', 'month'].map((label) => (
                        <div
                            key={label}
                            className={`${styles.filterDuration} ${durationFilter === label ? styles.active : ''}`}
                            onClick={() => setDurationFilter(label)}
                        >
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.thirdContainer}>
                <div className={styles.reportContainer}>
                    <div className={styles.titleReport}>Average Temperature</div>
                    <div className={styles.infoReport}>
                        <p className={styles.valueReport}>{data.avgTemperature} °C</p>
                        <Estimator value={data.avgTemperature - previousData.avgTemperature} />
                    </div>
                </div>
                <div className={styles.reportContainer}>
                    <div className={styles.titleReport}>Average Humidity</div>
                    <div className={styles.infoReport}>
                        <p className={styles.valueReport}>{data.avgHumidity} %</p>
                        <Estimator value={data.avgHumidity - previousData.avgHumidity} />
                    </div>
                </div>
                <div className={styles.reportContainer}>
                    <div className={styles.titleReport}>Water Usage</div>
                    <div className={styles.infoReport}>
                        <p className={styles.valueReport}>{data.waterUsage} L</p>
                        <Estimator value={data.waterUsage - previousData.waterUsage} />
                    </div>
                </div>
                <div className={styles.reportContainer}>
                    <div className={styles.titleReport}>Sensor Uptime</div>
                    <div className={styles.infoReport}>
                        <p className={styles.valueReport}>{data.sensorUptime} %</p>
                        <Estimator value={data.sensorUptime - previousData.sensorUptime} />
                    </div>
                </div>
            </div>

            <div className={styles.fourContainer}>
                <div className={styles.tableWrapper}>
                    <div className={styles.header}>
                        <div>Report Name</div>
                        <div>Location</div>
                        <div>Frequency</div>
                        <div>Format</div>
                        <div>Actions</div>
                    </div>

                    <div className={styles.row}>
                        <p className={styles.textTitle}>Sustainability Report</p>
                        <p className={styles.textLocation}>
                            {locationFilter.charAt(0).toUpperCase() + locationFilter.slice(1)} Garden
                        </p>
                        <p className={styles.textFrequency}>
                            {{
                                day: "Daily",
                                week: "Weekly",
                                month: "Monthly"
                            }[durationFilter]}
                        </p>
                        <p className={styles.textFormat}>XLSX</p>
                        <div className={styles.btnContainer}>
                            <button
                                className={styles.actions}
                                onClick={() => {
                                    const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/reports/weekly-activities-excel?location=${locationFilter}&duration=${durationFilter}`;
                                    window.open(url, "_blank");
                                }}
                            >
                                Download
                            </button>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <p className={styles.textTitle}>Water Usage</p>
                        <p className={styles.textLocation}>
                            {locationFilter.charAt(0).toUpperCase() + locationFilter.slice(1)} Garden
                        </p>
                        <p className={styles.textFrequency}>
                            {{
                                day: "Daily",
                                week: "Weekly",
                                month: "Monthly"
                            }[durationFilter]}
                        </p>
                        <p className={styles.textFormat}>XLSX</p>
                        <div className={styles.btnContainer}>
                            <button
                                className={styles.actions}
                                onClick={() => {
                                    const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/reports/water-usage-excel?location=${locationFilter}&duration=${durationFilter}`;
                                    window.open(url, "_blank");
                                }}
                            >Download</button>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <p className={styles.textTitle}>Employee Segnalation</p>
                        <p className={styles.textLocation}>
                            {locationFilter.charAt(0).toUpperCase() + locationFilter.slice(1)} Garden
                        </p>
                        <p className={styles.textFrequency}>
                            {{
                                day: "Daily",
                                week: "Weekly",
                                month: "Monthly"
                            }[durationFilter]}
                        </p>
                        <p className={styles.textFormat}>XLSX</p>
                        <div className={styles.btnContainer}>
                            <button className={styles.actions}>Download</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
