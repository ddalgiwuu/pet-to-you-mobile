/**
 * Upcoming Booking Card
 * Optimized with React Best Practices
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

interface Booking {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  petId: string;
  petName: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  symptoms?: string;
  notes?: string;
  createdAt: string;
}

interface UpcomingBookingProps {
  bookings?: Booking[];
  onPress?: (bookingId: string) => void;
  onViewAll?: () => void;
}

// Rule 5.2: Memoized Empty State Component
const EmptyState = React.memo(() => (
  <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
    <Text style={styles.title}>다가오는 예약</Text>
    <Pressable style={styles.emptyCard}>
      <Ionicons name="calendar-outline" size={40} color={colors.text.tertiary} />
      <Text style={styles.emptyText}>예정된 예약이 없습니다</Text>
      <Text style={styles.emptySubtext}>병원을 찾아 예약해보세요</Text>
    </Pressable>
  </Animated.View>
));

// Rule 5.2: Memoized Booking Card Component
const BookingCard = React.memo(({
  booking,
  onPress
}: {
  booking: Booking;
  onPress?: (id: string) => void;
}) => {
  // Rule 5.5: Stable callback
  const handlePress = React.useCallback(() => {
    onPress?.(booking.id);
  }, [booking.id, onPress]);

  return (
    <Pressable onPress={handlePress}>
      <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.bookingCard}>
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.background} />
          <Text style={styles.statusText}>예약 확정</Text>
        </View>

        {/* Hospital Info */}
        <View style={styles.hospitalInfo}>
          <Ionicons name="medical" size={20} color={colors.background} />
          <Text style={styles.hospitalName}>{booking.hospitalName}</Text>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.background} />
            <Text style={styles.detailText}>{booking.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.background} />
            <Text style={styles.detailText}>{booking.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="paw-outline" size={16} color={colors.background} />
            <Text style={styles.detailText}>{booking.petName}</Text>
          </View>
        </View>

        {/* Action */}
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>자세히 보기</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.background} />
        </View>
      </LinearGradient>
    </Pressable>
  );
});

export default function UpcomingBooking({ bookings = [], onPress, onViewAll }: UpcomingBookingProps) {
  // Rule 7.8: Early Return
  if (!bookings || bookings.length === 0) {
    return <EmptyState />;
  }

  // Get the first upcoming booking
  const firstBooking = bookings[0];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}:${minutes}`;
  };

  const displayBooking = {
    ...firstBooking,
    date: formatDate(firstBooking.date),
    time: formatTime(firstBooking.time),
  };

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>다가오는 예약</Text>
        {bookings.length > 1 && (
          <Pressable onPress={onViewAll}>
            <Text style={styles.viewAll}>전체보기 ({bookings.length})</Text>
          </Pressable>
        )}
      </View>

      <BookingCard booking={displayBooking} onPress={onPress} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.text.primary,
  },
  viewAll: {
    ...typography.body2,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  bookingCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '700',
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hospitalName: {
    ...typography.heading3,
    color: colors.background,
    flex: 1,
  },
  detailsContainer: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.body2,
    color: colors.background,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionText: {
    ...typography.body1,
    color: colors.background,
    fontWeight: '600',
  },
  emptyCard: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
