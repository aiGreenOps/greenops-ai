'use client';

import { FiLogOut, FiPower } from "react-icons/fi";
import styles from '../app/dashboard/user/layout.module.css'

interface Props {
    type: 'sidebar' | 'topbar';
}

export function AdminLogout({ type }: Props) {
    const handleLogout = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) throw new Error();
            window.location.href = "/auth/login";
        } catch (err) {
            alert("Errore durante il logout.");
        }
    };

    if (type === 'sidebar') {
        return (
            <p className={styles.logoutSidebar} onClick={handleLogout}>
                <FiLogOut /> <span>Logout</span>
            </p>
        );
    }

    return (
        <button className={styles.modeLogout} onClick={handleLogout}>
            <FiPower />
        </button>
    );
}
