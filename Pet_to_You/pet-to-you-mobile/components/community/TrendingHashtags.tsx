/**
 * TrendingHashtags Component
 * Displays trending hashtags with post counts
 * Optimized with React.memo and useCallback
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { getMockTrendingHashtags } from '@/constants/mockData';

interface TrendingHashtagsProps {
  onHashtagPress?: (hashtag: string) => void;
}

// Memoized HashtagCard for optimal re-render performance
const HashtagCard = React.memo(({
  tag,
  count,
  isFirst,
  onPress
}: {
  tag: string;
  count: number;
  isFirst: boolean;
  onPress: (tag: string) => void;
}) => {
  const handlePress = useCallback(() => {
    onPress(tag);
  }, [tag, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.hashtagCard, isFirst && styles.firstCard]}
    >
      <Text style={styles.hashtag}>{tag}</Text>
      <Text style={styles.count}>{count}개의 게시물</Text>
    </Pressable>
  );
});

export default React.memo(function TrendingHashtags({ onHashtagPress }: TrendingHashtagsProps) {
  // Memoize trending hashtags to prevent recalculation
  const trendingHashtags = useMemo(() => getMockTrendingHashtags(), []);

  // Early return optimization
  if (trendingHashtags.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>인기 해시태그</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {trendingHashtags.map(({ tag, count }, index) => (
          <HashtagCard
            key={tag}
            tag={tag}
            count={count}
            isFirst={index === 0}
            onPress={onHashtagPress!}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hashtagCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    minWidth: 120,
    ...shadows.small,
  },
  firstCard: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  hashtag: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  count: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.secondary,
  },
});
