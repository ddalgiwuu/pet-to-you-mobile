/**
 * User Profile Screen
 * View user profile and their posts
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/constants/theme';
import { useUserProfile, useUserPosts, useFollowUser, useUnfollowUser } from '@/hooks/useUser';
import ProfileHeader from '@/components/community/ProfileHeader';
import UserPostList from '@/components/community/UserPostList';
import { useProfile } from '@/hooks/useProfile';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  // Get current user to check if this is their own profile
  const { data: currentUser } = useProfile();
  const isOwnProfile = currentUser?.id === userId;

  // Get user profile data
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile(userId);

  // Get user's posts
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useUserPosts(userId);

  // Follow/unfollow mutations
  const { mutate: followUser } = useFollowUser();
  const { mutate: unfollowUser } = useUnfollowUser();

  const posts = postsData?.pages.flatMap((page) => page.posts) || [];

  const handleFollowPress = () => {
    if (profile?.isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const handleEditPress = () => {
    router.push('/settings/edit-profile' as any);
  };

  if (isLoadingProfile || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>프로필</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onFollowPress={handleFollowPress}
          onEditPress={handleEditPress}
        />

        {/* Posts List */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>
            작성한 글 ({profile.stats.posts})
          </Text>
          <UserPostList
            posts={posts}
            isLoading={isLoadingPosts}
            onRefresh={refetch}
            onEndReached={() => hasNextPage && fetchNextPage()}
            hasMore={!!hasNextPage}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading2,
    fontSize: 18,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  postsSection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.text.primary,
    padding: 16,
    paddingBottom: 8,
  },
});
