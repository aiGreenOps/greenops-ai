// components/BottomBarManutentore.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function BottomBarManutentore() {
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    const isActive = (route: string) => pathname === route;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace('/dashboard/maintainer')}
            >
                <MaterialIcons
                    name="event-note"
                    size={24}
                    color={isActive('/dashboard/maintainer') ? 'rgb(8, 92, 68)' : 'rgb(75, 85, 99)'}
                />
                <Text style={[styles.label, isActive('/dashboard/maintainer') && styles.activeLabel]}>
                    Activity
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace('/dashboard/maintainer/profile')}
            >
                <Feather
                    name="user"
                    size={24}
                    color={isActive('/dashboard/maintainer/profile') ? '#2d6a4f' : '#6b7280'}
                />
                <Text style={[styles.label, isActive('/dashboard/maintainer/profile') && styles.activeLabel]}>
                    Profile
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                    await logout();
                    router.replace('/auth/login');
                }}
            >
                <Feather name="log-out" size={24} color="#6b7280" />
                <Text style={styles.label}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgb(232, 228, 236)',
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingBottom: 24,
        justifyContent: 'space-around',
    },
    button: {
        alignItems: 'center',
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: 'rgb(75, 85, 99)',
        marginTop: 4,
    },
    activeLabel: {
        color: 'rgb(8, 92, 68)',
    },
});
