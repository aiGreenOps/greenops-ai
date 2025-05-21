// app/auth/login/index.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { AntDesign, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');

    const onSubmit = async () => {
        try {
            const user = await login(email, password);
            // console.log(user);
            router.replace(`/dashboard/${user.role}`);
        } catch (e: any) {
            setErr('Email o password non valide');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                scrollEnabled={false}
            >
                <Text style={styles.title}>Login</Text>

                {err ? <Text style={styles.errorText}>{err}</Text> : null}

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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Inserisci password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={onSubmit}>
                    <AntDesign name="login" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Accedi</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/** Pulsanti social - placeholder handlers */}
                <TouchableOpacity style={styles.socialButton} onPress={() => {/* goAuth('google') */ }}>
                    <FontAwesome name="google" size={20} style={styles.socialIcon} />
                    <Text style={styles.socialText}>Login con Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={() => {/* goAuth('github') */ }}>
                    <AntDesign name="github" size={20} style={styles.socialIcon} />
                    <Text style={styles.socialText}>Login con GitHub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={() => {/* goAuth('discord') */ }}>
                    <FontAwesome5 name="discord" size={20} style={styles.socialIcon} />
                    <Text style={styles.socialText}>Login con Discord</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text>Non hai un account? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/register')}>
                        <Text style={styles.link}>Registrati</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        padding: 25,
        paddingTop: 25,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        alignSelf: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 8,
        height: 44,
        paddingHorizontal: 12,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#457b9d',
        borderRadius: 8,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 24,
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
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 8,
        height: 44,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    socialIcon: {
        color: '#333',
        marginRight: 12,
    },
    socialText: {
        fontSize: 14,
        color: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    link: {
        color: '#1d3557',
        fontWeight: '600',
    },
    errorText: {
        color: '#c00',
        marginBottom: 12,
        textAlign: 'center',
    },
});
