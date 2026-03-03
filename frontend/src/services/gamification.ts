import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: string;
}

export interface UserBadge {
    id: string;
    userId: string;
    badgeId: string;
    badge: Badge;
    awardedAt: string;
}

export const gamificationService = {
    getPoints: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<number>(`${API_URL}/gamification/points`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getBadges: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<UserBadge[]>(`${API_URL}/gamification/badges`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getHistory: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<any[]>(`${API_URL}/gamification/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getSettings: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Record<string, string>>(`${API_URL}/gamification/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateSettings: async (settings: Record<string, string>) => {
        const token = localStorage.getItem('token');
        const response = await axios.put<Record<string, string>>(`${API_URL}/gamification/settings`, settings, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
