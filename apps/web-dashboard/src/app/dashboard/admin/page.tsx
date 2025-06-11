'use client';

import { useEffect, useState } from 'react';
import styles from "./settings.module.css";
import { FiUser, FiSave } from "react-icons/fi";
import { IoShieldOutline } from "react-icons/io5";
import { RiTeamLine, RiDeleteBinLine, RiUserAddLine } from "react-icons/ri";
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'react-toastify';

export default function SettingsDashboardPage() {
    const [show2FAComponent, setShow2FAComponent] = useState(false);
    const [activeTab, setActiveTab] = useState('Profile');
    const { user, loading } = useCurrentUser();
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [sessionInfo, setSessionInfo] = useState<{ ip: string, started: string } | null>(null);
    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [allUsers, setAllUsers] = useState<{
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        profilePicture?: string;
        status?: string;
        emailVerified?: boolean;
    }[]>([]);



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
            setIs2FAEnabled(user.twoFactorEnabled ?? false);
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
                const [sessionRes, usersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/session/info`, {
                        credentials: 'include',
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/user/all`, {
                        credentials: 'include',
                    })
                ]);

                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    setSessionInfo({ ip: sessionData.ip, started: sessionData.started });
                } else {
                    setSessionInfo(null);
                }

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setAllUsers(usersData);
                } else {
                    const err = await usersRes.json();
                    throw new Error(err.message || 'Errore');
                }

            } catch (err: any) {
                console.error('Errore caricamento dati:', err.message);
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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShow2FAComponent(false);
            }
        };
        if (show2FAComponent) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [show2FAComponent]);


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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowInvitePopup(false);
            }
        };
        if (showInvitePopup) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showInvitePopup]);

    const handleDeleteAccount = async () => {
        if (!confirm("Sei sicuro di voler eliminare definitivamente il tuo account?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/manager/delete-account`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Errore durante l'eliminazione");
            }

            toast.success("Account eliminato.");
            window.location.href = "/auth/login";
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!inviteEmail.trim() || !isValidEmail(inviteEmail)) {
            toast.error("Inserisci un'email valida.");
            return;
        }
    
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/users/invite`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });
    
            const data = await res.json();
    
            if (!res.ok) throw new Error(data.message);
    
            toast.success(data.message);
            setInviteEmail("");
        } catch (err: any) {
            toast.error(err.message);
        }
    };
    

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/users/${id}/${action}`, {
                method: "PATCH",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            toast.success(data.message);

            // Aggiorna lista in base all'azione
            if (action === "reject") {
                setAllUsers(prev => prev.filter(u => u._id !== id));
            } else if (action === "approve") {
                setAllUsers(prev =>
                    prev.map(u => u._id === id ? { ...u, status: "approved" } : u)
                );
            }

        } catch (err: any) {
            toast.error(err.message);
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

                    <div className={styles.deleteProfile} onClick={handleDeleteAccount}>
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
                                        disabled
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
                            <div className={styles.headerTeam}>
                                <div className={styles.textContainerTeam}>
                                    <p className={styles.textTeam}>
                                        Team Members ({allUsers.filter(u => u.emailVerified).length})
                                    </p>
                                    <p className={styles.subTextTeam}>People who have access to this green space management system</p>
                                </div>
                                <button className={styles.inviteMember} onClick={() => setShowInvitePopup(true)}>
                                    <RiUserAddLine /> Invite Member
                                </button>
                            </div>
                            <div className={styles.memberContainer}>
                                {allUsers
                                    .filter(user => user.emailVerified)
                                    .sort((a, b) => {
                                        // 1. Prima i maintainer in pending
                                        if (a.role === 'manager' && a.status === 'pending' && !(b.role === 'manager' && b.status === 'pending')) {
                                            return -1;
                                        }
                                        if (b.role === 'manager' && b.status === 'pending' && !(a.role === 'manager' && a.status === 'pending')) {
                                            return 1;
                                        }


                                        // 2. Ordina per ruolo
                                        const rolePriority: Record<string, number> = {
                                            admin: 0,
                                            manager: 1,
                                            maintainer: 2,
                                            employee: 3
                                        };

                                        return rolePriority[a.role] - rolePriority[b.role];
                                    })

                                    .map((user, idx) => (
                                        <div key={idx} className={styles.cardMember}>
                                            <img
                                                src={user.profilePicture || "http://localhost:3001/uploads/default-user.jpg"}
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className={styles.imgMember}
                                            />
                                            <div className={styles.infoMember}>
                                                <p className={styles.nameMember}>{user.firstName} {user.lastName}</p>
                                                <p className={styles.mailMember}>{user.email}</p>
                                            </div>

                                            {user.role === 'manager' && user.status === 'pending' && (
                                                <div className={styles.btnApprovalWrapper}>
                                                    <button
                                                        className={styles.btnApprove}
                                                        onClick={() => handleAction(user._id, "approve")}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={styles.btnReject}
                                                        onClick={() => handleAction(user._id, "reject")}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}



                                            <div
                                                className={`${styles.toggleMember} ${user.role === 'manager'
                                                    ? styles.manager
                                                    : user.role === 'maintainer'
                                                        ? styles.maintainer
                                                        : user.role === 'admin'
                                                            ? styles.admin
                                                            : styles.employee
                                                    }`}
                                            >
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </div>
                                        </div>
                                    ))}

                            </div>
                            {showInvitePopup && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modalContent}>
                                        <p className={styles.titlePop}>Invite a Manager</p>
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            className={styles.inputInvite}
                                        />
                                        <button className={styles.btnInvite} onClick={handleInviteSubmit}>Send Invite</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
