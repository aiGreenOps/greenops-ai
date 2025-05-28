'use client';

import { useState } from "react";
import styles from "../login/login.module.css";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            toast.error("Inserisci la tua email.");
            return;
        }

        if (!emailRegex.test(email)) {
            toast.error("Formato email non valido.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Errore");

            toast.success("Email di recupero inviata.");
        } catch (err: any) {
            toast.error(err.message || "Errore durante l'invio della richiesta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.formContainer}>
                <h1>Recupera Password</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="text" // ← niente validazione HTML
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Inserisci la tua email"
                        />
                    </div>
                    <button className={styles.submitButton} type="submit" disabled={loading}>
                        {loading ? "Invio..." : "Invia Link di Recupero"}
                    </button>
                </form>
            </div>
        </main>
    );
}
