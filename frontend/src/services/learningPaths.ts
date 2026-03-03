import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface LearningPath {
    id: string;
    title: string;
    slug: string;
    description?: string;
    coverUrl?: string;
    isPublished: boolean;
    courses: LearningPathCourse[];
    createdAt: string;
    updatedAt: string;
}

export interface LearningPathCourse {
    id: string;
    learningPathId: string;
    courseId: string;
    order: number;
    course: {
        id: string;
        title: string;
        thumbnail?: string;
        slug: string;
    };
}

export const learningPathsService = {
    getAll: async () => {
        const response = await axios.get<LearningPath[]>(`${API_URL}/learning-paths`);
        return response.data;
    },

    getBySlug: async (slug: string) => {
        const response = await axios.get<LearningPath>(`${API_URL}/learning-paths/${slug}`);
        return response.data;
    },

    create: async (data: { title: string; description?: string; coverUrl?: string; courseIds?: string[] }) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<LearningPath>(`${API_URL}/learning-paths`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    update: async (id: string, data: { title?: string; description?: string; coverUrl?: string; isPublished?: boolean; courseIds?: string[] }) => {
        const token = localStorage.getItem('token');
        const response = await axios.put<LearningPath>(`${API_URL}/learning-paths/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    delete: async (id: string) => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/learning-paths/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
