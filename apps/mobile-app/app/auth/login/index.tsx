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
    Dimensions,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

export default function LoginPage() {
    const { login } = useAuth();

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace(`/dashboard/${user.role}`);
        }
    }, [user]);

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
                <Text style={styles.title}>Sign in to your account</Text>
                <Text style={styles.subTitle}>Access your tasks and report green area issues</Text>


                {err ? <Text style={styles.errorText}>{err}</Text> : null}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="mail@example.com"
                        value={email}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Password</Text>
                        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                            <Text style={styles.linkRight}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>


                <TouchableOpacity style={styles.button} onPress={onSubmit}>
                    <AntDesign name="login" size={20} color="#fff" style={{ fontSize: 16, marginRight: 8 }} />
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.line} />
                </View>

                {/** Pulsanti social - placeholder handlers */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton} onPress={() => { }}>
                        <FontAwesome name="google" size={20} color="#DB4437" />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton} onPress={() => { }}>
                        <AntDesign name="github" size={20} color="#6e40c9" />
                        <Text style={styles.socialText}>GitHub</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton} onPress={() => { }}>
                        <FontAwesome5 name="discord" size={20} color="#5865F2" />
                        <Text style={styles.socialText}>Discord</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.registerAdv}>
                        Don’t have an account?{' '}
                        <Text style={styles.link} onPress={() => router.push('/auth/register')}>
                            Sign up
                        </Text>
                    </Text>
                </View>


            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
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
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    linkRight: {
        color: 'rgb(8, 92, 68)',
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
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        width: '100%',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#e8e4ec', // equivalente a var(--border-color)
    },
    dividerText: {
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#4b5563', // equivalente a var(--text-secondary-color)
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 0, // solo su React Native >= 0.71, altrimenti usa marginRight manuale
        marginTop: 16,
    },

    socialButton: {
        flex: 1,
        minWidth: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e8e4ec', // equivalente var(--border-color)
        borderRadius: 6,
        backgroundColor: 'transparent',
        marginHorizontal: 4,
    },

    socialText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000', // equivalente var(--text-primary-color)
        marginLeft: 8,
    },
    footer: {
        marginTop: 16,
        alignItems: 'center',
    },

    registerAdv: {
        fontWeight: '300',
        textAlign: 'center',
        fontSize: 14, // ≈ 0.875rem
        color: '#4b5563', // equivalente var(--text-secondary-color)
    },

    link: {
        color: '#2d6a4f', // equivalente var(--button-primary)
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'none', // opzionale, per ereditare
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // come in CSS
    },

    errorText: {
        color: '#c00',
        marginBottom: 12,
        textAlign: 'center',
    },
});
