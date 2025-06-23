import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { ScrollView } from 'react-native';


const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.17:3001';

type Task = {
    title: string;
    description: string;
    location: string;
    type: 'maintenance' | 'pruning' | 'fertilizing' | 'repair';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'scheduled' | 'inProgress' | 'completed';
    scheduledAt: string;
};

type FilterKey = 'All' | 'Scheduled' | 'In Progress' | 'Completed';

const statusMap: Record<FilterKey, string | null> = {
    All: null,
    Scheduled: 'scheduled',
    'In Progress': 'inProgress',
    Completed: 'completed',
};

export default function ManutentoreDashboard() {
    const { user, logout } = useAuth();

    const fetchTasks = async () => {
        const userId = user?._id || user?.userId;
        if (!userId) {
            console.warn('❌ Nessun ID utente disponibile, skip fetch');
            return;
        }

        try {

            const res = await fetch(`${API_URL}/api/activities/mobile?userId=${userId}`);

            if (!res.ok) {
                console.error('❌ Errore HTTP:', res.status);
                setTasks([]);
                return;
            }

            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error('❌ Risposta inattesa:', data);
                setTasks([]);
                return;
            }

            setTasks(data);
        } catch (err) {
            console.error('❌ Failed to fetch tasks:', err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleRefresh = () => {
        fetchTasks();
    };


    const filters = ['All', 'Scheduled', 'In Progress', 'Completed'];
    const [activeFilter, setActiveFilter] = useState('All');
    const sliderAnim = useRef(new Animated.Value(0)).current;
    const [buttonWidths, setButtonWidths] = useState<number[]>([]);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    const filteredTasks = tasks.filter(task => {
        const filterValue = statusMap[activeFilter as FilterKey];
        return filterValue === null || task.status === filterValue;
    });
    const scheduledCount = tasks.filter(t => t.status === 'scheduled').length;
    const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;

    const onFilterPress = (index: number) => {
        setActiveFilter(filters[index]);

        const offset = buttonWidths.slice(0, index).reduce((acc, w) => acc + w, 0);
        Animated.spring(sliderAnim, {
            toValue: offset,
            useNativeDriver: false,
            stiffness: 180,
            damping: 18,
            mass: 0.6,
        }).start();
    };

    const capitalize = (text: string) =>
        text.charAt(0).toUpperCase() + text.slice(1);

    const resolvedImage = user?.profilePicture?.replace('http://localhost:3001', API_URL);

    if (!user) {
        return (
            <View style={styles.main}>
                <Text style={{ color: '#888' }}>Contenuto in arrivo...</Text>
            </View>
        );
    }

    if (loading) {
        return <View style={styles.main}><Text style={{ color: '#888' }}>Loading tasks...</Text></View>;
    }


    const formatStatus = (status: string) =>
        status
            .replace(/([a-z])([A-Z])/g, '$1 $2') // aggiunge spazio prima delle lettere maiuscole
            .replace(/^\w/, c => c.toUpperCase()); // maiuscola iniziale

    const handleSettings = () => {
        router.replace('/dashboard/maintainer/profile');
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                {resolvedImage ? (
                    <Image source={{ uri: resolvedImage }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>{user.firstName?.[0]}</Text>
                    </View>
                )}

                <View style={styles.headerText}>
                    <Text style={styles.greeting}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.role}>Maintainer</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={handleRefresh} style={styles.iconButton}>
                        <Feather name="refresh-ccw" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSettings} style={styles.iconButton}>
                        <Feather name="settings" size={18} color="#4b5563" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.main}>
                {/* STATUS CARDS */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Feather name="calendar" style={styles.iconCardBlue} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>New activity</Text>
                            <Text style={styles.statValue}>{scheduledCount}</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="clock" style={styles.iconCardYellow} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>In progress</Text>
                            <Text style={styles.statValue}>{inProgressCount}</Text>
                        </View>
                    </View>
                </View>

                {/* FILTER BAR */}
                <View style={styles.filterBar}>
                    {filters.map((label, i) => (
                        <TouchableOpacity
                            key={label}
                            onLayout={(e: LayoutChangeEvent) => {
                                const w = e.nativeEvent.layout.width;
                                setButtonWidths(prev => {
                                    const updated = [...prev];
                                    updated[i] = w;
                                    return updated;
                                });
                            }}
                            onPress={() => onFilterPress(i)}
                            style={styles.filterButton}
                        >
                            <Text style={[styles.filterText, activeFilter === label && styles.filterTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* SLIDER INDICATOR */}
                    {buttonWidths.length === filters.length && (
                        <Animated.View
                            style={[
                                styles.slider,
                                {
                                    width: buttonWidths[filters.indexOf(activeFilter)],
                                    transform: [{ translateX: sliderAnim }],
                                },
                            ]}
                        />
                    )}
                </View>

                <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
                    {filteredTasks.map((task, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.taskCard,
                                index === filteredTasks.length - 1 && { marginBottom: 0 }
                            ]}
                            onPress={() => router.push({ pathname: '/dashboard/maintainer/task-detail', params: { task: JSON.stringify(task) } })}
                        >
                            <View style={styles.taskHeader}>
                                <View style={styles.taskTitleGroup}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskType}>·  {task.type}</Text>
                                </View>
                                <Feather name="chevron-right" size={18} color="#9ca3af" />
                            </View>

                            <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={styles.taskDescription}
                            >
                                {task.description}
                            </Text>

                            <View style={styles.taskMeta}>
                                <View style={styles.taskRow}>
                                    <Feather name="map-pin" size={14} color="#6b7280" />
                                    <Text style={styles.taskLocation}>{capitalize(task.location)} Garden</Text>
                                </View>
                            </View>

                            <View style={styles.taskRowJustified}>
                                <View style={styles.taskRow}>
                                    <Feather name="clock" size={14} color="#6b7280" />
                                    <Text style={styles.taskTime}>
                                        {new Date(task.scheduledAt).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>

                                <View style={styles.taskBadges}>
                                    <Text style={[styles.badge, styles[`status_${task.status}` as keyof typeof styles]]}>
                                        {formatStatus(task.status)}
                                    </Text>
                                    <Text style={[styles.badge, styles[`priority_${task.priority}` as keyof typeof styles]]}>
                                        {task.priority}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(232, 228, 236)',
        height: 52.8,
    },
    avatar: {
        backgroundColor: '#2d6a4f',
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        resizeMode: 'cover',
        backgroundColor: 'transaperent',
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#2d6a4f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    greeting: {
        fontWeight: '700',
        fontSize: 16,
        color: '#0f172a',
    },
    role: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    taskList: {
        flex: 1,
    },
    main: {
        flex: 1,
        backgroundColor: 'rgb(249, 250, 251)',
        padding: 16,
    },
    statsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'transparent',
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },

    iconCardBlue: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(219, 234, 254, 255)',
        color: 'rgb(30, 64, 175)',
    },
    iconCardYellow: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgb(254, 249, 195)',
        color: 'rgb(202, 138, 4)',
    },
    textCard: {
        paddingLeft: 16,
        display: 'flex',
        flexDirection: 'column',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: 300,
        color: '#374151',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    filterBar: {
        flexDirection: 'row',
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgb(232, 228, 236)',

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.00,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        fontSize: 13,
        color: '#4b5563',
        backgroundColor: 'transparent',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    slider: {
        position: 'absolute',
        height: '100%',
        bottom: 0,
        backgroundColor: '#2d6a4f',
        borderRadius: 8,
        zIndex: -1, // corretto: lo slider va dietro
    },
    taskCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    taskDescription: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 8,
    },
    taskTitleGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    taskType: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    taskMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    taskLocation: {
        fontSize: 13,
        color: '#6b7280',
    },
    taskBadges: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        fontSize: 11,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        overflow: 'hidden',
        textTransform: 'capitalize',
        fontWeight: '600',
        color: '#fff',
    },
    priority_high: {
        backgroundColor: 'rgba(249, 115, 22, 255)'
    },
    priority_urgent: {
        backgroundColor: 'rgba(239, 68, 68, 255)'
    },
    priority_medium: {
        backgroundColor: 'rgba(234, 179, 8, 255)'
    },
    priority_low: {
        backgroundColor: 'rgba(34, 197, 94, 255)'
    },
    status_scheduled: {
        backgroundColor: 'rgb(243, 244, 246)',
        color: 'rgb(31, 41, 55)',
    },
    status_inProgress: {
        backgroundColor: 'rgb(243, 244, 246)',
        color: 'rgb(31, 41, 55)',
    },
    status_completed: {
        backgroundColor: 'rgb(243, 244, 246)',
        color: 'rgb(31, 41, 55)',
    },
    type_maintenance: {
        backgroundColor: '#06b6d4'
    },
    type_pruning: {
        backgroundColor: '#9333ea'
    },
    type_fertilizing: {
        backgroundColor: '#16a34a'
    },
    type_repair: {
        backgroundColor: '#e11d48'
    },
    taskTime: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 2,
    },
    taskRowJustified: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
