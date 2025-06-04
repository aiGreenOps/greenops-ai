'use client';

import { useSearchParams } from "next/navigation";
import styles from "../login/login.module.css";
import Link from "next/link";

export default function NotifyResetPasswordPage() {
    const params = useSearchParams();
    const status = params.get("status");

    let title = "Password Reset";
    let message = "Your password has been successfully updated.";
    let color = "green";

    if (status === "invalid") {
        title = "Invalid Link";
        message = "The reset link is invalid or has already been used.";
        color = "red";
    } else if (status === "notfound") {
        title = "User Not Found";
        message = "The user associated with this link was not found.";
        color = "red";
    } else if (status === "expired") {
        title = "Expired Link";
        message = "The reset link has expired. Please request a new one.";
        color = "orange";
    }

    return (
        <main className={styles.page}>
            <div className={styles.formContainer}>
                <h1 className={styles.formTitle}>{title}</h1>
                <p className={styles.formParag} style={{ color }}>{message}</p>
                <p className={`${styles.registerAdv} ${styles.advMoreSpace}`}>
                    Close this page or{" "}
                    <Link href="/auth/login" className={styles.link}>
                        return to login
                    </Link>
                </p>
            </div>
        </main>
    );
}
