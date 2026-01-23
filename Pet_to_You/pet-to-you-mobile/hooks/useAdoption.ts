import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { AdoptionFilters } from '@/store/filterStore';

export interface AdoptionPet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  color?: string;
  image?: string;
  images?: string[];
  story?: string;
  personality?: string;
  goodWith?: string[];
  vaccinated: boolean;
  neutered: boolean;
  healthStatus?: string;
  shelter: {
    id: string;
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
  };
  distance?: number;
  postedAt: string;
}

interface UseAdoptionsParams {
  lat?: number;
  lng?: number;
  filters?: Partial<AdoptionFilters>;
  searchQuery?: string;
  sortBy?: 'distance' | 'age' | 'name';
  enabled?: boolean;
}

export const useAdoptions = ({
  lat,
  lng,
  filters,
  searchQuery,
  sortBy = 'distance',
  enabled = true,
}: UseAdoptionsParams = {}) => {
  return useQuery({
    queryKey: ['adoptions', lat, lng, filters, searchQuery, sortBy],
    queryFn: async () => {
      const params: any = {
        lat,
        lng,
        radius: filters?.distance,
        search: searchQuery,
        species: filters?.species,
        age: filters?.age,
        size: filters?.size,
        gender: filters?.gender,
        vaccinated: filters?.vaccinated,
        neutered: filters?.neutered,
        sortBy,
      };
      const response = await api.getAdoptions(params);
      return response.data as AdoptionPet[];
    },
    enabled: enabled && !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdoptionById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['adoption', id],
    queryFn: async () => {
      const response = await api.getAdoptionById(id);
      return response.data as AdoptionPet;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: any }) => {
      const response = await api.submitApplication(petId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptions'] });
    },
  });
};
