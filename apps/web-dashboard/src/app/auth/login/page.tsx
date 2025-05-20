'use client';

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
import { getDeviceId } from "../../../lib/deviceId";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const API_URL_2FA = process.env.NEXT_PUBLIC_API_BASE!;

export default function LoginPage() {
    const router = useRouter();
    const params = useSearchParams();
    const oauthStatus = params.get("oauthStatus");

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 2FA-specific
    const [twoFaToken, setTwoFaToken] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [useRecovery, setUseRecovery] = useState(false);
    const [error2FA, setError2FA] = useState<string | null>(null);

    useEffect(() => {
        if (oauthStatus === "pending") {
            toast.info("Account in attesa di approvazione.");
        }
        if (oauthStatus === "success") {
            toast.success("Login effettuato!");
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
            const deviceId = getDeviceId();
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, deviceId }),
            });
            const data = await res.json();

            if (data.requires2FA) {
                // Inizia il flusso 2FA
                setTwoFaToken(data.twoFaToken);
            } else if (res.ok) {
                // Login normale → redirect in base al ruolo
                if (data.user.role === "admin") {
                    router.push("/dashboard/admin");
                } else {
                    router.push("/dashboard/user");
                }
            } else {
                throw new Error(data.message || "Errore di login");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError2FA(null);
        setLoading(true);

        try {
            const deviceId = getDeviceId();
            const res = await fetch(`${API_URL_2FA}/api/2fa/authenticate`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    twoFaToken,
                    token: otp,
                    deviceId,
                    useRecoveryCode: useRecovery
                }),
            });
            const data = await res.json();

            if (res.ok) {
                // Dopo 2FA siamo loggati → redirect
                // I manager finiscono su /dashboard/user
                router.push("/dashboard/user");
            } else {
                throw new Error(data.error || "Codice 2FA non valido");
            }
        } catch (err: any) {
            setError2FA(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSocialLogin = (provider: "google" | "github" | "discord") => {
        window.location.href = `${API_URL}/${provider}`;
    };

    // Se siamo in fase di 2FA challenge, mostriamo l'input dedicato
    if (twoFaToken) {
        return (
            <main className={styles.page}>
                <div className={styles.formContainer}>
                    <h1 style={{ textAlign: "center" }}>Verifica 2FA</h1>
                    <form onSubmit={handle2FASubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="otp">Codice OTP o recovery</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                placeholder="Inserisci codice"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={useRecovery}
                                    onChange={e => setUseRecovery(e.target.checked)}
                                />{" "}
                                Usa recovery code
                            </label>
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? "Verifica…" : (
                                <>
                                    <FaSignInAlt style={{ marginRight: 6 }} /> Verifica
                                </>
                            )}
                        </button>
                        {error2FA && <p style={{ color: "red", marginTop: 12 }}>{error2FA}</p>}
                    </form>
                </div>
            </main>
        );
    }

    // Login standard
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

                {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

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
