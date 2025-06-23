// app/dashboard/maintainer/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { View } from 'react-native';
import BottomBarDipendente from '../../components/BottomBarDipendente';

export default function EmployeeLayout() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.replace('/auth/login');
        const role = user?.role === 'dipendente' ? 'employee' : user?.role;
        
        if (role !== 'employee') {
            router.replace('/auth/login');
        }
    }, [user]);
    
    if (!user || user.role !== 'employee') return null;

    return (
        <View style={{ flex: 1 }}>
            <Slot />
            <BottomBarDipendente />
        </View>
    );
}
