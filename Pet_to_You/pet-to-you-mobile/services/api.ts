/**
 * API client configuration with React Query integration
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost:3000/api/v1';

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
  getHospitals: (params?: { lat?: number; lng?: number; radius?: number }) =>
    apiClient.get('/hospitals', { params }),

  getHospitalById: (id: string) =>
    apiClient.get(`/hospitals/${id}`),

  // Pets
  getPets: () => apiClient.get('/pets'),

  getPetById: (id: string) => apiClient.get(`/pets/${id}`),

  createPet: (data: any) => apiClient.post('/pets', data),

  updatePet: (id: string, data: any) =>
    apiClient.patch(`/pets/${id}`, data),

  // Bookings
  getBookings: () => apiClient.get('/bookings'),

  createBooking: (data: any) => apiClient.post('/bookings', data),

  cancelBooking: (id: string) =>
    apiClient.patch(`/bookings/${id}/cancel`),
};
