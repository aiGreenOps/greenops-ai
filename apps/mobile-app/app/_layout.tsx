import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
    success: (props: any) => <BaseToast {...props} />,
    error: (props: any) => <ErrorToast {...props} />,
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                {/* Imposta status bar visibile con testo scuro su sfondo bianco */}
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
                    <Slot />
                    <Toast config={toastConfig} />
                </SafeAreaView>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
