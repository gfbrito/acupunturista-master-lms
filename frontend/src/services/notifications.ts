import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export const notificationsService = {
    getAll: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<{ notifications: Notification[], unreadCount: number }>(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    markAsRead: async (id: string) => {
        const token = localStorage.getItem('token');
        await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    markAllAsRead: async () => {
        const token = localStorage.getItem('token');
        await axios.patch(`${API_URL}/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    sendNotification: async (data: {
        userId?: string;
        title: string;
        message: string;
        link?: string;
        type?: string;
        sendToAll?: boolean;
    }) => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/notifications/send`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
