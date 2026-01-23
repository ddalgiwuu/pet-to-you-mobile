import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { MOCK_USER_PROFILE } from '@/constants/mockData';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  stats: {
    pets: number;
    bookings: number;
    reviews: number;
  };
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

// Get current user profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const response = await api.getProfile();
        return response.data as UserProfile;
      } catch (error) {
        console.log('API unavailable, using mock profile data');
        return MOCK_USER_PROFILE;
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: MOCK_USER_PROFILE,
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.updateProfile(data);
      return response.data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Upload avatar mutation
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await api.uploadAvatar(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export default useProfile;
