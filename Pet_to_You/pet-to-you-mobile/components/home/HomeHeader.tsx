/**
 * Home Screen Header with profile, notifications, and location
 * Optimized with React Best Practices
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

interface HomeHeaderProps {
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onLocationPress?: () => void;
}

// Rule 6.3: Hoist Static JSX Elements
const StatusBarComponent = <StatusBar barStyle="dark-content" />;

// Rule 5.2: Extract to Memoized Components
const ProfileSection = React.memo(({
  userName,
  onPress
}: {
  userName: string;
  onPress?: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.profileSection}>
    <View style={styles.avatar}>
      <Ionicons name="person" size={20} color={colors.primary} />
    </View>
    <View>
      <Text style={styles.greeting}>안녕하세요 👋</Text>
      <Text style={styles.userName}>{userName}님</Text>
    </View>
  </Pressable>
));

// Rule 5.2: Extract to Memoized Components
const NotificationButton = React.memo(({
  count,
  onPress
}: {
  count: number;
  onPress?: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.iconButton}>
    <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </Pressable>
));

export default function HomeHeader({
  onProfilePress,
  onNotificationPress,
  onLocationPress,
}: HomeHeaderProps) {
  // Rule 5.4: Subscribe to Derived State (only userName, not entire user object)
  const userName = useAuthStore((state) => state.user?.name || '반려인');

  // Mock notification count - replace with SWR hook
  const notificationCount = 3;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {StatusBarComponent}
      <View style={styles.container}>
        {/* Left: Profile */}
        <ProfileSection userName={userName} onPress={onProfilePress} />

        {/* Right: Location & Notifications */}
        <View style={styles.rightSection}>
          <Pressable onPress={onLocationPress} style={styles.iconButton}>
            <Ionicons name="location-outline" size={24} color={colors.text.primary} />
          </Pressable>
          <NotificationButton count={notificationCount} onPress={onNotificationPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md, // Modern minimal spacing (12px)
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    minHeight: 56, // Standard mobile header height
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  greeting: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  userName: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
});
