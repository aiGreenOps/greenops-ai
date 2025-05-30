'use client';

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import LogoutButton from "@/components/LogoutButton";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import styles from "./page.module.css";
import { toast } from "react-toastify";

const API = process.env.NEXT_PUBLIC_API_BASE!;
const socket: Socket = io(API, { withCredentials: true });

interface User {
    id: string;
    email: string;
    role: "user" | "admin" | "manager";
    firstName: string;
    lastName: string;
    twoFactorEnabled: boolean;
}

interface PendingUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function ManagerDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // --- pending/invite state ---
    const [pending, setPending] = useState<PendingUser[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // fetch me
    const fetchMe = async () => {
        try {
            const res = await fetch(`${API}/api/auth/me`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Errore nel recupero utente");
            setUser(data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // fetch pending maintainers
    const fetchPending = async () => {
        try {
            const res = await fetch(`${API}/api/manager/users/pending`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Errore nel recupero dei manutentori in attesa");
            setPending(data);
        } catch (err: any) {
            toast.error(err.message || "Errore imprevisto durante il fetch");
        }
    };


    useEffect(() => {
        fetchMe();
        fetchPending();

        socket.on("newPendingMaintainer", (u: PendingUser) => {
            setPending(prev => [u, ...prev]);
        });
        return () => {
            socket.off("newPendingMaintainer");
        };
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API}/api/manager/users/${id}/${action}`, {
                method: "PATCH",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Errore durante l'operazione");

            toast.success(data.message || `Utente ${action === "approve" ? "approvato" : "rifiutato"} con successo`);
            await fetchPending();
        } catch (err: any) {
            toast.error(err.message || "Errore imprevisto");
        } finally {
            setActionLoading(false);
        }
    };


    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!inviteEmail.trim()) {
            toast.error("Inserisci un'email.");
            return;
        }

        if (!emailRegex.test(inviteEmail)) {
            toast.error("Email non valida.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`${API}/api/manager/users/invite`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Errore invito");
            toast.success(data.message);
            setInviteEmail("");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };


    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (loading || !user) return null;

    return (
        <main className={styles.page}>
            <header style={{ display: "flex", justifyContent: "space-between" }}>
                <h1>Dashboard Manager</h1>
                <LogoutButton kind="manager" />
            </header>

            <h2>Benvenuto, {user.firstName}!</h2>
            <p>Ruolo: {user.role}</p>

            <TwoFactorSetup
                enabled={user.twoFactorEnabled}
                onToggle={(newState) =>
                    setUser(u => u ? { ...u, twoFactorEnabled: newState } : u)
                }
            />

            {/* Invite Section */}
            <section className={styles.inviteSection}>
                <h3>Invita un nuovo Manutentore</h3>
                <form onSubmit={handleInvite} style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Email manutentore"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        disabled={actionLoading}
                    />

                    <button type="submit" disabled={actionLoading}>
                        {actionLoading ? "Invio…" : "Invita"}
                    </button>
                </form>
            </section>

            {/* Pending Section */}
            <section className={styles.pendingSection}>
                <h3>Manutentori in attesa di approvazione</h3>
                {pending.length === 0 ? (
                    <p>Nessun manutentore in attesa.</p>
                ) : (
                    <ul className={styles.userList}>
                        {pending.map(u => (
                            <li key={u._id} className={styles.userItem}>
                                <span>
                                    {u.firstName} {u.lastName} ({u.email})
                                </span>
                                <div>
                                    <button
                                        onClick={() => handleAction(u._id, "approve")}
                                        disabled={actionLoading}
                                    >
                                        Approva
                                    </button>
                                    <button
                                        onClick={() => handleAction(u._id, "reject")}
                                        disabled={actionLoading}
                                    >
                                        Rifiuta
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
