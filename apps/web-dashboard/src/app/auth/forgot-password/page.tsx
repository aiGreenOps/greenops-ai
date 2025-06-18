'use client';

import { useState } from "react";
import styles from "../login/login.module.css"; // stessa classe della login
import { toast } from "react-toastify";
import Link from "next/link";

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
                <h1 className={styles.formTitle}>Reset Password</h1>
                <p className={styles.formParag}>
                    Enter your email to receive the recovery link
                </p>


                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <div className={styles.labels}>
                            <label htmlFor="email">Email</label>
                        </div>
                        <input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="mail@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send recovery link"}
                    </button>
                </form>
                <p className={`${styles.registerAdv} ${styles.advMoreSpace}`}>
                    Remember your password?{" "}
                    <Link href="/auth/login" className={styles.link}>
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
