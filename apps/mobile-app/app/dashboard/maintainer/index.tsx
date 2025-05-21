// app/dashboard/manutentore/index.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';


export default function ManutentoreDashboard() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        // Torna al login e resetta la navigation history
        router.replace('/auth/login');
    };
    if (!user) {
        return (
            <View style={styles.center}>
                <Text>Caricamento...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard Manutentore</Text>
            <View style={styles.info}>
                <Text style={styles.label}>ID Utente:</Text>
                <Text style={styles.value}>{user.userId}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>Nome:</Text>
                <Text style={styles.value}>{user.firstName}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>Cognome:</Text>
                <Text style={styles.value}>{user.lastName}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>Ruolo:</Text>
                <Text style={styles.value}>{user.role}</Text>
            </View>

            {/* Pulsante Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    info: {
        marginBottom: 16,
    },
    label: {
        fontWeight: '600',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
    },
    logoutButton: {
        marginTop: 32,
        backgroundColor: '#e63946',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
