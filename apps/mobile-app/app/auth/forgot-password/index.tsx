import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureEvent, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const SWIPE_THRESHOLD = 80;
const { width, height } = Dimensions.get('window');

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
        const { translationX } = e.nativeEvent;
        if (translationX > SWIPE_THRESHOLD) {
            router.replace('/auth/login'); // 👈 swipe verso destra → login
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.select({ ios: 'padding', android: undefined })}
                >
                    <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subTitle}>Enter your email to receive the recovery link</Text>

                        {successMessage ? (
                            <Text style={styles.successText}>{successMessage}</Text>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="mail@example.com"
                                        value={email}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={async () => {
                                        if (!email) return Alert.alert("Error", "Please enter a valid email.");
                                        setLoading(true);
                                        try {
                                            const res = await fetch(`http://192.168.1.183:3001/api/auth/forgot-password`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ email }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message);
                                            setSuccessMessage("If an account exists, you will receive a recovery email.");
                                        } catch (err: any) {
                                            Alert.alert("Error", err.message || "An error occurred while sending the request.");
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>
                                        {loading ? "Sending..." : "Send recovery link"}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    container: {
        paddingLeft: 25,
        paddingRight: 25,
        marginTop: -64,
        backgroundColor: 'rgb(255, 255, 255)',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    subTitle: {
        marginTop: 8,
        marginBottom: 24,
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '300',
        alignSelf: 'center',
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgb(232, 228, 236)',
        borderRadius: 8,
        height: 44,
        paddingHorizontal: 12,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: 'rgb(45, 106, 79)',
        borderRadius: 8,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    successText: { fontSize: 16, color: 'green', textAlign: 'center', marginTop: 12 },
});
