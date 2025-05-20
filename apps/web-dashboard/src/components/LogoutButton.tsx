"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
    kind: "manager" | "admin";
}

export default function LogoutButton({ kind }: LogoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setLoading(true);
        try {
            const BASE = process.env.NEXT_PUBLIC_API_BASE;
            if (!BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE");

            // Scegli l’endpoint giusto
            const url =
                kind === "admin"
                    ? `${BASE}/api/admin/logout`
                    : `${BASE}/api/auth/logout`;

            const res = await fetch(url, {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                router.push("/auth/login");
            } else {
                console.error("Logout fallito", await res.text());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            style={{
                padding: "8px 16px",
                background: "#e63946",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
            }}
        >
            {loading ? "Uscita…" : "Logout"}
        </button>
    );
}
