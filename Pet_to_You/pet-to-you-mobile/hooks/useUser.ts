/**
 * User Hooks
 * Hooks for user profiles, posts, and follow functionality
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Post } from './useCommunity';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
}

// Mock data for fallback
const MOCK_USER_PROFILE: UserProfile = {
  id: 'user-1',
  name: '김민수',
  email: 'user@example.com',
  avatar: 'https://ui-avatars.com/api/?name=김민수&background=FF6B9D&color=fff',
  bio: '반려동물과 함께하는 행복한 일상 🐶',
  createdAt: '2024-01-01T00:00:00Z',
  stats: {
    posts: 15,
    followers: 48,
    following: 32,
  },
  isFollowing: false,
};

// Get user profile by ID
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      try {
        const response = await api.getUserProfile(userId);
        return response.data as UserProfile;
      } catch (error) {
        console.log('API unavailable, using mock user profile');
        return MOCK_USER_PROFILE;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: MOCK_USER_PROFILE,
  });
};

// Get user's posts (infinite scroll)
export const useUserPosts = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['user-posts', userId],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.getUserPosts(userId, pageParam, 20);
        return {
          posts: response.data.posts as Post[],
          hasMore: response.data.hasMore,
        };
      } catch (error) {
        console.log('API unavailable, using empty posts');
        return { posts: [], hasMore: false };
      }
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!userId,
  });
};

// Follow user mutation
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.followUser(userId);
      return response.data;
    },
    onSuccess: (_, userId) => {
      // Invalidate user profile to update following status
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Update current user's following count
    },
  });
};

// Unfollow user mutation
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.unfollowUser(userId);
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export default useUserProfile;
