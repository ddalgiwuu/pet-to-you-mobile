import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { MOCK_PETS } from '@/constants/mockData';

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  weight?: number;
  color?: string;
  image?: string;
  images?: string[];
  
  // Medical Info
  allergies?: string[];
  diseases?: string[];
  vaccinations?: {
    name: string;
    date: string;
    nextDate?: string;
  }[];
  neutered?: boolean;
  microchipId?: string;
  
  // Additional
  personality?: string;
  specialNeeds?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  weight?: number;
  color?: string;
  allergies?: string[];
  diseases?: string[];
  vaccinations?: { name: string; date: string; nextDate?: string }[];
  neutered?: boolean;
  microchipId?: string;
  personality?: string;
  specialNeeds?: string;
}

// Get all user's pets
export const usePets = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      try {
        const response = await api.getPets();
        return response.data as Pet[];
      } catch (error) {
        console.log('API unavailable, using mock pets data');
        return MOCK_PETS;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: MOCK_PETS,
  });
};

// Get pet by ID
export const usePetById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      try {
        const response = await api.getPetById(id);
        return response.data as Pet;
      } catch (error) {
        console.log('API unavailable, using mock pet data');
        const mockPet = MOCK_PETS.find((p) => p.id === id);
        if (!mockPet) throw new Error('Pet not found');
        return mockPet;
      }
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create pet mutation
export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePetData) => {
      const response = await api.createPet(data);
      return response.data as Pet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

// Update pet mutation
export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePetData> }) => {
      const response = await api.updatePet(id, data);
      return response.data as Pet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', data.id] });
    },
  });
};

// Upload pet photo mutation
export const useUploadPetPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, uri }: { petId: string; uri: string }) => {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await api.uploadPetPhoto(petId, formData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pet', variables.petId] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export default usePets;
