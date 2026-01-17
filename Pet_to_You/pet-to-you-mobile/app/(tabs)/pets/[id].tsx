/**
 * Pet Profile Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Badge } from '@/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

export default function PetProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const mockPet = {
    name: '멍멍이',
    species: '강아지',
    breed: '골든 리트리버',
    age: '3세',
    weight: '28kg',
    lastCheckup: '2주 전',
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
      >
        <Text style={styles.petEmoji}>🐶</Text>
        <Text style={styles.petName}>{mockPet.name}</Text>
        <Text style={styles.petInfo}>{mockPet.breed} · {mockPet.age}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>기본 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>종</Text>
              <Text style={styles.value}>{mockPet.species}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>품종</Text>
              <Text style={styles.value}>{mockPet.breed}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>나이</Text>
              <Text style={styles.value}>{mockPet.age}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>체중</Text>
              <Text style={styles.value}>{mockPet.weight}</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>건강 기록</Text>
            <View style={styles.recordItem}>
              <Text style={styles.recordDate}>2024.01.05</Text>
              <Text style={styles.recordTitle}>정기 검진</Text>
              <Badge label="완료" variant="success" />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Button
            title="병원 예약하기"
            onPress={() => router.push('/(tabs)/hospitals')}
            fullWidth
          />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xl, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: borderRadius.xl, borderBottomRightRadius: borderRadius.xl },
  petEmoji: { fontSize: 80, marginBottom: spacing.md },
  petName: { ...typography.heading1, color: colors.background, marginBottom: spacing.xs },
  petInfo: { ...typography.body1, color: colors.background, opacity: 0.9 },
  content: { padding: spacing.lg },
  card: { marginBottom: spacing.lg, padding: spacing.md, ...shadows.small },
  cardTitle: { ...typography.heading3, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { ...typography.body1, color: colors.text.secondary },
  value: { ...typography.body1, color: colors.text.primary, fontWeight: '600' },
  recordItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recordDate: { ...typography.caption, color: colors.text.secondary },
  recordTitle: { ...typography.body1, flex: 1 },
});
