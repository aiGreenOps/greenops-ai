import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://172.20.10.3:3001';

export default function ManutentoreDashboard() {
    const { user, logout } = useAuth();
    const filters = ['All', 'New', 'In Progress', 'Done'];
    const [activeFilter, setActiveFilter] = useState('All');
    const sliderAnim = useRef(new Animated.Value(0)).current;
    const [buttonWidths, setButtonWidths] = useState<number[]>([]);

    const mockTasks = [
        {
            title: 'Irrigation System Check',
            description: 'Check the sprinklers in the north area of the main garden',
            location: 'Main Garden - North',
            type: 'maintenance',
            priority: 'high',
            status: 'new',
            scheduledAt: '2024-01-15T10:00:00Z',
        },
        {
            title: 'Humidity Sensor Repair',
            description: 'Replace damaged soil humidity sensor in greenhouse B',
            location: 'Greenhouse B',
            type: 'repair',
            priority: 'urgent',
            status: 'inProgress',
            scheduledAt: '2024-01-15T15:00:00Z',
        },
        {
            title: 'Indoor Plant Pruning',
            description: 'Prune indoor plants on the second floor of the main building',
            location: 'Indoor Plants - Level 2',
            type: 'pruning',
            priority: 'medium',
            status: 'done',
            scheduledAt: '2024-01-14T12:00:00Z',
        },
    ];


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


    const resolvedImage = user?.profilePicture?.replace('http://localhost:3001', API_URL);
    if (!user) {
        return (
            <View style={styles.main}>
                <Text style={{ color: '#888' }}>Contenuto in arrivo...</Text>
            </View>
        );
    }

    const handleRefresh = () => {
        // TODO: aggiorna dati
        console.log('refresh...');
    };

    const handleSettings = () => {
        // TODO: naviga alle impostazioni
        console.log('settings...');
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
                            <Text style={styles.statValue}>2</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="clock" style={styles.iconCardYellow} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>In progress</Text>
                            <Text style={styles.statValue}>2</Text>
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

                {mockTasks
                    .filter(task => activeFilter === 'All' || task.status === activeFilter.toLowerCase())
                    .map((task, index) => (
                        <View key={index} style={styles.taskCard}>
                            <View style={styles.taskHeader}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
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
                                    <Text style={styles.taskLocation}>{task.location}</Text>
                                </View>
                                <View style={styles.taskBadges}>
                                    <Text style={[styles.badge, styles[`priority_${task.priority}` as keyof typeof styles]]}>
                                        {task.priority}
                                    </Text>
                                    <Text style={[styles.badge, styles[`status_${task.status}` as keyof typeof styles]]}>
                                        {task.status}
                                    </Text>
                                    <Text style={[styles.badge, styles[`type_${task.type}` as keyof typeof styles]]}>
                                        {task.type}
                                    </Text>

                                </View>
                            </View>

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
                        </View>
                    ))}
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
        backgroundColor: '#f59e0b'
    },
    priority_urgent: {
        backgroundColor: '#dc2626'
    },
    priority_medium: {
        backgroundColor: '#3b82f6'
    },
    priority_low: {
        backgroundColor: '#10b981'
    },
    status_new: {
        backgroundColor: '#6366f1'
    },
    status_inProgress: {
        backgroundColor: '#f97316'
    },
    status_done: {
        backgroundColor: '#22c55e'
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

});
