/**
 * Hospital Search Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Input, Card, Badge } from '@/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

const FILTERS = ['전체', '24시간', '야간진료', '주차가능', '응급'];

const MOCK_HOSPITALS = [
  { id: '1', name: '펫케어 동물병원', distance: '0.5km', rating: 4.8, services: ['24시간', '응급'], isOpen: true },
  { id: '2', name: '행복한 동물병원', distance: '1.2km', rating: 4.5, services: ['주차가능'], isOpen: true },
  { id: '3', name: '우리동물병원', distance: '2.3km', rating: 4.7, services: ['야간진료'], isOpen: false },
];

export default function HospitalsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>병원 찾기</Text>
        <Input
          label="병원 이름 검색"
          value={search}
          onChangeText={setSearch}
          placeholder="병원 이름 검색"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list}>
        {MOCK_HOSPITALS.map((hospital, index) => (
          <Animated.View key={hospital.id} entering={FadeInDown.delay(index * 100)}>
            <Pressable onPress={() => router.push(`/booking/${hospital.id}`)}>
              <Card style={styles.hospitalCard}>
                <View style={styles.hospitalHeader}>
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    <Text style={styles.hospitalDistance}>{hospital.distance} · ⭐ {hospital.rating}</Text>
                  </View>
                  <Badge
                    label={hospital.isOpen ? '영업중' : '영업종료'}
                    variant={hospital.isOpen ? 'success' : 'neutral'}
                  />
                </View>
                <View style={styles.services}>
                  {hospital.services.map((service) => (
                    <Badge key={service} label={service} variant="secondary" />
                  ))}
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: 60 },
  title: { ...typography.heading1, marginBottom: spacing.md },
  filters: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.full },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { ...typography.body2, color: colors.text.primary },
  filterTextActive: { color: colors.background },
  list: { flex: 1, paddingHorizontal: spacing.lg },
  hospitalCard: { marginBottom: spacing.md, padding: spacing.md, ...shadows.small },
  hospitalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  hospitalInfo: { flex: 1 },
  hospitalName: { ...typography.heading3, marginBottom: spacing.xs },
  hospitalDistance: { ...typography.body2, color: colors.text.secondary },
  services: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
});
