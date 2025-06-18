import React, { useState } from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../contexts/AuthContext';

export default function MaintainerProfile() {
    const router = useRouter();
    const { user } = useAuth();

    const handleEdit = () => {
        console.log('Edit profile');
    };

    if (!user) {
        return (
            <View style={styles.main}>
                <Text style={{ color: '#888' }}>Contenuto in arrivo...</Text>
            </View>
        );
    }

    const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.183:3001';

    const resolvedImage = user?.profilePicture?.replace('http://localhost:3001', API_URL);


    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/dashboard/maintainer')}>
                    <Feather name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Profile</Text>

                <TouchableOpacity onPress={handleEdit}>
                    <Feather name="edit-3" size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* MAIN */}
            <View style={styles.main}>
                {/* PROFILE CARD */}
                <View style={styles.profileCard}>
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
                </View>

                {/* STATS */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Feather name="check-circle" style={styles.iconCardGreen} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>Activities Done</Text>
                            <Text style={styles.statValue}>47</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="clock" style={styles.iconCardBlue} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>Hours Worked</Text>
                            <Text style={styles.statValue}>156 h</Text>
                        </View>
                    </View>
                </View>
                {/* CONTACT INFO */}
                <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>Contact Info</Text>
                    <View style={styles.contactItem}>
                        <Feather name="mail" size={16} color="#6b7280" />
                        <Text style={styles.contactText}>maintenance@greenspace.com</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Feather name="phone" size={16} color="#6b7280" />
                        <Text style={styles.contactText}>+39 123 456 7890</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Feather name="map-pin" size={16} color="#6b7280" />
                        <Text style={styles.contactText}>Milan, Italy</Text>
                    </View>
                </View>
                <View style={styles.settingsCard}>
                    <View style={styles.settingsRow}>
                        <Feather name="bell" size={18} color="#4b5563" />
                        <Text style={styles.settingsText}>Notifications</Text>
                        <View style={{ flex: 1 }} />
                        <Switch
                            value={true}
                            onValueChange={() => console.log('Toggled')}
                            thumbColor="#fff"
                            trackColor={{ false: '#d1d5db', true: '#2d6a4f' }}
                        />
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingsRow}>
                        <Feather name="shield" size={18} color="#4b5563" />
                        <Text style={styles.settingsText}>Privacy & Security</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingsRow}>
                        <Feather name="settings" size={18} color="#4b5563" />
                        <Text style={styles.settingsText}>App Settings</Text>
                    </TouchableOpacity>
                </View>

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
        height: 52.8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(232, 228, 236)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    main: {
        flex: 1,
        backgroundColor: 'rgb(249, 250, 251)',
        padding: 16,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 20,

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 100,
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
        marginTop: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
    iconCardGreen: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(220, 252, 231, 255)',
        color: 'rgb(22, 101, 52)',
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
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    contactTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        color: '#111827',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    contactText: {
        fontSize: 14,
        color: '#374151',
    },
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },

    settingsText: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '500',
    },

    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginLeft: 30,
    },

});
