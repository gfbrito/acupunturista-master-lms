"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usersService, User } from '@/services/users';
import { gamificationService } from '@/services/gamification';

interface UserContextType {
    user: User | null;
    points: number;
    gamificationEnabled: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [points, setPoints] = useState(0);
    const [gamificationEnabled, setGamificationEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const userData = await usersService.getProfile();
            setUser(userData);

            try {
                const settings = await gamificationService.getSettings();
                const enabled = settings.gamification_enabled === 'true';
                setGamificationEnabled(enabled);

                if (enabled) {
                    const userPoints = await gamificationService.getPoints();
                    setPoints(userPoints);
                }
            } catch (e) {
                console.error("Failed to fetch gamification data", e);
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, points, gamificationEnabled, loading, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
