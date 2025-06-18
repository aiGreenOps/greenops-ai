// contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'dipendente' | 'manutentore' | 'employee' | 'maintainer';
    profilePicture?: string;
};

interface AuthContextProps {
    user: User | null;
    login: (email: string, password: string) => Promise<User>;
    register: (data: {
        nome: string;
        cognome: string;
        email: string;
        telefono: string;
        password: string;
        role: 'dipendente' | 'manutentore';
    }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>(null!);

const API_URL = 'http://192.168.1.183:3001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const bootstrap = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const { user: u }: { user: User } = await res.json();
                setUser(u);
            } else {
                await AsyncStorage.removeItem('token');
            }
        }
    };

    useEffect(() => {
        bootstrap();
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Client': 'mobile',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Credenziali non valide');
        }

        const { token, user: u }: { token: string; user: User } = await res.json();
        await AsyncStorage.setItem('token', token);
        setUser(u);
        return u;
    };

    const register = async (data: {
        nome: string;
        cognome: string;
        email: string;
        telefono: string;
        password: string;
        role: 'dipendente' | 'manutentore';
        invitationToken?: string;
    }): Promise<void> => {
        const body: any = {
            firstName: data.nome,
            lastName: data.cognome,
            email: data.email,
            phone: data.telefono,
            password: data.password,
            role: data.role,
        };
        if (data.invitationToken) {
            body.invitationToken = data.invitationToken;
        }

        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Client': 'mobile',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Errore di registrazione');
        }
    };

    const logout = async (): Promise<void> => {
        await AsyncStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
