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
  }) => {
    // Map frontend params to backend API format
    const backendParams: any = {
      latitude: params?.lat,
      longitude: params?.lng,
      radiusKm: params?.radius ? params.radius / 1000 : 10, // Convert meters to km
      keyword: params?.search,
      openNow: params?.openNow,
      minRating: params?.rating,
      sortBy: params?.sortBy || 'distance',
      page: 1,
      limit: 50,
    };

    return apiClient.get('/hospitals/search', { params: backendParams });
  },

  getHospitalById: (id: string) => apiClient.get(`/hospitals/${id}`),

  getHospitalReviews: (id: string, page: number = 1, limit: number = 10) =>
    apiClient.get(`/hospitals/${id}/reviews`, { params: { page, limit } }),

  getAvailableSlots: (hospitalId: string, date: string, veterinarianId?: string) =>
    apiClient.get(`/hospitals/${hospitalId}/slots`, {
      params: { date, veterinarianId },
    }),

  // Veterinarians
  getVeterinarians: (hospitalId: string, activeOnly?: boolean) =>
    apiClient.get(`/hospitals/${hospitalId}/staff`, {
      params: { active: activeOnly },
    }),

  getVeterinarianById: (hospitalId: string, vetId: string) =>
    apiClient.get(`/hospitals/${hospitalId}/staff/${vetId}`),

  createVeterinarian: (hospitalId: string, data: any) =>
    apiClient.post(`/hospitals/${hospitalId}/staff`, data),

  updateVeterinarian: (hospitalId: string, vetId: string, data: any) =>
    apiClient.put(`/hospitals/${hospitalId}/staff/${vetId}`, data),

  deleteVeterinarian: (hospitalId: string, vetId: string) =>
    apiClient.delete(`/hospitals/${hospitalId}/staff/${vetId}`),

  toggleVeterinarianStatus: (hospitalId: string, vetId: string, isActive: boolean) =>
    apiClient.patch(`/hospitals/${hospitalId}/staff/${vetId}/toggle`, { isActive }),

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

  // Medical Records
  getMedicalRecords: (petId: string) =>
    apiClient.get('/medical-records', { params: { petId } }).then(res => res.data?.data || res.data || []),

  getMedicalRecordById: (id: string) =>
    apiClient.get(`/medical-records/${id}`).then(res => res.data?.data || res.data),

  createMedicalRecord: (data: any) =>
    apiClient.post('/medical-records', data).then(res => res.data?.data || res.data),

  updateMedicalRecord: (id: string, data: any) =>
    apiClient.patch(`/medical-records/${id}`, data).then(res => res.data?.data || res.data),

  deleteMedicalRecord: (id: string) =>
    apiClient.delete(`/medical-records/${id}`).then(res => res.data?.data || res.data),

  uploadMedicalDocument: (recordId: string, formData: FormData) =>
    apiClient.post(`/medical-records/${recordId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  // Insurance - Plans
  getInsurancePlans: (filters?: any) =>
    apiClient.get('/insurance/plans', { params: filters }),

  getInsurancePlanById: (id: string) =>
    apiClient.get(`/insurance/plans/${id}`),

  // Insurance - Policies
  getUserPolicies: (status?: string) =>
    apiClient.get('/insurance/policies', { params: { status } }),

  getPolicyById: (id: string) =>
    apiClient.get(`/insurance/policies/${id}`),

  purchaseInsurance: (data: any) =>
    apiClient.post('/insurance/policies', data),

  cancelPolicy: (id: string) =>
    apiClient.post(`/insurance/policies/${id}/cancel`),

  updatePolicyAutoRenewal: (id: string, autoRenewal: boolean) =>
    apiClient.patch(`/insurance/policies/${id}/auto-renewal`, { autoRenewal }),

  // Insurance - Claims
  getClaims: (status?: string) =>
    apiClient.get('/insurance/claims', { params: { status } }),

  getClaimById: (id: string) =>
    apiClient.get(`/insurance/claims/${id}`),

  submitClaim: (formData: FormData) =>
    apiClient.post('/insurance/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  createDraftClaim: (data: any) =>
    apiClient.post('/insurance/claims/draft', data),

  updateDraftClaim: (id: string, data: any) =>
    apiClient.patch(`/insurance/claims/${id}/draft`, data),

  deleteDraftClaim: (id: string) =>
    apiClient.delete(`/insurance/claims/${id}/draft`),

  cancelClaim: (id: string) =>
    apiClient.post(`/insurance/claims/${id}/cancel`),

  // Insurance - Auto Claim
  getAutoClaimSuggestions: () =>
    apiClient.get('/insurance/claims/auto-suggestions'),

  checkClaimEligibility: (medicalRecordId: string) =>
    apiClient.get(`/insurance/claims/eligibility/${medicalRecordId}`),

  // Hospital Dashboard - Statistics
  getHospitalStatistics: (hospitalId: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/statistics`).then(res => res.data?.data || res.data),

  // Hospital Dashboard - Bookings
  getHospitalCompletedBookings: (hospitalId: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/bookings`).then(res => res.data?.data || res.data || []),

  completeBooking: (hospitalId: string, bookingId: string) =>
    apiClient.patch(`/hospitals/${hospitalId}/dashboard/bookings/${bookingId}/complete`).then(res => res.data?.data || res.data),

  // Hospital Dashboard - Medical Records
  createHospitalMedicalRecord: (hospitalId: string, data: any) =>
    apiClient.post(`/hospitals/${hospitalId}/dashboard/medical-records`, data).then(res => res.data?.data || res.data),

  updateHospitalMedicalRecord: (hospitalId: string, recordId: string, data: any) =>
    apiClient.put(`/hospitals/${hospitalId}/dashboard/medical-records/${recordId}`, data).then(res => res.data?.data || res.data),

  getHospitalMedicalRecords: (hospitalId: string, filters?: any) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/medical-records`, { params: filters }).then(res => res.data?.data || res.data || []),

  getHospitalMedicalRecordById: (hospitalId: string, recordId: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/medical-records/${recordId}`).then(res => res.data?.data || res.data),

  // Hospital Dashboard - Claims
  getHospitalClaims: (hospitalId: string, status?: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/claims`, { params: { status } }).then(res => res.data?.data || res.data || []),

  getHospitalClaimById: (hospitalId: string, claimId: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/claims/${claimId}`).then(res => res.data?.data || res.data),

  // Hospital Dashboard - Payments
  getHospitalPayments: (hospitalId: string, status?: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/payments`, { params: { status } }).then(res => res.data?.data || res.data || []),

  getHospitalPaymentById: (hospitalId: string, paymentId: string) =>
    apiClient.get(`/hospitals/${hospitalId}/dashboard/payments/${paymentId}`).then(res => res.data?.data || res.data),

  // Hospital Dashboard - Documents
  uploadHospitalDocuments: (hospitalId: string, formData: FormData) =>
    apiClient.post(`/hospitals/${hospitalId}/dashboard/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data?.data || res.data),
};

export default api;
