/**
 * Home Screen with hero section and service cards
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const SERVICES = [
  { id: 1, title: '병원 찾기', icon: '🏥', color: '#FF6B9D' },
  { id: 2, title: '예약 관리', icon: '📅', color: '#4ECDC4' },
  { id: 3, title: '건강 기록', icon: '📋', color: '#FFE66D' },
  { id: 4, title: '응급 상황', icon: '🚨', color: '#FF6B6B' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={styles.greeting}>안녕하세요, {user?.name || '반가워요'}님!</Text>
          <Text style={styles.heroTitle}>오늘도 우리 아이와{'\n'}행복한 하루 되세요</Text>
        </Animated.View>

        {/* 3D Pet Placeholder */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.petContainer}>
          <Text style={styles.petPlaceholder}>🐶</Text>
        </Animated.View>
      </LinearGradient>

      {/* Welcome Card */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <Card style={styles.welcomeCard}>
          <Text style={styles.cardTitle}>우리 아이 건강 체크</Text>
          <Text style={styles.cardSubtitle}>마지막 병원 방문: 2주 전</Text>
          <Button title="자세히 보기" onPress={() => {}} size="small" />
        </Card>
      </Animated.View>

      {/* Service Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>서비스</Text>
        <View style={styles.serviceGrid}>
          {SERVICES.map((service, index) => (
            <Animated.View
              key={service.id}
              entering={FadeInDown.delay(400 + index * 100)}
            >
              <Pressable
                onPress={() => service.id === 1 && router.push('/(tabs)/hospitals')}
                style={styles.serviceCard}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  <Text style={styles.serviceEmoji}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Nearby Hospitals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>가까운 병원</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item, index) => (
            <Animated.View key={item} entering={FadeInDown.delay(700 + index * 100)}>
              <Card style={styles.hospitalCard}>
                <Text style={styles.hospitalName}>동물병원 #{item}</Text>
                <Text style={styles.hospitalDistance}>0.5km</Text>
              </Card>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xl, borderBottomLeftRadius: borderRadius.xl, borderBottomRightRadius: borderRadius.xl },
  greeting: { ...typography.body1, color: colors.background, opacity: 0.9, marginBottom: spacing.sm },
  heroTitle: { ...typography.heading1, color: colors.background, marginBottom: spacing.lg },
  petContainer: { alignItems: 'center', marginTop: spacing.lg },
  petPlaceholder: { fontSize: 80 },
  section: { padding: spacing.lg },
  sectionTitle: { ...typography.heading2, color: colors.text.primary, marginBottom: spacing.md },
  welcomeCard: { padding: spacing.lg, ...shadows.medium },
  cardTitle: { ...typography.heading3, color: colors.text.primary, marginBottom: spacing.sm },
  cardSubtitle: { ...typography.body2, color: colors.text.secondary, marginBottom: spacing.md },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  serviceCard: { width: '47%', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md },
  serviceIcon: { width: 60, height: 60, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  serviceEmoji: { fontSize: 30 },
  serviceTitle: { ...typography.body2, color: colors.text.primary, textAlign: 'center' },
  hospitalCard: { width: 200, padding: spacing.md, marginRight: spacing.md },
  hospitalName: { ...typography.body1, fontWeight: '600', color: colors.text.primary },
  hospitalDistance: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
});
