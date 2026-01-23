/**
 * API client configuration with React Query integration
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import config from '@/constants/config';

const API_BASE_URL = config.apiBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  signup: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/signup', data),

  logout: () => apiClient.post('/auth/logout'),

  // Hospitals
  getHospitals: (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    search?: string;
    services?: string[];
    openNow?: boolean;
    rating?: number;
    sortBy?: 'distance' | 'rating' | 'name';
  }) => apiClient.get('/hospitals', { params }),

  getHospitalById: (id: string) => apiClient.get(`/hospitals/${id}`),

  getHospitalReviews: (id: string, page: number = 1, limit: number = 10) =>
    apiClient.get(`/hospitals/${id}/reviews`, { params: { page, limit } }),

  getAvailableSlots: (hospitalId: string, date: string) =>
    apiClient.get(`/hospitals/${hospitalId}/slots`, { params: { date } }),

  // Adoption
  getAdoptions: (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    search?: string;
    species?: string[];
    age?: string[];
    size?: string[];
    gender?: string[];
    vaccinated?: boolean;
    neutered?: boolean;
    sortBy?: 'distance' | 'age' | 'name';
  }) => apiClient.get('/adoptions', { params }),

  getAdoptionById: (id: string) => apiClient.get(`/adoptions/${id}`),

  submitApplication: (petId: string, data: any) =>
    apiClient.post(`/adoptions/${petId}/apply`, data),

  // Daycare
  getDaycares: (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    search?: string;
    services?: string[];
    rating?: number;
    priceMin?: number;
    priceMax?: number;
    sortBy?: 'distance' | 'rating' | 'price' | 'name';
  }) => apiClient.get('/daycares', { params }),

  getDaycareById: (id: string) => apiClient.get(`/daycares/${id}`),

  createReservation: (data: any) => apiClient.post('/daycares/reserve', data),

  // Pets
  getPets: () => apiClient.get('/pets'),

  getPetById: (id: string) => apiClient.get(`/pets/${id}`),

  createPet: (data: any) => apiClient.post('/pets', data),

  updatePet: (id: string, data: any) => apiClient.patch(`/pets/${id}`, data),

  uploadPetPhoto: (petId: string, formData: FormData) =>
    apiClient.post(`/pets/${petId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Bookings
  getBookings: (status?: 'upcoming' | 'completed' | 'cancelled') =>
    apiClient.get('/bookings', { params: { status } }),

  createBooking: (data: any) => apiClient.post('/bookings', data),

  cancelBooking: (id: string) => apiClient.patch(`/bookings/${id}/cancel`),

  rescheduleBooking: (id: string, data: { date: string; time: string }) =>
    apiClient.patch(`/bookings/${id}/reschedule`, data),

  // Community
  getPosts: (params?: {
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => apiClient.get('/community/posts', { params }),

  getPostById: (id: string) => apiClient.get(`/community/posts/${id}`),

  createPost: (data: any) => apiClient.post('/community/posts', data),

  likePost: (id: string) => apiClient.post(`/community/posts/${id}/like`),

  getComments: (postId: string, page: number = 1, limit: number = 20) =>
    apiClient.get(`/community/posts/${postId}/comments`, { params: { page, limit } }),

  createComment: (postId: string, data: { content: string }) =>
    apiClient.post(`/community/posts/${postId}/comments`, data),

  searchPosts: (query: string, searchIn: string = 'all') =>
    apiClient.get('/community/posts/search', { params: { q: query, searchIn } }),

  getTrendingHashtags: () =>
    apiClient.get('/community/hashtags/trending'),

  // User Profile
  getProfile: () => apiClient.get('/users/profile'),

  updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
    apiClient.patch('/users/profile', data),

  uploadAvatar: (formData: FormData) =>
    apiClient.post('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getUserProfile: (userId: string) =>
    apiClient.get(`/users/${userId}/profile`),

  getUserPosts: (userId: string, page: number = 1, limit: number = 20) =>
    apiClient.get(`/users/${userId}/posts`, { params: { page, limit } }),

  followUser: (userId: string) =>
    apiClient.post(`/users/${userId}/follow`),

  unfollowUser: (userId: string) =>
    apiClient.delete(`/users/${userId}/follow`),
};

export default api;
