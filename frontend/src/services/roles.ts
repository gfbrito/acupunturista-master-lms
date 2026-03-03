import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface CustomRole {
    id: string;
    name: string;
    description: string;
    hasFullAccess: boolean;
    courses: { id: string; title: string }[];
    spaces: { id: string; title: string }[];
    pages: { id: string; title: string }[];
    _count?: { users: number };
}

export const rolesService = {
    async getAll() {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/roles`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async create(data: {
        name: string;
        description?: string;
        hasFullAccess: boolean;
        courseIds?: string[];
        spaceIds?: string[];
        pageIds?: string[];
    }) {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/roles`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async update(id: string, data: {
        name?: string;
        description?: string;
        hasFullAccess?: boolean;
        courseIds?: string[];
        spaceIds?: string[];
        pageIds?: string[];
    }) {
        const token = localStorage.getItem('token');
        const res = await axios.put(`${API_URL}/roles/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async delete(id: string) {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`${API_URL}/roles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
