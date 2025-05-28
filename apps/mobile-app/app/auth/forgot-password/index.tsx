import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureEvent, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const SWIPE_THRESHOLD = 80;

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
                        <Text style={styles.title}>Recupera Password</Text>

                        {successMessage ? (
                            <Text style={styles.successText}>{successMessage}</Text>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email:</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Inserisci email"
                                        value={email}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={async () => {
                                        if (!email) return Alert.alert("Errore", "Inserisci un'email valida.");
                                        setLoading(true);
                                        try {
                                            const res = await fetch(`http://192.168.1.183:3001/api/auth/forgot-password`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ email }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message);
                                            setSuccessMessage("✅ Se esiste un account, riceverai un'email.");
                                        } catch (err: any) {
                                            Alert.alert("Errore", err.message || "Errore nella richiesta.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>
                                        {loading ? "Invio..." : "Invia link di reset"}
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
    flex: { flex: 1 },
    container: { padding: 25, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
    inputGroup: { marginBottom: 16 },
    label: { marginBottom: 6, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, height: 44, paddingHorizontal: 12 },
    button: { backgroundColor: '#457b9d', borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    successText: { fontSize: 16, color: 'green', textAlign: 'center', marginTop: 12 },
});
