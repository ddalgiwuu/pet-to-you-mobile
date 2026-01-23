import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { DaycareFilters } from '@/store/filterStore';

export interface Daycare {
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
  priceRange?: { min: number; max: number };
  openingHours?: any;
  hasPickup?: boolean;
  hasCamera?: boolean;
  hasGrooming?: boolean;
  hasTraining?: boolean;
}

interface UseDaycaresParams {
  lat?: number;
  lng?: number;
  filters?: Partial<DaycareFilters>;
  searchQuery?: string;
  sortBy?: 'distance' | 'rating' | 'price' | 'name';
  enabled?: boolean;
}

export const useDaycares = ({
  lat,
  lng,
  filters,
  searchQuery,
  sortBy = 'distance',
  enabled = true,
}: UseDaycaresParams = {}) => {
  return useQuery({
    queryKey: ['daycares', lat, lng, filters, searchQuery, sortBy],
    queryFn: async () => {
      const params: any = { lat, lng, radius: filters?.distance, search: searchQuery, services: filters?.services, rating: filters?.rating, priceMin: filters?.priceRange?.[0], priceMax: filters?.priceRange?.[1], sortBy };
      const response = await api.getDaycares(params);
      return response.data as Daycare[];
    },
    enabled: enabled && !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDaycareById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['daycare', id],
    queryFn: async () => {
      const response = await api.getDaycareById(id);
      return response.data as Daycare;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.createReservation(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
