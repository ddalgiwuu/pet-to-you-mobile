/**
 * UserPostList Component
 * List of posts by a specific user with infinite scroll
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Post } from '@/hooks/useCommunity';

interface UserPostListProps {
  posts: Post[];
  isLoading: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  hasMore: boolean;
}

export default function UserPostList({
  posts,
  isLoading,
  onRefresh,
  onEndReached,
  hasMore,
}: UserPostListProps) {
  const router = useRouter();

  const renderPost = ({ item }: { item: Post }) => {
    const postDate = format(new Date(item.createdAt), 'yyyy.MM.dd', { locale: ko });

    return (
      <Pressable
        onPress={() => router.push(`/community/${item.id}` as any)}
        style={styles.postCard}
      >
        <View style={styles.postContent}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.postText} numberOfLines={2}>
            {item.content}
          </Text>

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {item.hashtags.slice(0, 3).map((tag, index) => (
                <Text key={index} style={styles.hashtag}>
                  {tag}
                </Text>
              ))}
            </View>
          )}

          {/* Stats and Date */}
          <View style={styles.postFooter}>
            <Text style={styles.postDate}>{postDate}</Text>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.statText}>{item.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.statText}>{item.comments}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Thumbnail */}
        {item.images && item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
        )}
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color={colors.text.tertiary} />
      <Text style={styles.emptyText}>작성한 게시물이 없습니다</Text>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    ...shadows.small,
  },
  postContent: {
    flex: 1,
    gap: 6,
  },
  postTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  postText: {
    ...typography.body2,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hashtag: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  postDate: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});
