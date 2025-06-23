// app/dashboard/dipendente/index.tsx
import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.17:3001';

type FilterKey = 'All' | 'Pending' | 'Accepted' | 'Rejected';

const statusMap: Record<FilterKey, string | null> = {
    All: null,
    Pending: 'pending',
    Accepted: 'accepted',
    Rejected: 'rejected',
};

export default function DipendenteDashboard() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);


    const filters = ['All', 'Pending', 'Accepted', 'Rejected'];
    const [activeFilter, setActiveFilter] = useState('All');
    const sliderAnim = useRef(new Animated.Value(0)).current;
    const [buttonWidths, setButtonWidths] = useState<number[]>([]);

    const resolvedImage = user?.profilePicture?.replace('http://localhost:3001', API_URL);

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

    const handleSettings = () => {
        router.replace('/dashboard/employee/profile');
    };


    const handleRefresh = () => {
    };

    const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

    const handlePress = () => {
        router.replace('/dashboard/employee/report-add');
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
                    <Text style={styles.role}>{capitalize(user.role)}</Text>
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
                        <Feather name="clock" style={styles.iconCardBlue} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>Pending</Text>
                            <Text style={styles.statValue}>1</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="check-circle" style={styles.iconCardGreen} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>Accepted</Text>
                            <Text style={styles.statValue}>2</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handlePress}>
                    <View style={styles.iconContainer}>
                        <Feather name="plus" style={styles.iconCardYellow} size={20} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Add new report</Text>
                        <Text style={styles.subtitle}>Tap to start</Text>
                    </View>
                    <Feather name="chevron-right" size={20} style={styles.chevron} />
                </TouchableOpacity>

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
            </View>

        </View>
    );
}
const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        borderColor: 'rgb(232, 228, 236)',
        // borderWidth: 1,

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    iconContainer: {
        backgroundColor: 'rgb(254, 249, 195)',
        color: 'rgb(202, 138, 4)',
        borderRadius: 8,
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
        color: '#fff',
    },
    textContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: 300,
    },
    chevron: {
        marginLeft: 8,

    },
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
    main: {
        flex: 1,
        backgroundColor: 'rgb(249, 250, 251)',
        padding: 16,
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
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgb(254, 249, 195)',
        color: 'rgb(202, 138, 4)',
    },
    iconCardGreen: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(220, 252, 231, 255)',
        color: 'rgb(22, 101, 52)',
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
});