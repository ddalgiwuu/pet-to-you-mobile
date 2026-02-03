import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Veterinarian } from '@/types';
import { MOCK_VETERINARIANS } from '@/constants/mockData';

// Get veterinarians list for a hospital
export const useVeterinarians = (
  hospitalId: string,
  activeOnly: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['veterinarians', hospitalId, activeOnly],
    queryFn: async () => {
      try {
        const response = await api.getVeterinarians(hospitalId, activeOnly);
        const backendData = response.data?.data || response.data;
        return (backendData || []) as Veterinarian[];
      } catch (error) {
        console.error('Failed to fetch veterinarians, using mock data:', error);
        // Fallback to mock data
        const mockVets = MOCK_VETERINARIANS.filter(
          (vet) => vet.hospitalId === hospitalId
        );
        return activeOnly
          ? mockVets.filter((vet) => vet.isActive)
          : mockVets;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single veterinarian by ID
export const useVeterinarianById = (
  hospitalId: string,
  vetId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['veterinarian', hospitalId, vetId],
    queryFn: async () => {
      try {
        const response = await api.getVeterinarianById(hospitalId, vetId);
        const backendData = response.data?.data || response.data;
        return backendData as Veterinarian;
      } catch (error) {
        console.error('Failed to fetch veterinarian, using mock data:', error);
        // Fallback to mock data
        return MOCK_VETERINARIANS.find((vet) => vet.id === vetId);
      }
    },
    enabled: enabled && !!vetId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create new veterinarian
export const useCreateVeterinarian = (hospitalId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Veterinarian>) => {
      const response = await api.createVeterinarian(hospitalId, data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      // Invalidate all veterinarian queries for this hospital
      queryClient.invalidateQueries({
        queryKey: ['veterinarians', hospitalId],
      });
    },
  });
};

// Update veterinarian
export const useUpdateVeterinarian = (hospitalId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vetId, data }: { vetId: string; data: Partial<Veterinarian> }) => {
      const response = await api.updateVeterinarian(hospitalId, vetId, data);
      return response.data?.data || response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific veterinarian and list
      queryClient.invalidateQueries({
        queryKey: ['veterinarian', hospitalId, variables.vetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['veterinarians', hospitalId],
      });
    },
  });
};

// Delete veterinarian
export const useDeleteVeterinarian = (hospitalId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vetId: string) => {
      const response = await api.deleteVeterinarian(hospitalId, vetId);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      // Invalidate all veterinarian queries for this hospital
      queryClient.invalidateQueries({
        queryKey: ['veterinarians', hospitalId],
      });
    },
  });
};

// Toggle veterinarian active status
export const useToggleVeterinarianStatus = (hospitalId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vetId, isActive }: { vetId: string; isActive: boolean }) => {
      const response = await api.toggleVeterinarianStatus(hospitalId, vetId, isActive);
      return response.data?.data || response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific veterinarian and list
      queryClient.invalidateQueries({
        queryKey: ['veterinarian', hospitalId, variables.vetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['veterinarians', hospitalId],
      });
    },
  });
};
