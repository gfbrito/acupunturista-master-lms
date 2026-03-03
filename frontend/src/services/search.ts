import axios from 'axios';
import { API_URL } from '@/lib/api';

export interface SearchResult {
    spaces: {
        id: string;
        title: string;
        slug: string;
        type: string;
    }[];
    courses: {
        id: string;
        title: string;
        description: string;
        thumbnail: string;
    }[];
    pages: {
        id: string;
        title: string;
        slug: string;
    }[];
}

export const searchService = {
    search: async (query: string) => {
        const token = localStorage.getItem('token');
        const response = await axios.get<SearchResult>(`${API_URL}/search`, {
            params: { q: query },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
