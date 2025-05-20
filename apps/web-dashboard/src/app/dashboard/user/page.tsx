"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

interface User {
    id: string;
    email: string;
    role: "user" | "admin" | "manager";
    firstName: string;
    lastName: string;
}

export default function UserDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/me`, {
                    credentials: "include",
                });
                const data = await res.json();
                console.log(data);
                if (!res.ok) throw new Error(data.message || "Errore");
                setUser(data.user);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return null;

    return (
        <main className={styles.page}>
            <header style={{ display: "flex", justifyContent: "space-between" }}>
                <h1>Dashboard Manager</h1>
                <LogoutButton kind="manager"/>
            </header>
            <h2>Benvenuto, {user.firstName}!</h2>
            <p>Ruolo: {user.role}</p>
            {/* qui tutto ciò che serve nella dashboard utente */}
        </main>
    );
}
