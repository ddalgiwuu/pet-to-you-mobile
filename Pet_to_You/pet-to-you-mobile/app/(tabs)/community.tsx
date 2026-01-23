import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
// import { FlatList as FlashList } from 'react-native'; // Using FlatList for Expo Go compatibility
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { usePosts } from '@/hooks/useCommunity';
import TrendingHashtags from '@/components/community/TrendingHashtags';
import HashtagChip from '@/components/community/HashtagChip';
import CommunitySearchBar, { SearchFilter } from '@/components/community/CommunitySearchBar';

const CATEGORIES = ['전체', '일상', '건강', '훈련', '음식', '입양', '병원'];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized PostCard component for optimal re-render performance
const PostCard = React.memo(({ post, onPress }: { post: any; onPress: (id: string) => void }) => {
  const postDate = useMemo(
    () => format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko }),
    [post.createdAt]
  );

  const handlePress = useCallback(() => {
    onPress(post.id);
  }, [post.id, onPress]);

  return (
    <TouchableOpacity style={styles.postCard} onPress={handlePress}>
      <View style={styles.postHeader}>
        {post.userAvatar ? (
          <Image
            source={{ uri: post.userAvatar }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#999" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.postDate}>{postDate}</Text>
        </View>
      </View>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
      {post.images?.length > 0 && (
        <Image
          source={{ uri: post.images[0] }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={16} color="#999" />
          <Text style={styles.statText}>{post.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#999" />
          <Text style={styles.statText}>{post.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function CommunityScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

  // Debounce search query (500ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Filter by category or hashtag
  const category = selectedCategory === '전체' ? undefined : selectedCategory;
  const { data, isLoading, refetch, fetchNextPage, hasNextPage } = usePosts(
    category,
    selectedHashtag || debouncedSearchQuery || undefined
  );

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // Memoized callbacks for stable references
  const handleHashtagPress = useCallback((hashtag: string) => {
    setSelectedHashtag(hashtag);
    setSelectedCategory('전체');
  }, []);

  const clearHashtagFilter = useCallback(() => {
    setSelectedHashtag(null);
  }, []);

  const handlePostPress = useCallback((postId: string) => {
    router.push(`/community/${postId}`);
  }, [router]);

  const handleCategoryPress = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setSelectedHashtag(null);
  }, []);

  const handleCreatePress = useCallback(() => {
    router.push('/community/create');
  }, [router]);

  // Memoized render callback with stable reference
  const renderPost = useCallback(({ item }: { item: any }) => {
    return <PostCard post={item} onPress={handlePostPress} />;
  }, [handlePostPress]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Memoized getItemType for better FlashList performance
  const getItemType = useCallback((item: any) => {
    return item.images?.length > 0 ? 'with-image' : 'text-only';
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티</Text>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <CommunitySearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            filter={searchFilter}
            onFilterChange={setSearchFilter}
          />
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View>
            {selectedHashtag && (
              <View style={styles.selectedHashtagContainer}>
                <Text style={styles.selectedHashtagLabel}>검색 중:</Text>
                <HashtagChip
                  tag={selectedHashtag}
                  showRemove
                  onRemove={clearHashtagFilter}
                />
              </View>
            )}
            {!selectedHashtag && (
              <TrendingHashtags onHashtagPress={handleHashtagPress} />
            )}
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreatePress}>
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 16 },
  searchSection: { marginBottom: 16 },
  categories: { flexDirection: 'row', gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 20 },
  categoryChipActive: { backgroundColor: '#42A5F5' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#666' },
  categoryTextActive: { color: '#fff' },
  selectedHashtagContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f5f5f5', marginBottom: 12 },
  selectedHashtagLabel: { fontSize: 13, fontWeight: '500', color: '#666' },
  listContent: { padding: 20 },
  postCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  postHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  userInfo: { marginLeft: 12, justifyContent: 'center' },
  userName: { fontSize: 15, fontWeight: '600', color: '#333' },
  postDate: { fontSize: 12, color: '#999', marginTop: 2 },
  postTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 8 },
  postContent: { fontSize: 15, lineHeight: 22, color: '#666', marginBottom: 12 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  postStats: { flexDirection: 'row', gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#42A5F5', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
