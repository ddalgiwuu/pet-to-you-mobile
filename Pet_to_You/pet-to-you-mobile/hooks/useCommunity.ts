import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { MOCK_POSTS, getMockPostsByCategory } from '@/constants/mockData';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  category: string;
  title: string;
  content: string;
  images?: string[];
  hashtags?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
}

export const usePosts = (category?: string, searchQuery?: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', category, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.getPosts({ category, search: searchQuery, page: pageParam, limit: 20 });
        return { posts: response.data.posts as Post[], hasMore: response.data.hasMore };
      } catch (error) {
        console.log('API unavailable, using mock posts data');
        const filteredPosts = category
          ? getMockPostsByCategory(category)
          : MOCK_POSTS;
        return { posts: filteredPosts, hasMore: false };
      }
    },
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePostById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      try {
        const response = await api.getPostById(id);
        return response.data as Post;
      } catch (error) {
        console.log('API unavailable, using mock post data');
        const mockPost = MOCK_POSTS.find((p) => p.id === id);
        if (!mockPost) throw new Error('Post not found');
        return mockPost;
      }
    },
    enabled: enabled && !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.createPost(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.likePost(postId);
      return response.data;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useComments = (postId: string) => {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getComments(postId, pageParam, 20);
      return { comments: response.data.comments as Comment[], hasMore: response.data.hasMore };
    },
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    initialPageParam: 1,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await api.createComment(postId, { content });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};
