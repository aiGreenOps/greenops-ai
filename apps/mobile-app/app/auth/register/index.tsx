import React, { useState, useMemo, useEffect } from 'react';
import { PanGestureHandler, GestureHandlerRootView, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'; // ✅ toast importato
import { useAuth } from '../../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const roleLabels: Record<'dipendente' | 'manutentore', string> = {
    dipendente: 'Employee',
    manutentore: 'Maintainer',
};

export default function RegisterPage() {
    const params = useLocalSearchParams<{
        invitationToken?: string;
        email?: string;
        role?: string;
    }>();

    const invitationToken = params.invitationToken;
    const invitedEmail = params.email ?? '';

    let invitedRole: 'dipendente' | 'manutentore' = 'dipendente';
    if (params.role === 'maintainer' || params.role === 'manutentore') invitedRole = 'manutentore';
    else if (params.role === 'employee' || params.role === 'dipendente') invitedRole = 'dipendente';

    const isInvited = Boolean(invitationToken);
    const { register } = useAuth();

    const [form, setForm] = useState({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        password: '',
        confirm: '',
        role: 'dipendente' as 'dipendente' | 'manutentore',
    });
    const [errors, setErrors] = useState<string>('');

    const SWIPE_THRESHOLD = 80;

    const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
        const { translationX } = e.nativeEvent;
        if (translationX > SWIPE_THRESHOLD) {
            router.replace('/auth/login');
        }
    };

    useEffect(() => {
        if (isInvited) {
            setForm(f => ({
                ...f,
                email: invitedEmail,
                role: invitedRole,
            }));
        }
    }, [isInvited, invitedEmail, invitedRole]);

    const onChange = (field: keyof typeof form, value: string) => {
        if (isInvited && (field === 'email' || field === 'role')) return;
        setForm(f => ({ ...f, [field]: value }));
    };

    const passwordRules = useMemo(() => {
        const pwd = form.password;
        return {
            minLength: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            specialChar: /[^A-Za-z0-9]/.test(pwd),
        };
    }, [form.password]);

    const onSubmit = async () => {
        const rules = passwordRules;
        const allValid = Object.values(rules).every(Boolean);

        if (!allValid) {
            Toast.show({
                type: 'error',
                text1: 'Invalid password',
                text2: 'It must contain 8+ chars, uppercase, number and special symbol.',
            });
            return;
        }

        try {
            await register({
                nome: form.nome,
                cognome: form.cognome,
                email: form.email,
                telefono: form.telefono,
                password: form.password,
                role: form.role,
                ...(isInvited && { invitationToken }),
            });

            Toast.show({
                type: 'success',
                text1: 'Registration successful',
                text2: 'You can now log in',
            });

            setTimeout(() => router.replace('/auth/login'), 500); // redirect dopo il toast
        } catch (e: any) {
            Toast.show({
                type: 'error',
                text1: 'Registration failed',
                text2: e.message || 'Unexpected error occurred',
            });
            setErrors(e.message || 'Errore di registrazione');
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <KeyboardAvoidingView
                    behavior={Platform.select({ ios: 'padding', android: undefined })}
                    style={styles.flex}
                >
                    <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
                        <Text style={styles.title}>Create your account</Text>
                        <Text style={styles.subTitle}>Join to report issues and help manage green spaces</Text>

                        {/* DATI ANAGRAFICI */}
                        {[
                            {
                                label: 'First name',
                                key: 'nome',
                                keyboardType: 'default',
                                textContentType: 'givenName',
                                autoComplete: 'name-given',
                                autoCapitalize: 'words',
                            },
                            {
                                label: 'Last name',
                                key: 'cognome',
                                keyboardType: 'default',
                                textContentType: 'familyName',
                                autoComplete: 'name-family',
                                autoCapitalize: 'words',
                            },
                            {
                                label: 'Email',
                                key: 'email',
                                keyboardType: 'email-address',
                                textContentType: 'emailAddress',
                                autoComplete: 'email',
                                autoCapitalize: 'none',
                            },
                            {
                                label: 'Phone Number',
                                key: 'telefono',
                                keyboardType: 'phone-pad',
                                textContentType: 'telephoneNumber',
                                autoComplete: 'tel',
                                autoCapitalize: 'none',
                            },
                        ].map(({ label, key, keyboardType, textContentType, autoComplete, autoCapitalize }) => (
                            <View key={key} style={styles.inputGroup}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={(form as any)[key]}
                                    onChangeText={v => onChange(key as any, v)}
                                    keyboardType={keyboardType as any}
                                    textContentType={textContentType as any}
                                    autoComplete={autoComplete as any}
                                    autoCapitalize={autoCapitalize as any}
                                    editable={!(isInvited && key === 'email')}
                                />
                            </View>
                        ))}

                        {/* PASSWORD */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={form.password}
                                onChangeText={v => onChange('password', v)}
                                textContentType="newPassword"
                                autoComplete="password-new"
                            />
                        </View>

                        {/* SELETTORE RUOLO */}
                        <View style={styles.inputGroup}>
                            <View style={styles.roleContainer}>
                                {(['dipendente', 'manutentore'] as const).map((r, i) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[
                                            styles.roleButton,
                                            form.role === r && styles.roleButtonActive,
                                            i > 0 && styles.roleButtonSpacing,
                                        ]}
                                        onPress={() => onChange('role', r)}
                                        disabled={isInvited}
                                    >
                                        <Text
                                            style={[
                                                styles.roleText,
                                                form.role === r && styles.roleTextActive,
                                            ]}
                                        >
                                            {roleLabels[r]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* REGISTRAZIONE */}
                        <TouchableOpacity style={styles.button} onPress={onSubmit}>
                            <FontAwesome5 name="user-plus" size={18} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>

                        {/* FOOTER */}
                        <View style={styles.footer}>
                            <Text style={styles.registerAdv}>
                                Already have an account?{' '}
                                <Text style={styles.link} onPress={() => router.replace('/auth/login')}>
                                    Sign in
                                </Text>
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        paddingLeft: 25,
        paddingRight: 25,
        justifyContent: 'center',
        backgroundColor: 'rgb(255, 255, 255)',
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
    buttonIcon: {
        marginRight: 8, // spazio tra icona e testo
        fontSize: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgb(232, 228, 236)',
        borderRadius: 8,
        alignItems: 'center'
    },
    roleButtonSpacing: {
        marginLeft: 10
    },
    roleButtonActive: {
        backgroundColor: 'rgb(45, 106, 79)',
        borderColor: 'rgb(45, 106, 79)'
    },
    roleText: {
        color: '#333',
        fontWeight: '500'
    },
    roleTextActive: {
        color: '#fff',
        fontWeight: '600'
    },
    footer: {
        marginTop: 0,
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
    errorText: { color: '#c00', marginBottom: 12, textAlign: 'center' },
});
