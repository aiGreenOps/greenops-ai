import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLogout } from '@/components/AdminLogout';
import { FiMoon, FiSun, FiPower, FiSettings, FiLogOut, FiBarChart2, FiGrid } from "react-icons/fi";
import styles from '../user/layout.module.css';
import Link from 'next/link';
import Image from 'next/image';

interface AdminDashboardLayoutProps {
    children: React.ReactNode;
}

async function getAdminData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
        redirect("/auth/login");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/me`, {
        headers: {
            Cookie: `adminToken=${token}`,
        },
        cache: "no-store",
    });

    return res.json();
}

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
    const admin = await getAdminData();

    const links = [
        { href: '/dashboard/admin/main', label: 'Dashboard', icon: <FiGrid /> },
        { href: '/dashboard/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
        { href: '/dashboard/admin', label: 'Settings', icon: <FiSettings /> },
    ];

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
                            <Link key={href} href={href} className={`${styles.navItem} ${href === '/dashboard/admin' ? styles.active : ''}`}>
                                <span className={styles.icon}>{icon}</span>
                                <span className={styles.label}>{label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className={styles.sidebarFooter}>
                    <div className={styles.profilePictureSidebar}>
                        {admin?.profilePicture && (
                            <Image
                                src={admin.profilePicture}
                                alt="Profile picture"
                                width={100}
                                height={100}
                                className={styles.profileSidebar}
                            />
                        )}
                    </div>
                    <div className={styles.infoSidebar}>
                        <p className={styles.nameUserSidebar}>
                            {admin.firstName} {admin.lastName}
                        </p>
                        <AdminLogout type="sidebar" />
                    </div>
                </div>
            </aside>

            <div className={styles.mainContainer}>
                <header className={styles.topbar}>
                    <p className={styles.namePage}>Settings</p>
                    <div className={styles.topbarOptions}>
                        <div className={styles.modeToggle}>
                            <button className={styles.modeButton}><FiMoon /></button>
                        </div>
                        <div className={styles.modeToggleLogout}>
                            <AdminLogout type="topbar" />
                        </div>
                        <div className={styles.profilePictureWrapper}>
                            {admin?.profilePicture && (
                                <Image
                                    src={admin.profilePicture}
                                    alt="Profile picture"
                                    width={100}
                                    height={100}
                                    className={styles.profilePicture}
                                />
                            )}
                        </div>
                        <p className={styles.nameUser}>
                            {admin.firstName} {admin.lastName}
                        </p>
                    </div>
                </header>

                <main className={styles.main}>{children}</main>
            </div>
        </div>
    );
}
