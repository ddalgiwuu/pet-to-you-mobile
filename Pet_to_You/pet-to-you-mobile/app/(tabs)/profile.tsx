/**
 * Profile Screen - Complete Implementation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import { usePets } from '@/hooks/usePets';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  color: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: pets = [] } = usePets();

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: '예약 내역',
      icon: 'calendar-outline',
      route: '/(tabs)/bookings',
      color: '#4ECDC4',
    },
    {
      id: '2',
      title: '관심 병원',
      icon: 'heart-outline',
      route: '/favorites/hospitals',
      color: '#FF6B9D',
    },
    {
      id: '3',
      title: '내 리뷰',
      icon: 'star-outline',
      route: '/reviews',
      color: '#FFE66D',
    },
    {
      id: '4',
      title: '건강 기록',
      icon: 'document-text-outline',
      route: '/health/records',
      color: '#95E1D3',
    },
    {
      id: '4.5',
      title: '반려동물 보험',
      icon: 'shield-checkmark-outline',
      route: '/insurance/list',
      color: '#95E1D3',
    },
    {
      id: '5',
      title: '설정',
      icon: 'settings-outline',
      route: '/settings',
      color: '#A8DADC',
    },
    {
      id: '6',
      title: '고객센터',
      icon: 'help-circle-outline',
      route: '/support',
      color: '#F38181',
    },
  ];

  const handleMenuPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert('알림', '준비 중인 기능입니다.');
    }
  };

  const handleAddPet = () => {
    router.push('/pets/register' as any);
  };

  const handlePetPress = (petId: string) => {
    router.push(`/(tabs)/pets/${petId}` as any);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear auth token and user data
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Gradient */}
      <LinearGradient
        colors={['#FF6B9D', '#4ECDC4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name) }}
              style={styles.avatar}
            />
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.background} />
            </Pressable>
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.pets}</Text>
            <Text style={styles.statLabel}>반려동물</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.bookings}</Text>
            <Text style={styles.statLabel}>예약</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.reviews}</Text>
            <Text style={styles.statLabel}>리뷰</Text>
          </View>
        </View>
      </LinearGradient>

      {/* My Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 반려동물</Text>
          <Pressable onPress={handleAddPet}>
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={styles.addButtonText}>펫 추가</Text>
            </View>
          </Pressable>
        </View>

        {pets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petsScroll}
          >
            {pets.map((pet, index) => (
              <Pressable
                key={pet.id}
                onPress={() => handlePetPress(pet.id)}
                style={[
                  styles.petCard,
                  index === 0 && styles.petCardFirst,
                  index === pets.length - 1 && styles.petCardLast,
                ]}
              >
                <Image
                  source={{ uri: pet.image || 'https://via.placeholder.com/80' }}
                  style={styles.petImage}
                />
                <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
                <Text style={styles.petBreed} numberOfLines={1}>{pet.breed || pet.species}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyPets}>
            <Ionicons name="paw-outline" size={32} color={colors.text?.tertiary || '#9CA3AF'} />
            <Text style={styles.emptyText}>등록된 반려동물이 없습니다</Text>
            <Pressable onPress={handleAddPet}>
              <Text style={styles.emptyAction}>펫 등록하기</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>메뉴</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleMenuPress(item.route)}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text?.tertiary || '#9CA3AF'} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Pet to You v1.0.0</Text>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: '#6B7684',
    textAlign: 'center',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.background,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    ...typography.heading2,
    color: colors.background,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.heading2,
    fontSize: 24,
    color: colors.background,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
    color: '#191F28',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    ...typography.body2,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  petsScroll: {
    paddingRight: 16,
  },
  petCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginRight: 12,
    width: 100,
    ...shadows.small,
  },
  petCardFirst: {
    marginLeft: 0,
  },
  petCardLast: {
    marginRight: 0,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  petName: {
    ...typography.body2,
    fontWeight: '600',
    color: '#191F28',
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  petBreed: {
    ...typography.caption,
    fontSize: 11,
    color: '#6B7684',
    textAlign: 'center',
    width: '100%',
  },
  emptyPets: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  emptyText: {
    ...typography.body2,
    color: '#6B7684',
  },
  emptyAction: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    ...typography.body1,
    fontWeight: '500',
    color: '#191F28',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  logoutText: {
    ...typography.body1,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 8,
  },
  versionText: {
    ...typography.caption,
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
