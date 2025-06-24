import React, { useState } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import ImageView from 'react-native-image-viewing';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

type Report = {
    title: string;
    description: string;
    location: string;
    priority: Priority;
    status: 'pending' | 'accepted' | 'rejected';
    submittedAt: string;
    _id: string;
};

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.17:3001';

export default function ReportDetail() {
    const { report } = useLocalSearchParams();
    const [isAiModalVisible, setAiModalVisible] = useState(false);
    const reportData = JSON.parse(report as string);
    const [visibleImageIndex, setVisibleImageIndex] = useState<number | null>(null);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const handleDelete = async () => {
        Alert.alert(
            'Delete Report',
            'Are you sure you want to delete this report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/api/report-mobile/${reportData._id}`, {
                                method: 'DELETE',
                            });

                            if (res.ok) {
                                Alert.alert('Deleted', 'The report has been removed.');
                                router.replace('/dashboard/employee');
                            } else {
                                const err = await res.json();
                                Alert.alert('Error', err.message || 'Failed to delete');
                            }
                        } catch (err) {
                            console.error(err);
                            Alert.alert('Error', 'Something went wrong');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/dashboard/employee')}>
                    <Feather name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Report Details</Text>

                <TouchableOpacity onPress={handleDelete} style={styles.trashButton}>
                    <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* MAIN */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.main}>
                <View style={styles.reportCard}>
                    <View style={styles.reportRow}>
                        <Text style={styles.reportTitle}>{reportData.title}</Text>
                        <Text style={[styles.priorityBadge, styles[`priority_${reportData.priority}` as keyof typeof styles]]}>
                            {reportData.priority.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.headerDescription}>{reportData.description}</Text>
                </View>

                <View style={styles.infoBlock}>
                    <View style={styles.infoRow}>
                        <Feather name="map-pin" style={styles.infoItem} />
                        <Text style={styles.infoText}>{capitalize(reportData.location)} Garden</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="calendar" style={styles.infoItem} />
                        <Text style={styles.infoText}>
                            {new Date(reportData.submittedAt).toLocaleString('en-GB', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            }).replace(',', '')}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="file-text" style={styles.infoItem} />
                        <Text style={styles.infoText}>{capitalize(reportData.status)}</Text>
                    </View>
                </View>

                <View style={styles.photoSection}>
                    <View style={styles.photoHeader}>
                        <Text style={styles.photoTitle}>
                            Attached photos {reportData.photos?.length ? `(${reportData.photos.length})` : ''}
                        </Text>
                    </View>

                    <View style={styles.imageGrid}>
                        {reportData.photos?.length > 0 ? (
                            reportData.photos.map((uri: string, index: number) => (
                                <TouchableOpacity key={index} onPress={() => setVisibleImageIndex(index)}>
                                    <Image
                                        source={{ uri: `${API_URL}${uri}` }}
                                        style={styles.previewImage}
                                    />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyNote}>No photos attached</Text>
                        )}
                    </View>

                    {visibleImageIndex !== null && (
                        <ImageView
                            images={reportData.photos.map((uri: string) => ({ uri: `${API_URL}${uri}` }))}
                            imageIndex={visibleImageIndex}
                            visible={true}
                            onRequestClose={() => setVisibleImageIndex(null)}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
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
    reportCard: { flexDirection: 'column', marginBottom: 12 },
    reportRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    reportTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginRight: 8 },
    headerDescription: { fontSize: 14, color: '#374151', fontWeight: '400' },
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
    priority_high: { backgroundColor: 'rgba(249, 115, 22, 255)' },
    priority_urgent: { backgroundColor: 'rgba(239, 68, 68, 255)' },
    priority_medium: { backgroundColor: 'rgba(234, 179, 8, 255)' },
    priority_low: { backgroundColor: 'rgba(34, 197, 94, 255)' },
    infoBlock: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
        marginTop: 12,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, color: '#374151', fontWeight: '300' },
    infoItem: { color: '#6b7280', fontSize: 14 },
    footer: { padding: 16, backgroundColor: 'rgb(249, 250, 251)' },
    aiButton: { marginBottom: 12 },
    gradientButton: { borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
    aiButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    photoSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    photoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    photoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    emptyNote: {
        fontSize: 12,
        color: '#374151',
        fontWeight: 300,
    },
    trashButton: {
        position: 'absolute',
        right: 20,
    },
});