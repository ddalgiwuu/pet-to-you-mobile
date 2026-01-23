/**
 * ProfileHeader Component
 * User profile header with avatar, stats, and follow button
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { UserProfile } from '@/hooks/useUser';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onFollowPress?: () => void;
  onEditPress?: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile = false,
  onFollowPress,
  onEditPress,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Avatar and Name */}
      <View style={styles.topSection}>
        <Image
          source={{
            uri: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FF6B9D&color=fff`,
          }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.stats.posts}</Text>
          <Text style={styles.statLabel}>게시물</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.stats.followers}</Text>
          <Text style={styles.statLabel}>팔로워</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.stats.following}</Text>
          <Text style={styles.statLabel}>팔로잉</Text>
        </View>
      </View>

      {/* Action Button */}
      {isOwnProfile ? (
        <Pressable onPress={onEditPress} style={styles.editButton}>
          <Ionicons name="create-outline" size={18} color={colors.text.primary} />
          <Text style={styles.editButtonText}>프로필 편집</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onFollowPress} style={[
          styles.followButton,
          profile.isFollowing && styles.followingButton,
        ]}>
          <Ionicons
            name={profile.isFollowing ? 'checkmark' : 'add'}
            size={18}
            color={profile.isFollowing ? colors.text.primary : colors.background}
          />
          <Text style={[
            styles.followButtonText,
            profile.isFollowing && styles.followingButtonText,
          ]}>
            {profile.isFollowing ? '팔로잉' : '팔로우'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
    gap: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.text.primary,
  },
  bio: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  followButtonText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.background,
  },
  followingButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followingButtonText: {
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
