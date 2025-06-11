import { useEffect, useState } from 'react';

export function useCurrentUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // 1. Prova prima /admin/me
                let res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/me`, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    // 2. Fallback su /me
                    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                        credentials: 'include',
                    });
                }

                if (!res.ok) throw new Error("Non autenticato");

                const data = await res.json();
                // Se il backend admin restituisce direttamente l'oggetto user:
                setUser(data.user || data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
}
