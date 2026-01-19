/**
 * Health Tips Section
 * Displays helpful tips when no bookings are scheduled
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface HealthTip {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const HEALTH_TIPS: HealthTip[] = [
  {
    id: '1',
    icon: 'water',
    title: '충분한 수분 섭취',
    description: '하루 2-3회 신선한 물 제공',
    color: '#4ECDC4',
  },
  {
    id: '2',
    icon: 'fitness',
    title: '규칙적인 운동',
    description: '매일 30분 이상 산책',
    color: '#FFE66D',
  },
  {
    id: '3',
    icon: 'medical',
    title: '정기 건강검진',
    description: '6개월마다 병원 방문',
    color: '#FF6B9D',
  },
];

// Memoized Tip Card Component
const TipCard = React.memo(({ tip, index }: { tip: HealthTip; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(400 + index * 100)}
    style={styles.tipCardWrapper}
  >
    <Pressable style={[styles.tipCard, { backgroundColor: tip.color + '15' }]}>
      <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
        <Ionicons name={tip.icon} size={20} color={colors.background} />
      </View>
      <Text style={styles.tipTitle} numberOfLines={1}>
        {tip.title}
      </Text>
      <Text style={styles.tipDescription} numberOfLines={2}>
        {tip.description}
      </Text>
    </Pressable>
  </Animated.View>
));

export default function HealthTips() {
  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={20} color={colors.primary} />
        <Text style={styles.title}>건강 관리 팁</Text>
      </View>
      <View style={styles.tipsGrid}>
        {HEALTH_TIPS.map((tip, index) => (
          <TipCard key={tip.id} tip={tip} index={index} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    ...typography.heading3,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tipsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  tipCardWrapper: {
    flex: 1,
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
    minHeight: 120,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    ...typography.body1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tipDescription: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
