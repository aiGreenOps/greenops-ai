// app/dashboard/maintainer/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { View } from 'react-native';
import BottomBarManutentore from '../../components/BottomBarManutentore';

export default function MaintainerLayout() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.replace('/auth/login');
        const role = user?.role === 'manutentore' ? 'maintainer' : user?.role;
        
        if (role !== 'maintainer') {
            router.replace('/auth/login');
        }
    }, [user]);
    
    if (!user || user.role !== 'maintainer') return null;

    return (
        <View style={{ flex: 1 }}>
            <Slot />
            <BottomBarManutentore />
        </View>
    );
}
