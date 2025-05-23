'use client';

import { useState, useEffect } from 'react';

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

    // Se la prop enabled cambia esternamente, resettiamo il passo
    useEffect(() => {
        if (enabled) {
            setStep('start');
            setQr(null);
            setRecovery([]);
            setToken('');
            setError('');
        }
    }, [enabled]);

    // 1) Abilita 2FA: genera QR
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

    // 2) Verifica TOTP e attiva
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
            onToggle(true);       // notifica il genitore
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
            onToggle(false);      // notifica il genitore
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

    if (step === 'start') {
        return <button onClick={startSetup}>Abilita 2FA</button>;
    }

    if (step === 'verify' && qr) {
        return (
            <div>
                <img src={qr} alt="QR 2FA" style={{ width: 150, height: 150 }} />
                <br></br>
                <input
                    placeholder="Inserisci codice OTP"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                />
                <button onClick={verify}>Verifica e Abilita</button>
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
                <p>2FA abilitata con successo.</p>
            </div>
        );
    }

    return null;
}
