import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AiAssistantModal from '../../../components/AiAssistantModal';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.17:3001';

export default function TaskDetail() {
    const { task } = useLocalSearchParams();
    const [isAiModalVisible, setAiModalVisible] = useState(false);
    const taskData = JSON.parse(task as string);


    const handleAcceptTask = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/activities/${taskData._id}/accept`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Task accepted:', data.activity);
                // Aggiorna stato locale o refetch dati
                alert('Task accepted successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error accepting task');
            }
        } catch (error) {
            alert('Network error');
            console.error(error);
        }
    };

    // Dentro il componente TaskDetail, aggiungi:

    const handleCompleteTask = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/activities/${taskData._id}/complete`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Task completed:', data.activity);
                alert('Task completed successfully!');
                // qui aggiorna lo stato locale o fai refetch se serve
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error completing task');
            }
        } catch (error) {
            alert('Network error');
            console.error(error);
        }
    };


    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/dashboard/maintainer')}>
                    <Feather name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity Details</Text>
            </View>

            {/* MAIN */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.main}>
                <View style={styles.activityCard}>
                    <View style={styles.activityRow}>
                        <Text style={styles.activityTitle}>{taskData.title}</Text>
                        <Text style={[styles.priorityBadge, styles[`priority_${taskData.priority}` as keyof typeof styles]]}>
                            {taskData.priority.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.headerDescription}>
                        {taskData.description}
                    </Text>
                </View>
                <View style={styles.infoBlock}>
                    <View style={styles.infoRow}>
                        <Feather name="map-pin" style={styles.infoItem} />
                        <Text style={styles.infoText}>{taskData.location} Garden</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="calendar" style={styles.infoItem} />
                        <Text style={styles.infoText}>
                            {new Date(taskData.scheduledAt).toLocaleString('en-GB', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            }).replace(',', '').replace(' at', ' at')}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="settings" style={styles.infoItem} />
                        <Text style={styles.infoText}>{capitalize(taskData.type)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="file-text" style={styles.infoItem} />
                        <Text style={styles.infoText}>{capitalize(taskData.status)}</Text>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                {taskData.status !== 'completed' && (
                    <TouchableOpacity onPress={() => setAiModalVisible(true)} style={styles.aiButton}>
                        <LinearGradient
                            colors={['#a855f7', '#3b82f6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.aiButtonText}>Ask GreenOps AI</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {taskData.status === 'scheduled' && (
                    <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTask}>
                        <Text style={styles.acceptButtonText}>Accept Task</Text>
                    </TouchableOpacity>
                )}

                {taskData.status === 'inProgress' && (
                    <TouchableOpacity style={styles.completeButton} onPress={handleCompleteTask}>
                        <Text style={styles.completeButtonText}>Complete Task</Text>
                    </TouchableOpacity>
                )}
            </View>

            <AiAssistantModal
                visible={isAiModalVisible}
                onClose={() => setAiModalVisible(false)}
                taskData={taskData} // 👈 passaggio chiave
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 52.8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(232, 228, 236)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginLeft: 16,
    },
    main: {
        flex: 1,
        backgroundColor: 'rgb(249, 250, 251)',
        padding: 16,
    },
    activityCard: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 12,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginRight: 8,
    },
    priorityBadge: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        fontSize: 12,
        fontWeight: '600',
        borderRadius: 12,
        textTransform: 'uppercase',
        color: '#fff',
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    headerDescription: {
        fontSize: 14,
        color: '#374151',
        fontWeight: 400,
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
    infoBlock: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        gap: 16,

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,

        marginTop: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: 300,
    },
    infoItem: {
        color: '#6b7280',
        fontSize: 14,
    },
    footer: {
        padding: 16,
        backgroundColor: 'rgb(249, 250, 251)',
    },
    aiButton: {
        marginBottom: 12,
    },
    gradientButton: {
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    aiButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: 'rgb(45, 106, 79)',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    completeButton: {
        backgroundColor: 'rgb(45, 106, 79)',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});