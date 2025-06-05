'use client';

import styles from './layout.module.css';
import { FiMoon, FiSun, FiPower, FiGrid, FiMap, FiSettings, FiBarChart2, FiLogOut } from "react-icons/fi";
import { MdOutlineSensors } from 'react-icons/md';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Image from 'next/image';
import { SensorProvider } from '@/context/SensorContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { user, loading } = useCurrentUser();
    const pathname = usePathname();


    const links = [
        { href: '/dashboard/user', label: 'Dashboard', icon: <FiGrid /> },
        { href: '/dashboard/user/map', label: 'Map View', icon: <FiMap /> },
        { href: '/dashboard/user/sensors', label: 'Sensors', icon: <MdOutlineSensors /> },
        { href: '/dashboard/user/reports', label: 'Reports', icon: <FiBarChart2 /> },
        { href: '/dashboard/user/settings', label: 'Settings', icon: <FiSettings /> },
    ];

    const pageName = (() => {
        const lastSegment = pathname.split('/').filter(Boolean).pop();
        if (!lastSegment || lastSegment.toLowerCase() === 'user') {
            return 'Dashboard';
        }
        return lastSegment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    })();

    useEffect(() => {
        document.body.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <Image
                        className={styles.logoImage}
                        src="/logo-nbg.png"
                        alt="Logo GreenOps"
                        width={60}
                        height={60}
                        unoptimized
                    />
                    <p className={styles.logoText}>GreenOps</p>
                </div>
                <div className={styles.navWrapper}>
                    <nav className={styles.sidebarNav}>
                        {links.map(({ href, label, icon }) => (
                            <Link key={href} href={href} className={`${styles.navItem} ${pathname === href ? styles.active : ''}`}>
                                <span className={styles.icon}>{icon}</span>
                                <span className={styles.label}>{label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className={styles.sidebarFooter}>
                    <div className={styles.profilePictureSidebar}>
                        {user?.profilePicture && (
                            <Image
                                src={user.profilePicture}
                                alt="Profile picture"
                                width={100}
                                height={100}
                                className={styles.profileSidebar}
                            />
                        )}
                    </div>
                    <div className={styles.infoSidebar}>
                        {user?.firstName && user?.lastName && (
                            <p className={styles.nameUserSidebar}>
                                {user.firstName} {user.lastName}
                            </p>
                        )}
                        <p className={styles.logoutSidebar}>
                            <FiLogOut /> <span>Logout</span>
                        </p>
                    </div>
                </div>
            </aside>

            <div className={styles.mainContainer}>
                <header className={styles.topbar}>
                    <p className={styles.namePage}>{pageName}</p>
                    <div className={styles.topbarOptions}>
                        <div className={styles.modeToggle}>
                            <button onClick={toggleTheme} className={styles.modeButton}>
                                {theme === 'light' ? <FiMoon /> : <FiSun />}
                            </button>
                        </div>
                        <div className={styles.modeToggleLogout}>
                            <button className={styles.modeLogout}>
                                <FiPower />
                            </button>
                        </div>
                        <div className={styles.profilePictureWrapper}>
                            {user?.profilePicture && (
                                <Image
                                    src={user.profilePicture}
                                    alt="Profile picture"
                                    width={100}
                                    height={100}
                                    className={styles.profilePicture}
                                />
                            )}
                        </div>
                        {user?.firstName && user?.lastName && (
                            <p className={styles.nameUser}>
                                {user.firstName} {user.lastName}
                            </p>
                        )}
                    </div>
                </header>

                <SensorProvider>
                    <main className={styles.main}>{children}</main>
                </SensorProvider>
            </div>
        </div>
    );
}
