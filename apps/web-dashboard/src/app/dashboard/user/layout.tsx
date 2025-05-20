// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    // 1) prendi lo store dei cookie
    const cookieStore = await cookies();

    // 2) leggi il cookie managerToken
    const managerToken = cookieStore.get("managerToken")?.value;

    // 3) se manca, vai al login
    if (!managerToken) {
        redirect("/auth/login");
    }

    // 4) altrimenti mostra la pagina
    return <>{children}</>;
}
