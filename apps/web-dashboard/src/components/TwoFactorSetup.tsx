'use client';

import { useState, useEffect } from 'react';
import styles from '../app/dashboard/user/settings/settings.module.css'

interface Props {
    enabled: boolean;
    onToggle: (newState: boolean) => void;
}

export default function TwoFactorSetup({ enabled, onToggle }: Props) {
    const [step, setStep] = useState<'start' | 'verify' | 'done'>('start');
    const [qr, setQr] = useState<string | null>(null);
    const [token, setToken] = useState('');
    const [recovery, setRecovery] = useState<string[]>([]);
    const [error, setError] = useState('');

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

    // Reset UI se 2FA è già abilitata
    useEffect(() => {
        if (enabled) {
            setStep('start');
            setQr(null);
            setRecovery([]);
            setToken('');
            setError('');
        }
    }, [enabled]);

    // Se 2FA non è attiva, genera subito QR al montaggio
    useEffect(() => {
        if (!enabled && step === 'start') {
            startSetup();
        }
    }, [enabled, step]);

    // 1) Richiedi setup QR
    const startSetup = async () => {
        setError('');
        const res = await fetch(`${API_BASE}/api/2fa/setup`, {
            method: 'POST',
            credentials: 'include'
        });
        if (res.ok) {
            const { qr: dataUrl } = await res.json();
            setQr(dataUrl);
            setStep('verify');
        } else {
            const err = await res.text();
            setError(err || 'Errore in startSetup');
        }
    };

    // 2) Verifica token OTP
    const verify = async () => {
        setError('');
        const res = await fetch(`${API_BASE}/api/2fa/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const json = await res.json();
        if (res.ok) {
            setRecovery(json.recoveryCodes);
            setStep('done');
            onToggle(true); // comunica al parent che 2FA è attiva
        } else {
            setError(json.error || 'Verifica fallita');
        }
    };

    // 3) Disabilita 2FA
    const disable2FA = async () => {
        setError('');
        const res = await fetch(`${API_BASE}/api/2fa/disable`, {
            method: 'POST',
            credentials: 'include'
        });
        if (res.ok) {
            onToggle(false);
            // reset UI
            setStep('start');
            setQr(null);
            setRecovery([]);
            setToken('');
        } else {
            const err = await res.text();
            setError(err || 'Impossibile disabilitare');
        }
    };

    // Render dinamico

    if (enabled) {
        return (
            <div>
                <p>2FA è attualmente <strong>abilitata</strong>.</p>
                <button onClick={disable2FA}>Disabilita 2FA</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        );
    }

    if (step === 'verify' && qr) {
        return (
            <div className={styles.popContainer}>
                <p className={styles.textPop}>Scan QR Code</p>
                <img className={styles.popImage} src={qr} alt="QR 2FA" />
                <br />
                <div className={styles.inputGroup}>
                    <input
                        placeholder="Enter OTP code"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                    />
                </div>
                <button className={`${styles.submitButton} ${styles.btnPop}`} onClick={verify}>Verify and Enable</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div>
                <h4>Salva i recovery codes:</h4>
                <ul>
                    {recovery.map(c => <li key={c}>{c}</li>)}
                </ul>
                <p>✅ 2FA abilitata con successo.</p>
            </div>
        );
    }

    return null;
}
