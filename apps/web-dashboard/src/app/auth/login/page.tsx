"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FaGoogle,
    FaGithub,
    FaDiscord,
    FaSignInAlt,
} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
    const router = useRouter();
    const params = useSearchParams();
    const oauthStatus = params.get("oauthStatus");
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (oauthStatus === "pending") {
            toast.info("Account in attesa di approvazione.");
        }
        if (oauthStatus === "success") {
            toast.success("Login effettuato!");
            // opzionale: fai subito il push in dashboard
            setTimeout(() => router.push("/dashboard"), 1000);
        }
    }, [oauthStatus, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Errore sconosciuto");
            
            if (data.user.role === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard/user");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSocialLogin = (provider: "google" | "github" | "discord") => {
        window.location.href = `${API_URL}/${provider}`;
    };

    return (
        <main className={styles.page}>
            <div className={styles.formContainer}>
                <h1 style={{ textAlign: "center" }}>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Inserisci email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password:</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Inserisci password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Caricamento…" : (
                            <>
                                <FaSignInAlt style={{ marginRight: 6 }} /> Accedi
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <p style={{ color: "red", marginTop: 12 }}>{error}</p>
                )}

                <hr style={{ margin: "20px 0" }} />

                <button
                    className={styles.socialButton}
                    onClick={() => onSocialLogin("google")}
                >
                    <FaGoogle style={{ marginRight: 6 }} />
                    Login con Google
                </button>

                <button
                    className={styles.socialButton}
                    onClick={() => onSocialLogin("github")}
                >
                    <FaGithub style={{ marginRight: 6 }} />
                    Login con GitHub
                </button>

                <button
                    className={styles.socialButton}
                    onClick={() => onSocialLogin("discord")}
                >
                    <FaDiscord style={{ marginRight: 6 }} />
                    Login con Discord
                </button>

                <p style={{ textAlign: "center", marginTop: 20 }}>
                    Non hai un account?{" "}
                    <Link href="/auth/register" style={{ color: "#1d3557" }}>
                        Registrati
                    </Link>
                </p>
            </div>
        </main>
    );
}
