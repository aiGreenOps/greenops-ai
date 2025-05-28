'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../login/login.module.css";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null = loading, true = ok, false = invalid

    useEffect(() => {
        const checkToken = async () => {
            try {
                const res = await fetch(`${API_URL}/check-reset-token?token=${token}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setTokenValid(true);
            } catch {
                setTokenValid(false);
            }
        };

        if (token) checkToken();
        else setTokenValid(false);
    }, [token]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Errore");

            toast.success("✅ Password aggiornata, ora puoi accedere.");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === false) {
        return (
            <main className={styles.page}>
                <div className={styles.formContainer}>
                    <h1>Link non valido</h1>
                    <p style={{ textAlign: "center", color: "red" }}>
                        Questo link è scaduto o è già stato utilizzato.
                    </p>
                </div>
            </main>
        );
    }

    if (tokenValid === null) {
        return (
            <main className={styles.page}>
                <div className={styles.formContainer}>
                    <h1>Verifica del link…</h1>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.formContainer}>
                <h1>Imposta nuova password</h1>
                <form onSubmit={handleReset}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Nuova password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Inserisci nuova password"
                        />
                    </div>
                    <button className={styles.submitButton} type="submit" disabled={loading}>
                        {loading ? "Reimpostazione…" : "Reimposta password"}
                    </button>
                </form>
            </div>
        </main>
    );
}
