'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";
import { FaUserPlus } from "react-icons/fa";
import { decodeJwtPayload, InvitePayload } from "@/lib/jwtUtils";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const invitationToken = params.get("invitationToken") || "";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fiscalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [isInvited, setIsInvited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invitationToken) {
      try {
        const payload = decodeJwtPayload<InvitePayload>(invitationToken);
        setFormData((f) => ({ ...f, email: payload.email }));
        setIsInvited(true);
      } catch {
        console.warn("Invalid invitation token");
      }
    }
  }, [invitationToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        fiscalCode: formData.fiscalCode,
        password: formData.password,
      };
      if (invitationToken) payload.invitationToken = invitationToken;

      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success(data.message || "Registration successful");
      // No redirect for now
    } catch (err: any) {
      toast.error("Network error or server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Create your account</h1>
        <p className={styles.formParag}>Join us to manage green spaces effectively</p>

        <form onSubmit={handleSubmit}>
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
              onChange={handleChange}
              readOnly={isInvited}
              style={isInvited ? { background: "#f0f0f0" } : {}}
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
              required
              value={formData.phone}
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
              required
              value={formData.fiscalCode}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labels}>
              <label htmlFor="password">Password</label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading
              ? "Submitting…"
              : (
                <>
                  <FaUserPlus style={{ marginRight: 6 }} />
                  Register
                </>
              )}
          </button>
        </form>

        <p className={styles.registerAdv}>
          Already have an account?{" "}
          <Link href="/auth/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
