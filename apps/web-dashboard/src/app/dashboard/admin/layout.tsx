// app/dashboard/admin/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("adminToken")?.value;

    if (!adminToken) {
        redirect("/auth/login");
    }

    return <>{children}</>;
}
