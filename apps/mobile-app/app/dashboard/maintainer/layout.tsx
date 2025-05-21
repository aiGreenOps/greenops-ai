import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function DipendenteLayout() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.replace('/auth/login');
        else if (user.role !== 'manutentore') router.replace('/auth/login');
    }, [user]);

    if (!user || user.role !== 'manutentore') return null;
    return <Slot />;
}
