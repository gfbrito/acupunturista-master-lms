import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface CustomPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}

export const pagesService = {
    async getAll(visibleOnly: boolean = false) {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/pages${visibleOnly ? '?visible=true' : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async getBySlug(slug: string) {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/pages/${slug}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async create(data: { title: string; slug: string; content: string; isVisible?: boolean }) {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/pages`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async update(id: string, data: { title?: string; slug?: string; content?: string; isVisible?: boolean }) {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/pages/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    async delete(id: string) {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`${API_URL}/pages/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
