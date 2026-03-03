import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface User {
    id: string;
    name: string;
    surname?: string;
    email: string;
    whatsapp?: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
    enrollments: any[];
    notifyByWhatsapp?: boolean;
    notifyByEmail?: boolean;
    subscriptionEndsAt?: string;
}

export const usersService = {
    getProfile: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<User>(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateProfile: async (data: Partial<User>) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch<User>(`${API_URL}/users/me`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    changePassword: async (data: any) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/users/me/password`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
