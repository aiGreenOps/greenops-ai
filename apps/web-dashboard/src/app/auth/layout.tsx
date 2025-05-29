'use client';

import React from 'react';
import Image from 'next/image';
import styles from './layout.module.css';
import { useState, useEffect } from 'react';
import { FiMoon, FiSun } from "react-icons/fi";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        document.body.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <>
            <div className={styles.authWrapper}>
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

                <div className={styles.modeToggle}>
                    <button onClick={toggleTheme} className={styles.modeButton}>
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                </div>
            </div>
            <footer className={styles.footer}>
                © 2025 GreenOps AI - All rights reserved.
            </footer>
            {children}
        </>
    );
}
