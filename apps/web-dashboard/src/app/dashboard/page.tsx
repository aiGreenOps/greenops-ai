// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function DashboardIndex() {
    const router = useRouter();

    useEffect(() => {
        // 1) chiamo l'endpoint /me per sapere chi è loggato
        fetch(`${API_URL}/me`, { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) throw new Error("Non autenticato");
                return res.json();
            })
            .then(({ user }) => {
                // 2) redirect in base al ruolo
                if (user.role === "admin") {
                    router.replace("/dashboard/admin");
                } else {
                    router.replace("/dashboard/user");
                }
            })
            .catch(() => {
                // se non autenticato torna al login
                router.replace("/auth/login");
            });
    }, [router]);

    return <p>Reindirizzamento in corso…</p>;
}
