import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { HospitalFilters } from '@/store/filterStore';
import { MOCK_HOSPITALS } from '@/constants/mockData';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  image?: string;
  images?: string[];
  services?: string[];
  openingHours?: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  isOpen?: boolean;
  hasParking?: boolean;
  hasEmergency?: boolean;
  has24Hour?: boolean;
  hasNightCare?: boolean;
  description?: string;
}

export interface HospitalReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  images?: string[];
  createdAt: string;
  helpful: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  doctorName?: string;
}

interface UseHospitalsParams {
  lat?: number;
  lng?: number;
  filters?: Partial<HospitalFilters>;
  searchQuery?: string;
  sortBy?: 'distance' | 'rating' | 'name';
  enabled?: boolean;
}

// Get hospitals list
export const useHospitals = ({
  lat,
  lng,
  filters,
  searchQuery,
  sortBy = 'distance',
  enabled = true,
}: UseHospitalsParams = {}) => {
  // Seoul City Hall default coordinates
  const defaultLat = 37.5665;
  const defaultLng = 126.9780;

  return useQuery({
    queryKey: ['hospitals', lat, lng, filters, searchQuery, sortBy],
    queryFn: async () => {
      try {
        const params: any = {
          lat: lat || defaultLat,
          lng: lng || defaultLng,
          radius: filters?.distance,
          search: searchQuery,
          services: filters?.services,
          openNow: filters?.openNow,
          rating: filters?.rating,
          sortBy,
        };

        const response = await api.getHospitals(params);
        return response.data as Hospital[];
      } catch (error) {
        console.log('API unavailable, using mock hospitals data');
        return MOCK_HOSPITALS;
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    placeholderData: MOCK_HOSPITALS,
  });
};

// Get hospital by ID
export const useHospitalById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: async () => {
      try {
        const response = await api.getHospitalById(id);
        return response.data as Hospital;
      } catch (error) {
        console.log('API unavailable, using mock hospital data');
        const mockHospital = MOCK_HOSPITALS.find((h) => h.id === id);
        if (!mockHospital) throw new Error('Hospital not found');
        return mockHospital as Hospital;
      }
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get hospital reviews
export const useHospitalReviews = (
  hospitalId: string,
  page: number = 1,
  limit: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['hospital-reviews', hospitalId, page, limit],
    queryFn: async () => {
      const response = await api.getHospitalReviews(hospitalId, page, limit);
      return {
        reviews: response.data.reviews as HospitalReview[],
        total: response.data.total as number,
        hasMore: response.data.hasMore as boolean,
      };
    },
    enabled: enabled && !!hospitalId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get available time slots
export const useAvailableSlots = (
  hospitalId: string,
  date: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['hospital-slots', hospitalId, date],
    queryFn: async () => {
      const response = await api.getAvailableSlots(hospitalId, date);
      return response.data as TimeSlot[];
    },
    enabled: enabled && !!hospitalId && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      hospitalId: string;
      petId: string;
      date: string;
      time: string;
      serviceType: string;
      symptoms?: string;
      notes?: string;
    }) => {
      const response = await api.createBooking(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate bookings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['hospital-slots'] });
    },
  });
};

export default useHospitals;
