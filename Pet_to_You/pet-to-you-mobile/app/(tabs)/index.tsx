/**
 * Home Screen - Improved UI/UX
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HomeHeader, PetQuickCard, UpcomingBooking, HospitalCard, HealthTips } from '@/components/home';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

const SERVICES = [
  { id: 1, title: '병원 찾기', icon: 'medical', route: '/(tabs)/hospitals', color: '#FF6B9D' },
  { id: 2, title: '예약 관리', icon: 'calendar', route: '/(tabs)/bookings', color: '#4ECDC4' },
  { id: 3, title: '건강 기록', icon: 'document-text', route: null, color: '#FFE66D' },
  { id: 4, title: '응급 상황', icon: 'alert-circle', route: null, color: '#FF6B6B' },
];

// Mock hospital data
const MOCK_HOSPITALS = [
  {
    id: '1',
    name: '24시 행복 동물병원',
    distance: '0.3km',
    rating: 4.8,
    reviewCount: 127,
    isOpen: true,
    specialties: ['외과', '내과', '24시간'],
  },
  {
    id: '2',
    name: '사랑 동물병원',
    distance: '0.5km',
    rating: 4.6,
    reviewCount: 89,
    isOpen: true,
    specialties: ['피부과', '치과'],
  },
  {
    id: '3',
    name: '우리 동물병원',
    distance: '0.8km',
    rating: 4.5,
    reviewCount: 64,
    isOpen: false,
    specialties: ['정형외과', '안과'],
  },
];

// Memoized Service Card Component (Rule 5.2: Extract to Memoized Components)
const ServiceCard = React.memo(({ service, index, onPress }: {
  service: typeof SERVICES[0];
  index: number;
  onPress: (route: string | null) => void;
}) => (
  <Animated.View
    entering={FadeInDown.delay(400 + index * 100)}
    style={styles.serviceCardWrapper}
  >
    <Pressable
      onPress={() => onPress(service.route)}
      style={[styles.serviceCard, { backgroundColor: service.color + '15' }]}
      android_ripple={{ color: service.color + '30' }}
    >
      <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
        <Ionicons name={service.icon as any} size={18} color={colors.background} />
      </View>
      <Text style={styles.serviceTitle}>{service.title}</Text>
    </Pressable>
  </Animated.View>
));

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // TODO: Replace with actual booking data from useUpcomingBookings() hook
  const hasUpcomingBookings = false; // Will be true when real data is loaded

  // Rule 5.5: Use Functional setState Updates
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  // Rule 5.5: Stable callback with useCallback
  const handleServicePress = React.useCallback((route: string | null) => {
    if (route) router.push(route as any);
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
    console.log('Pet pressed:', petId);
  }, []);

  const handleBookingPress = React.useCallback((bookingId: string) => {
    console.log('Booking pressed:', bookingId);
  }, []);

  const handleHospitalPress = React.useCallback((id: string) => {
    console.log('Hospital pressed:', id);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <HomeHeader
        onProfilePress={handleProfilePress}
        onNotificationPress={() => {}}
        onLocationPress={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Pet Quick Access */}
        <PetQuickCard
          onAddPet={() => {}}
          onPetPress={handlePetPress}
        />

        {/* Upcoming Booking */}
        <UpcomingBooking
          onPress={handleBookingPress}
          onViewAll={handleBookingsPress}
        />

        {/* Health Tips - Show when no bookings */}
        {!hasUpcomingBookings && <HealthTips />}

        {/* Service Grid */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>서비스</Text>
          <View style={styles.serviceGrid}>
            {SERVICES.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onPress={handleServicePress}
              />
            ))}
          </View>
        </Animated.View>

        {/* Nearby Hospitals */}
        <View style={styles.hospitalSection}>
          <View style={styles.hospitalHeader}>
            <Text style={styles.sectionTitle}>가까운 병원</Text>
            <Pressable onPress={handleHospitalsPress}>
              <Text style={styles.viewAll}>전체보기</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hospitalScroll}
          >
            {MOCK_HOSPITALS.map((hospital, index) => (
              <Animated.View
                key={hospital.id}
                entering={FadeInDown.delay(600 + index * 100)}
                style={{
                  marginLeft: index === 0 ? 0 : 0, // First card uses ScrollView padding
                  marginRight: index === MOCK_HOSPITALS.length - 1 ? 0 : 12, // Last card uses ScrollView padding
                }}
              >
                <HospitalCard
                  hospital={hospital}
                  onPress={handleHospitalPress}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: 16, // Modern consistent padding
    marginBottom: 24, // Increased section spacing for better breathing room
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Modern spacing
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 20, // Slightly larger for better hierarchy
    fontWeight: '700',
    color: colors.text.primary,
  },
  viewAll: {
    ...typography.body2,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Tight modern spacing
    justifyContent: 'space-between',
  },
  serviceCardWrapper: {
    width: '23%', // 4-column grid (4 × 23% + 3 × 8px gaps ≈ 100%)
  },
  serviceCard: {
    alignItems: 'center',
    padding: 12, // Compact padding
    borderRadius: 16, // Soft modern corners
    gap: 6,
    minHeight: 80, // Consistent compact height
  },
  serviceIcon: {
    width: 32, // Reduced from 48px
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    ...typography.caption,
    fontSize: 11, // Smaller for compact design
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  hospitalSection: {
    marginBottom: 24,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // Header indentation
    marginBottom: 16,
  },
  hospitalScroll: {
    paddingHorizontal: 16, // Consistent screen edge padding
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
