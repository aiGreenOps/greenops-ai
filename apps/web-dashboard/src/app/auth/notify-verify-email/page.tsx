"use client";

import { useSearchParams } from "next/navigation";
import styles from "../login/login.module.css";
import Link from "next/link";

export default function NotifyVerifyEmailPage() {
    const params = useSearchParams();
    const status = params.get("status");

    let title = "Email Verification";
    let message = "Your email has been successfully verified.";
    let color = "green";

    if (status === "pending") {
        title = "Email Verified";
        message = "Your email has been verified. Please wait for approval.";
        color = "orange";
    } else if (status === "already") {
        title = "Already Verified";
        message = "Your email has already been verified.";
        color = "blue";
    } else if (status === "notfound") {
        title = "User Not Found";
        message = "We couldn't find a user associated with this email.";
        color = "red";
    } else if (status === "invalid") {
        title = "Invalid Link";
        message = "The verification link is invalid or expired.";
        color = "red";
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
