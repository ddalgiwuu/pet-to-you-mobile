/**
 * Home Screen - 2024-2025 Modern UI/UX
 * Features: Glassmorphism, Haptic Feedback, Skeleton Loading, Advanced Animations
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  HomeHeader,
  PetQuickCard,
  QuickServicesBento,
  SmartContentCard,
  HospitalCard,
  CommunityHighlights,
} from '@/components/home';
import { Card } from '@/components/ui/Card';
import { AnimatedFAB } from '@/components/ui/AnimatedFAB';
import { SkeletonHospitalCard, SkeletonCard } from '@/components/ui/SkeletonLoader';
import { HapticButton } from '@/components/ui/HapticButton';
import { PetCarouselCard } from '@/components/ui/PetCarouselCard';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { useBookings } from '@/hooks/useBookings';
import useHospitals from '@/hooks/useHospitals';

// Mock pet data
const MOCK_PETS = [
  {
    id: '1',
    name: '버디',
    breed: '골든 리트리버',
    age: 3,
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
  },
  {
    id: '2',
    name: '루나',
    breed: '시베리안 고양이',
    age: 2,
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  // Parallax scroll animation
  const scrollY = useSharedValue(0);

  // Get upcoming bookings data
  const { data: bookings = [], refetch: refetchBookings } = useBookings('upcoming');
  const hasUpcomingBookings = bookings.length > 0;

  // Get nearby hospitals data
  const {
    data: hospitals = [],
    isLoading: hospitalsLoading,
    error: hospitalsError,
    refetch: refetchHospitals
  } = useHospitals({
    sortBy: 'distance',
    enabled: true
  });

  // Rule 5.5: Use Functional setState Updates
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBookings(), refetchHospitals()]);
    setTimeout(() => setRefreshing(false), 1000);
  }, [refetchBookings, refetchHospitals]);

  // Rule 5.5: Stable callback with useCallback
  const handleServicePress = React.useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  // Rule 5.5: Stable navigation callbacks
  const handleProfilePress = React.useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  const handleBookingsPress = React.useCallback(() => {
    router.push('/(tabs)/bookings');
  }, [router]);

  const handleHospitalsPress = React.useCallback(() => {
    router.push('/(tabs)/hospitals');
  }, [router]);

  const handlePetPress = React.useCallback((petId: string) => {
    router.push(`/(tabs)/pets/${petId}` as any);
  }, [router]);

  const handleBookingPress = React.useCallback((bookingId: string) => {
    router.push('/(tabs)/bookings' as any);
  }, [router]);

  const handleHospitalPress = React.useCallback((id: string) => {
    router.push(`/hospital/${id}` as any);
  }, [router]);

  const handleAddPet = React.useCallback(() => {
    router.push('/pets/register' as any);
  }, [router]);

  const handleEmergency = React.useCallback(() => {
    router.push('/emergency' as any);
  }, [router]);

  // Parallax scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animation based on scroll
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.9],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -10],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={headerStyle}>
        <HomeHeader
          onProfilePress={handleProfilePress}
          onNotificationPress={() => {}}
          onLocationPress={() => {}}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        bouncesZoom={false}
        decelerationRate="normal"
      >
        {/* 1. 빠른 서비스 Bento Grid - MOVED TO SECOND POSITION */}
        <QuickServicesBento onPress={handleServicePress} />

        {/* 2. 나의 반려동물 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>나의 반려동물</Text>
            <Pressable onPress={handleAddPet}>
              <Text style={styles.viewAll}>전체보기</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={260}
            decelerationRate="fast"
            contentContainerStyle={styles.petCarousel}
          >
            {MOCK_PETS.map((pet, index) => (
              <Animated.View
                key={pet.id}
                entering={FadeIn.delay(200 + index * 150).springify().damping(14)}
              >
                <PetCarouselCard pet={pet} onPress={handlePetPress} />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* 3. Smart Content Card - Replaces UpcomingBooking + HealthTips */}
        <SmartContentCard
          booking={bookings[0] || null}
          onBookingPress={handleBookingPress}
          onViewAllPress={handleBookingsPress}
        />

        {/* 4. 가까운 병원 - Vertical List Layout */}
        <View style={styles.hospitalSection}>
          <View style={styles.hospitalHeader}>
            <Text style={styles.sectionTitle}>가까운 병원</Text>
            <Pressable
              onPress={handleHospitalsPress}
              style={({ pressed }) => [
                styles.viewAllButton,
                pressed && styles.viewAllButtonPressed,
              ]}
            >
              <Text style={styles.viewAllHighlight}>전체보기</Text>
              <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
            </Pressable>
          </View>

          {hospitalsLoading ? (
            <View style={styles.hospitalList}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.hospitalListItem}>
                  <SkeletonHospitalCard />
                </View>
              ))}
            </View>
          ) : hospitalsError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
              <Text style={styles.errorText}>병원 정보를 불러올 수 없습니다</Text>
              <Text style={styles.errorSubtext}>서버 연결을 확인해주세요</Text>
              <HapticButton onPress={() => refetchHospitals()}>
                <View style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </View>
              </HapticButton>
            </View>
          ) : hospitals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>주변에 병원이 없습니다</Text>
            </View>
          ) : (
            <View style={styles.hospitalList}>
              {hospitals.slice(0, 5).map((hospital, index) => (
                <Animated.View
                  key={hospital.id}
                  entering={FadeIn.delay(600 + index * 100).springify().damping(20).stiffness(90)}
                  style={styles.hospitalListItem}
                >
                  <HospitalCard
                    hospital={hospital}
                    onPress={handleHospitalPress}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        {/* 5. 커뮤니티 하이라이트 - NEW */}
        <CommunityHighlights
          onPostPress={(postId) => router.push('/(tabs)/community' as any)}
          onViewAllPress={() => router.push('/(tabs)/community' as any)}
        />

        {/* Bottom Spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Toss style: Pure white
  },
  section: {
    paddingHorizontal: 20, // Toss style: More generous spacing
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petCarousel: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  sectionTitle: {
    fontSize: 24, // Toss style: Large typography
    fontWeight: '800',
    color: '#191F28', // Toss dark gray
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 15,
    color: '#6B7684', // Toss gray
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllButtonPressed: {
    opacity: 0.6,
  },
  viewAllHighlight: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  hospitalSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hospitalList: {
    gap: 12,
  },
  hospitalListItem: {
    width: '100%',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191F28',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7684',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7684',
    marginTop: 16,
    textAlign: 'center',
  },
});
