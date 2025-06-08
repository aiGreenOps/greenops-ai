'use client';

import { useEffect, useState } from 'react';
import styles from "./settings.module.css";
import { FiUser, FiSave } from "react-icons/fi";
import { IoShieldOutline } from "react-icons/io5";
import { RiTeamLine, RiDeleteBinLine } from "react-icons/ri";
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { GoAlertFill, GoShieldCheck } from "react-icons/go";
import { toast } from 'react-toastify';
import TwoFactorSetup from '@/components/TwoFactorSetup';

export default function SettingsDashboardPage() {
    const [show2FAComponent, setShow2FAComponent] = useState(false);
    const [activeTab, setActiveTab] = useState('Profile');
    const { user, loading } = useCurrentUser();
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [sessionInfo, setSessionInfo] = useState<{ ip: string, started: string } | null>(null);


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        fiscalCode: "",
        role: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                fiscalCode: user.fiscalCode || "",
                role: user.role || ""
            });
            setPreviewUrl(user.profilePicture || null);
            setIs2FAEnabled(user.is2FAEnabled ?? false);
        }
    }, [user]);

    const links = [
        { label: 'Profile', icon: <FiUser /> },
        { label: 'Security', icon: <IoShieldOutline /> },
        { label: 'Team Members', icon: <RiTeamLine /> },
    ];

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/session/info`, {
                    credentials: 'include',
                });
                const data = await res.json();
                setSessionInfo({ ip: data.ip, started: data.started });
            } catch {
                setSessionInfo(null);
            }
        })();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoadingSubmit(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("firstName", formData.firstName);
            formDataToSend.append("lastName", formData.lastName);
            formDataToSend.append("email", formData.email);
            formDataToSend.append("phone", formData.phone);
            formDataToSend.append("fiscalCode", formData.fiscalCode);
            if (selectedImage) {
                formDataToSend.append("profilePicture", selectedImage);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/user/update-profile`, {
                method: "PUT",
                credentials: "include",
                body: formDataToSend,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error updating profile.");

            toast.success("Profile updated successfully.");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.titleContainer}>
                    <p className={styles.title}>Settings</p>
                    <p className={styles.subTitle}>Manage your account and application preferences</p>
                </div>
            </div>

            <div className={styles.secondContainer}>
                <div className={styles.navSettings}>
                    <nav className={styles.sidebarNav}>
                        {links.map(({ label, icon }) => (
                            <div
                                key={label}
                                className={`${styles.navItem} ${activeTab === label ? styles.active : ''}`}
                                onClick={() => setActiveTab(label)}
                            >
                                <span className={styles.icon}>{icon}</span>
                                <span className={styles.label}>{label}</span>
                            </div>
                        ))}
                    </nav>

                    <div className={styles.divisor}></div>

                    <div className={styles.deleteProfile}>
                        <RiDeleteBinLine className={styles.iconBtn} />
                        <span className={styles.labelBtn}>Delete Account</span>
                    </div>
                </div>

                <div className={styles.optionProfile}>
                    {activeTab === 'Profile' && user && (
                        <div className={styles.profileContainer}>
                            <div className={styles.titleMain}>Profile Settings</div>
                            <div className={styles.headerProfile}>
                                <Image
                                    src={previewUrl || user.profilePicture || "/default-avatar.png"}
                                    alt="Profile picture"
                                    width={200}
                                    height={200}
                                    className={styles.profileImage}
                                />
                                <div className={styles.changeImageContainer}>
                                    <label className={styles.btnChangeImage}>
                                        Change avatar
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/gif"
                                            onChange={handleImageChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                    <span className={styles.infoImage}>Format allowed: JPG, GIF, or PNG.</span>
                                </div>
                            </div>

                            <form className={styles.formContainer} onSubmit={handleSubmit}>
                                <div className={styles.inputGroup}>
                                    <div className={styles.labels}>
                                        <label htmlFor="firstName">First name</label>
                                    </div>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        placeholder="Enter your first name"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.labels}>
                                        <label htmlFor="lastName">Last name</label>
                                    </div>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        placeholder="Enter your last name"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.labels}>
                                        <label htmlFor="email">Email</label>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        placeholder="Enter your email address"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.labels}>
                                        <label htmlFor="phone">Phone number</label>
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        placeholder="Enter your phone number"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.labels}>
                                        <label htmlFor="fiscalCode">Fiscal code</label>
                                    </div>
                                    <input
                                        id="fiscalCode"
                                        name="fiscalCode"
                                        type="text"
                                        value={formData.fiscalCode}
                                        placeholder="Enter your fiscal code"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div className={styles.labels}>
                                        <label htmlFor="role">Role</label>
                                    </div>
                                    <input
                                        id="role"
                                        name="role"
                                        type="text"
                                        value={formData.role}
                                        placeholder="User role"
                                        disabled
                                    />
                                </div>

                                <div className={styles.submitContainer}>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loadingSubmit}
                                    >
                                        {loadingSubmit ? "Submitting…" : (
                                            <>
                                                <FiSave style={{ marginRight: 6 }} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className={styles.securityContainer}>
                            <div className={styles.titleMain}>Security Settings</div>
                            <p className={styles.subtitleProfile}>Two-Factor Authentication</p>
                            <div
                                className={`${styles.tfaAuthContainer} ${is2FAEnabled ? styles.tfaEnabled : styles.tfaDisabled}`}
                            >
                                {is2FAEnabled ? (
                                    <GoShieldCheck className={styles.iconProfile} />
                                ) : (
                                    <GoAlertFill className={styles.iconProfile} />
                                )}
                                <div className={styles.authContainer}>
                                    <p className={styles.titleAuth}>
                                        {is2FAEnabled
                                            ? "Two-Factor Authentication enabled"
                                            : "Two-Factor Authentication not enabled"}
                                    </p>
                                    <p className={styles.infoAuth}>
                                        {is2FAEnabled
                                            ? "Your account is protected with 2FA."
                                            : "We strongly recommend enabling 2FA to secure your account."}
                                    </p>
                                    <button className={styles.btnAuth} onClick={() => setShow2FAComponent(true)}>
                                        {is2FAEnabled ? "Manage 2FA" : "Enable 2FA"}
                                    </button>

                                </div>
                                {show2FAComponent && (
                                    <div className={styles.modalOverlay}>
                                        <div className={styles.modalContent}>
                                            <TwoFactorSetup
                                                enabled={is2FAEnabled}
                                                onToggle={(newState) => {
                                                    setIs2FAEnabled(newState);
                                                    setShow2FAComponent(false);
                                                }}
                                            />
                                            <button className={styles.modalClose} onClick={() => setShow2FAComponent(false)}>✕</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className={styles.subtitleProfile}>Login Sessions</p>
                            <div className={styles.sessionContainer}>
                                <div className={styles.infoSession}>
                                    <p className={styles.titleSession}>Current Session</p>
                                    <p className={styles.subtitleSession}>
                                        {sessionInfo
                                            ? `Started: ${sessionInfo.started} • IP: ${sessionInfo.ip}`
                                            : "Loading..."}
                                    </p>
                                </div>
                                <div className={styles.toggleSession}>Active</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Team Members' && (
                        <div className={styles.teamContainer}>
                            <div className={styles.titleMain}>Team Members</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
