// app/auth/register/index.tsx

import { AntDesign } from '@expo/vector-icons';
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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';

export default function RegisterPage() {
    const params = useLocalSearchParams<{
        invitationToken?: string;
        email?: string;
        role?: string;
    }>();

    const invitationToken = params.invitationToken;
    const invitedEmail = params.email ?? '';

    let invitedRole: 'dipendente' | 'manutentore' = 'dipendente';

    if (params.role === 'maintainer' || params.role === 'manutentore') {
        invitedRole = 'manutentore';
    } else if (params.role === 'employee' || params.role === 'dipendente') {
        invitedRole = 'dipendente';
    }

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

    // Quando arrivano i params, popola email + role
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
        // blocca email e role se invitato
        if (isInvited && (field === 'email' || field === 'role')) return;
        setForm(f => ({ ...f, [field]: value }));
    };

    // password rules
    const passwordRules = useMemo(() => {
        const pwd = form.password;
        return {
            minLength: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            specialChar: /[^A-Za-z0-9]/.test(pwd),
            confirmMatch: pwd === form.confirm && pwd.length > 0,
        };
    }, [form.password, form.confirm]);

    const rulesList: { key: keyof typeof passwordRules; label: string }[] = [
        { key: 'minLength', label: 'Minimo 8 caratteri' },
        { key: 'uppercase', label: 'Una lettera maiuscola' },
        { key: 'number', label: 'Un numero' },
        { key: 'specialChar', label: 'Un carattere speciale' },
        { key: 'confirmMatch', label: 'Password confermata' },
    ];

    const onSubmit = async () => {
        if (form.password !== form.confirm) {
            setErrors('Le password non corrispondono');
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
            router.replace('/auth/login');
        } catch (e: any) {
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
                        <Text style={styles.title}>Registrazione</Text>

                        {errors ? <Text style={styles.errorText}>{errors}</Text> : null}

                        {/* DATI ANAGRAFICI */}
                        {[
                            { label: 'Nome', key: 'nome' },
                            { label: 'Cognome', key: 'cognome' },
                            { label: 'Email', key: 'email', keyboardType: 'email-address' },
                            { label: 'Telefono', key: 'telefono', keyboardType: 'phone-pad' },
                        ].map(({ label, key, keyboardType }) => (
                            <View key={key} style={styles.inputGroup}>
                                <Text style={styles.label}>{label}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={(form as any)[key]}
                                    onChangeText={v => onChange(key as any, v)}
                                    keyboardType={keyboardType as any}
                                    autoCapitalize={key === 'email' ? 'none' : 'sentences'}
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
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Conferma Password</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={form.confirm}
                                onChangeText={v => onChange('confirm', v)}
                            />
                        </View>

                        {/* REQUISITI */}
                        <View style={styles.requirements}>
                            {rulesList.map(({ key, label }) => {
                                const ok = passwordRules[key];
                                return (
                                    <View key={key} style={styles.reqRow}>
                                        <AntDesign
                                            name={ok ? 'checkcircle' : 'checkcircleo'}
                                            size={16}
                                            color={ok ? '#4caf50' : '#ccc'}
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={[styles.reqItem, ok && styles.reqItemOk]}>
                                            {label}
                                        </Text>
                                    </View>
                                );
                            })}
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
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* REGISTRATI */}
                        <TouchableOpacity style={styles.button} onPress={onSubmit}>
                            <Text style={styles.buttonText}>Registrati</Text>
                        </TouchableOpacity>

                        {/* FOOTER */}
                        <View style={styles.footer}>
                            <Text>Hai già un account? </Text>
                            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                                <Text style={styles.link}>Accedi</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </PanGestureHandler>
        </GestureHandlerRootView >
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { padding: 25, paddingTop: 25, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
    inputGroup: { marginBottom: 16 },
    label: { marginBottom: 6, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, height: 44, paddingHorizontal: 12 },
    requirements: { marginBottom: 24, paddingLeft: 4 },
    reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    reqItem: { fontSize: 12, color: '#666' },
    reqItemOk: { color: '#4caf50', textDecorationLine: 'line-through' },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    roleButton: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#bbb', borderRadius: 8, alignItems: 'center' },
    roleButtonSpacing: { marginLeft: 10 },
    roleButtonActive: { backgroundColor: '#457b9d', borderColor: '#457b9d' },
    roleText: { color: '#333', fontWeight: '500' },
    roleTextActive: { color: '#fff', fontWeight: '600' },
    button: { backgroundColor: '#457b9d', borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
    link: { color: '#1d3557', fontWeight: '600' },
    errorText: { color: '#c00', marginBottom: 12, textAlign: 'center' },
});
