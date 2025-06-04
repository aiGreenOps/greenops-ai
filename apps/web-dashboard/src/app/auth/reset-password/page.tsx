'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "../login/login.module.css";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

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

            router.push(`/auth/notify-reset-password?status=${data.status}`);
        } catch (err) {
            toast.error("Unexpected error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === false) {
        return (
            <main className={styles.page}>
                <div className={styles.formContainer}>
                    <h1 className={styles.formTitle}>Invalid Link</h1>
                    <p className={styles.formParag} style={{ color: "red" }}>
                        This reset link is invalid or has already been used.
                    </p>
                </div>
            </main>
        );
    }

    if (tokenValid === null) {
        return (
            <main className={styles.page}>
                <div className={styles.formContainer}>
                    <h1 className={styles.formTitle}>Verifying link…</h1>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.formContainer}>
                <h1 className={styles.formTitle}>Set a new password</h1>
                <p className={styles.formParag}>
                    Choose a strong password to secure your account.
                </p>
                <form onSubmit={handleReset}>
                    <div className={styles.inputGroup}>
                        <div className={styles.labels}>
                            <label htmlFor="password">New password</label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                        />
                    </div>
                    <button className={styles.submitButton} type="submit" disabled={loading}>
                        {loading ? "Resetting…" : "Reset password"}
                    </button>
                </form>
            </div>
        </main>
    );
}
