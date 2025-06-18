import React from 'react';
import { Slot } from 'expo-router';
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
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <Slot />
                    <Toast config={toastConfig} />
                </SafeAreaView>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
