// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
    // Appena parte il router, rispedisce subito a /auth/login
    return <Redirect href="/auth/login" />;
}
