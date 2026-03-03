import axios from 'axios';
import { API_URL } from '@/lib/api';
const COMMUNITY_URL = `${API_URL}/community`;

export interface User {
    id: string;
    name: string;
    avatar: string | null;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: User;
}

export interface PollOption {
    id: string;
    text: string;
    votes: { userId: string }[];
    _count?: { votes: number };
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    userVoteId?: string | null;
}

export interface Post {
    id: string;
    content: string;
    title?: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
    user: User;
    space?: {
        id: string;
        title: string;
        slug: string;
        type: string;
    };
    poll?: Poll;
    comments: Comment[];
    _count: {
        comments: number;
    };
}

export const communityService = {
    getFeed: async (page: number = 1) => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Post[]>(`${COMMUNITY_URL}/feed`, {
            params: { page },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getTrendingPosts: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get<Post[]>(`${COMMUNITY_URL}/posts/trending`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createPost: async (data: { content: string; title?: string; imageUrl?: string; spaceId?: string; poll?: { question: string, options: string[] } }) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<Post>(`${COMMUNITY_URL}/posts`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    likePost: async (postId: string) => {
        const token = localStorage.getItem('token');
        await axios.post(`${COMMUNITY_URL}/posts/${postId}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    votePoll: async (pollId: string, optionId: string) => {
        const token = localStorage.getItem('token');
        await axios.post(`${COMMUNITY_URL}/polls/${pollId}/vote`, { optionId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    addComment: async (postId: string, content: string) => {
        const token = localStorage.getItem('token');
        const response = await axios.post<Comment>(`${COMMUNITY_URL}/posts/${postId}/comments`, { content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getSpaces: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/spaces`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getSpaceGroups: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/space-groups`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
