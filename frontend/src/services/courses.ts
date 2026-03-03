import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface Course {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    bannerUrl?: string;
    hasCertificate?: boolean;
    lessonsCount?: number;
    hasSupportMaterial?: boolean;
}

export const coursesService = {
    getCourses: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Course[]>(`${API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createCourse: async (data: Partial<Course>) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<Course>(`${API_URL}/courses`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateCourse: async (id: string, data: Partial<Course>) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<Course>(`${API_URL}/courses/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getCourse: async (id: string) => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Course>(`${API_URL}/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getCoursesWithProgress: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<(Course & { progress: number; rating: number })[]>(`${API_URL}/courses/with-progress`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
