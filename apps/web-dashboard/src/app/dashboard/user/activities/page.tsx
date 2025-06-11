'use client';

import { IoPodiumOutline, IoSearchOutline } from 'react-icons/io5';
import styles from './activities.module.css'
import { BsList } from 'react-icons/bs';
import { PiSlidersHorizontal } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import { GrLocation } from "react-icons/gr";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from 'react-icons/fi';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

export default function ActivitiesDashboardPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showActivityPopup, setShowActivityPopup] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [activityType, setActivityType] = useState('');
    const [priority, setPriority] = useState('');
    const [location, setLocation] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/activities`);
                if (!res.ok) throw new Error('Errore nel recupero attività');
                const data: Activity[] = await res.json();
                setActivities(data);
                setActivities(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchActivities();
    }, []);

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

    const handleDelete = async (id: string) => {
        const confirm = window.confirm("Are you sure you want to delete this activity?");
        if (!confirm) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/activities/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Deletion failed');

            setActivities((prev) => prev.filter((a) => a._id !== id));
            toast.success("Activity deleted successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete activity.");
        }
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowActivityPopup(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredActivities = activities.filter((activity) => {
        const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
        const matchesType = typeFilter === 'all' || activity.type === typeFilter;
        const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter;
        const matchesLocation = locationFilter === 'all' || activity.location.toLowerCase() === locationFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesLocation;
    });

    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.titleContainer}>
                    <p className={styles.title}>Activities & Maintenance</p>
                    <p className={styles.subTitle}>Track and manage all maintenance and reporting activities</p>
                </div>
                <button className={styles.btnAddActivity} onClick={() => setShowActivityPopup(true)}>
                    + New Activity
                </button>

                {showActivityPopup && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
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
                                    <button className={styles.createActivity}>Create Activity</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


            </div>
            <div className={styles.secondContainer}>
                <div className={styles.filterWrapper}>

                    <div className={styles.searchInputWrapper}>
                        <IoSearchOutline className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.selectWrapper}>
                        <PiSlidersHorizontal className={styles.inputIcon} />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="all">All Types</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="fertilizing">Fertilizing</option>
                            <option value="pruning">Pruning</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <BsList className={styles.inputIcon} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="all">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="inProgress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <IoPodiumOutline className={styles.inputIcon} />
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className={styles.selectInput}
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <IoPodiumOutline className={styles.inputIcon} />
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

                </div>
            </div>
            <div className={styles.thirdContainer}>
                <div className={styles.tableWrapper}>
                    <div className={styles.header}>
                        <div>Activity</div>
                        <div>Type</div>
                        <div>Status</div>
                        <div>Priority</div>
                        <div>Location</div>
                        <div>Scheduled</div>
                        <div>Actions</div>
                    </div>

                    {filteredActivities.map((activity) => (
                        <div key={activity._id} className={styles.row}>
                            <div className={styles.infoActivity}>
                                <p className={styles.textTitle}>{activity.title}</p>
                                <p className={styles.textDescription}>{activity.description}</p>
                            </div>
                            <div className={styles.activityType}>{activity.type}</div>
                            <div className={`${styles.statuActivity} ${styles[activity.status]}`}>
                                {activity.status}
                            </div>
                            <div className={`${styles.priorityActivity} ${styles[activity.priority]}`}>
                                <div className={styles.ballPriority}></div>
                                {activity.priority}
                            </div>

                            <div className={styles.locationActivity}>
                                <GrLocation />
                                {activity.location} Garden
                            </div>

                            <div className={styles.scheduledActivity}>
                                {new Date(activity.scheduledAt).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}

                            </div>
                            <div className={styles.actionActivity}>
                                <FiEdit className={styles.btnMod} />
                                <RiDeleteBinLine
                                    className={styles.btnDel}
                                    onClick={() => handleDelete(activity._id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}
