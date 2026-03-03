import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface Space {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    coverUrl?: string;
    isDynamicCover?: boolean;
    type: 'DISCUSSION' | 'COURSE' | 'EVENT' | 'MEMBERS' | 'GALLERY' | 'CHAT';
    accessLevel: 'PUBLIC' | 'PRIVATE' | 'SECRET';
    order: number;
    courseId?: string;
    spaceGroupId?: string;
}

export interface SpaceGroup {
    id: string;
    title: string;
    slug: string;
    order: number;
    isVisible: boolean;
    spaces: Space[];
}

export const spacesService = {
    getSpaceGroups: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<SpaceGroup[]>(`${API_URL}/space-groups`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getAllSpaces: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Space[]>(`${API_URL}/spaces`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getSpace: async (slug: string) => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Space>(`${API_URL}/spaces/${slug}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Admin Methods
    createSpaceGroup: async (data: { title: string; slug: string; order?: number; isVisible?: boolean }) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<SpaceGroup>(`${API_URL}/space-groups`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateSpaceGroup: async (id: string, data: Partial<SpaceGroup>) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch<SpaceGroup>(`${API_URL}/space-groups/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteSpaceGroup: async (id: string) => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/space-groups/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    createSpace: async (data: Partial<Space> & { spaceGroupId: string }) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<Space>(`${API_URL}/spaces`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateSpace: async (id: string, data: Partial<Space>) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch<Space>(`${API_URL}/spaces/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteSpace: async (id: string) => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/spaces/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
