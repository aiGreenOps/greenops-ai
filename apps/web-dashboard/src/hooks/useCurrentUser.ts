import { useEffect, useState } from 'react';

export function useCurrentUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error('Non autenticato');
                return res.json();
            })
            .then(({ user }) => {
                setUser(user);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}
