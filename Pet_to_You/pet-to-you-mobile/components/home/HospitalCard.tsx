/**
 * Improved Hospital Card with ratings, reviews, and status
 * Optimized with React Best Practices and expo-image
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface Hospital {
  id: string;
  name: string;
  distance: number; // Changed to number
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  specialties: string[];
  address?: string;
}

interface HospitalCardProps {
  hospital: Hospital;
  onPress?: (hospitalId: string) => void;
}

// Memoized Star Rating Component with optimized star generation
const STAR_INDICES = [1, 2, 3, 4, 5] as const;

const StarRating = React.memo(({ rating }: { rating: number }) => {
  // Memoize stars array to avoid recreation on every render
  const stars = useMemo(() =>
    STAR_INDICES.map((star) => ({
      key: star,
      filled: star <= rating
    })),
    [rating]
  );

  return (
    <View style={styles.stars}>
      {stars.map(({ key, filled }) => (
        <Ionicons
          key={key}
          name={filled ? 'star' : 'star-outline'}
          size={11}
          color={filled ? '#FFD700' : colors.text.tertiary}
        />
      ))}
    </View>
  );
});

// Memoized Specialty Tags Component with slice optimization
const SpecialtyTags = React.memo(({ specialties }: { specialties: string[] }) => {
  // Memoize sliced specialties to prevent recalculation
  const displaySpecialties = useMemo(
    () => specialties.slice(0, 3),
    [specialties]
  );

  return (
    <View style={styles.specialtiesRow}>
      {displaySpecialties.map((specialty, index) => (
        <View key={index} style={styles.specialtyTag}>
          <Text style={styles.specialtyText}>{specialty}</Text>
        </View>
      ))}
    </View>
  );
});

const HospitalCard = React.memo(({ hospital, onPress }: HospitalCardProps) => {
  // Rule 5.5: Stable callback
  const handlePress = React.useCallback(() => {
    onPress?.(hospital.id);
  }, [hospital.id, onPress]);

  // Format distance properly
  const formattedDistance = useMemo(() => {
    if (typeof hospital.distance === 'number') {
      return hospital.distance < 1
        ? `${(hospital.distance * 1000).toFixed(0)}m`
        : `${hospital.distance.toFixed(1)}km`;
    }
    return hospital.distance;
  }, [hospital.distance]);

  return (
    <Pressable onPress={handlePress}>
      <Card style={styles.card} gradientBorder={false}>
        {/* Header with Name and Distance */}
        <View style={styles.header}>
          <View style={styles.hospitalIcon}>
            <Ionicons name="medical" size={18} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text
              style={styles.hospitalName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {hospital.name}
            </Text>
            <View style={styles.distanceRow}>
              <Ionicons name="location" size={11} color={colors.text.secondary} />
              <Text style={styles.distance}>{formattedDistance}</Text>
            </View>
          </View>

          {/* Status Badge - Modern Dot Indicator */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, hospital.isOpen ? styles.openDot : styles.closedDot]} />
            <Text style={hospital.isOpen ? styles.openText : styles.closedText}>
              {hospital.isOpen ? '영업중' : '휴무'}
            </Text>
          </View>
        </View>

        {/* Rating and Reviews */}
        <View style={styles.ratingRow}>
          <StarRating rating={hospital.rating} />
          <Text style={styles.rating}>{hospital.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({hospital.reviewCount})</Text>
        </View>

        {/* Specialties */}
        {hospital.specialties.length > 0 && (
          <SpecialtyTags specialties={hospital.specialties} />
        )}

        {/* Action Button */}
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>자세히 보기</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </Card>
    </Pressable>
  );
});

export default HospitalCard;

const styles = StyleSheet.create({
  card: {
    width: '100%', // Flexible width for Bento grid
    padding: 0, // Remove duplicate padding (Card component has default padding: 16)
    gap: 10, // Balanced gap for optimal vertical distribution
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: 2,
    paddingTop: 16, // Ample top padding for breathing room
  },
  hospitalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // Prevent icon from shrinking
  },
  headerInfo: {
    flex: 1,
    minWidth: 0, // Enable text truncation in flex container
  },
  hospitalName: {
    ...typography.body2,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distance: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openDot: {
    backgroundColor: '#2DD36F', // Bright modern green
    shadowColor: '#2DD36F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  closedDot: {
    backgroundColor: '#EB445A', // Modern red
    shadowColor: '#EB445A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  openText: {
    ...typography.caption,
    fontSize: 11,
    color: '#2DD36F',
    fontWeight: '700',
  },
  closedText: {
    ...typography.caption,
    fontSize: 11,
    color: '#EB445A',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  rating: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  reviewCount: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 2, // Prevent tags from touching corners
  },
  specialtyTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  specialtyText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    paddingBottom: 12, // Ample bottom padding to prevent text cutoff
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  actionText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});
