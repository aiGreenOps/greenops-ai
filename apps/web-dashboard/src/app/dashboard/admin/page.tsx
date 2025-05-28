"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import LogoutButton from "@/components/LogoutButton";
import styles from "./page.module.css";
import { toast } from "react-toastify";


interface PendingUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE!;
const socket: Socket = io(API, { withCredentials: true });

export default function AdminDashboard() {
    const [pending, setPending] = useState<PendingUser[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(false);

    // 1) carica i manager in pending
    const fetchPending = async () => {
        try {
            const res = await fetch(`${API}/api/admin/users/pending`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Errore");
            setPending(data);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // 2) approva o rifiuta
    const handleAction = async (id: string, action: "approve" | "reject") => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API}/api/admin/users/${id}/${action}`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(data.message);
            await fetchPending();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();

        socket.on("newPendingManager", (user: PendingUser) => {
            setPending((prev) => [user, ...prev]);
        });

        return () => {
            socket.off("newPendingUser");
        };
    }, []);

    // 3) invito manager
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inviteEmail.trim() || !isValidEmail(inviteEmail)) {
            toast.error("Inserisci un'email valida.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/users/invite`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(data.message);
            setInviteEmail("");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return (
        <main className={styles.page}>
            <header style={{ display: "flex", justifyContent: "space-between" }}>
                <h1>Dashboard Admin</h1>
                <LogoutButton kind="admin" />
            </header>

            <section className={styles.inviteSection}>
                <h2>Invita un nuovo Manager</h2>
                <form onSubmit={handleInvite}>
                    <input
                        type="text"
                        placeholder="Email manager"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Invio…" : "Invita"}
                    </button>
                </form>
            </section>

            <section className={styles.pendingSection}>
                <h2>Manager in attesa di approvazione</h2>
                {pending.length === 0 ? (
                    <p>Nessun manager in attesa.</p>
                ) : (
                    <ul className={styles.userList}>
                        {pending.map((u) => (
                            <li key={u._id} className={styles.userItem}>
                                <span>{u.firstName} {u.lastName} ({u.email})</span>
                                <div>
                                    <button
                                        onClick={() => handleAction(u._id, "approve")}
                                        disabled={loading}
                                    >
                                        Approva
                                    </button>
                                    <button
                                        onClick={() => handleAction(u._id, "reject")}
                                        disabled={loading}
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
