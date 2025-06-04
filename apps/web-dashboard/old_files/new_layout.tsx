'use client';

import { useState } from 'react';
import styles from './layout.module.css';
import { FaHome, FaTools, FaUsers, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
                <div className={styles.sidebarLogo}>
                    <Image className={styles.sidebarLogoImage} src="/logo.png" alt="Logo GreenOps" width={50} height={50} />
                    <p className={styles.sidebarLogoText}>Green<span>Ops</span></p>
                </div>

                <nav className={styles.sidebarMenu}>
                    <Link href="/dashboard/user" className={styles.sidebarItem}>
                        <FaHome className={styles.sidebarIcon} />
                        {sidebarOpen && <span className={styles.sidebarLabel}>Dashboard</span>}
                    </Link>

                    <Link href="/dashboard/user/maintenance-workers" className={styles.sidebarItem}>
                        <FaUsers className={styles.sidebarIcon} />
                        {sidebarOpen && <span className={styles.sidebarLabel}>Manutentori</span>}
                    </Link>

                    <Link href="/dashboard/user/maintenance" className={styles.sidebarItem}>
                        <FaTools className={styles.sidebarIcon} />
                        {sidebarOpen && <span className={styles.sidebarLabel}>Interventi</span>}
                    </Link>

                    <Link href="/dashboard/user/reports" className={styles.sidebarItem}>
                        <FaChartBar className={styles.sidebarIcon} />
                        {sidebarOpen && <span className={styles.sidebarLabel}>Segnalazioni</span>}
                    </Link>

                    <Link href="/dashboard/user/settings/profile" className={styles.sidebarItem}>
                        <FaCog className={styles.sidebarIcon} />
                        {sidebarOpen && <span className={styles.sidebarLabel}>Impostazioni</span>}
                    </Link>
                </nav>
            </div>

            <main className={styles.mainContent}>
            </main>
        </div>
    );
}
