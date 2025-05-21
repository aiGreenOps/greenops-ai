// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                {/* edges={['top']} protegge solo la status bar */}
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <Slot />
                </SafeAreaView>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
