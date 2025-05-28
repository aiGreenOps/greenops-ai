"use client";

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

  // Se arrivo con invitationToken, decodificalo manualmente
  useEffect(() => {
    if (invitationToken) {
      try {
        const payload = decodeJwtPayload<InvitePayload>(invitationToken);
        setFormData((f) => ({ ...f, email: payload.email }));
        setIsInvited(true);
      } catch {
        console.warn("Token di invito non valido");
      }
    }
  }, [invitationToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Le password non corrispondono");
      return;
    }

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
        toast.error(data.message || "Registrazione fallita");
        return;
      }

      toast.success(data.message || "Registrazione completata");
      // 🔁 Rimuovi il redirect automatico
      // router.push("/auth/login");

    } catch (err: any) {
      toast.error("Errore di rete o server non raggiungibile");
    } finally {
      setLoading(false);
    }
  };

  const { password, confirmPassword } = formData;
  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const match = password === confirmPassword && confirmPassword.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.formContainer}>
        <h1 style={{ textAlign: "center" }}>Registrazione</h1>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName">Nome</label>
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
            <label htmlFor="lastName">Cognome</label>
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
            <label htmlFor="email">Email</label>
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
            <label htmlFor="phone">Telefono</label>
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
            <label htmlFor="fiscalCode">Codice Fiscale</label>
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Conferma Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <ul className={styles.requirements}>
            <li className={requirements.length ? styles.valid : ""}>
              Minimo 8 caratteri
            </li>
            <li className={requirements.upper ? styles.valid : ""}>
              Una lettera maiuscola
            </li>
            <li className={requirements.number ? styles.valid : ""}>
              Un numero
            </li>
            <li className={requirements.special ? styles.valid : ""}>
              Un carattere speciale
            </li>
            <li className={match ? styles.valid : ""}>Password confermata</li>
          </ul>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={
              loading ||
              !Object.values(requirements).every(Boolean) ||
              !match
            }
          >
            {loading
              ? "Invio…"
              : (
                <>
                  <FaUserPlus style={{ marginRight: 6 }} />
                  Registrati
                </>
              )}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          Hai già un account?{" "}
          <Link href="/auth/login" style={{ color: "#1d3557" }}>
            Accedi
          </Link>
        </p>
      </div>
    </main>
  );
}
