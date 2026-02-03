/**
 * Hospital Dashboard Screen
 * Main dashboard for hospital staff
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useHospitalStatistics } from '@/hooks/useHospitalDashboard';

// TODO: Get from auth context
const MOCK_HOSPITAL_ID = 'hospital-123';

export default function HospitalDashboardScreen() {
  const router = useRouter();
  const { stats, loading, refresh } = useHospitalStatistics(MOCK_HOSPITAL_ID);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '병원 대시보드',
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.welcomeText}>병원 관리 시스템</Text>
          <Text style={styles.hospitalName}>24시 강남 동물병원</Text>
        </View>

        {/* Statistics Cards */}
        {loading && !stats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : stats ? (
          <View style={styles.statsGrid}>
            <StatCard
              icon="calendar"
              iconColor={theme.colors.info}
              label="오늘의 예약"
              value={`${stats.todayBookings}건`}
            />
            <StatCard
              icon="clipboard"
              iconColor={theme.colors.warning}
              label="진료 완료 대기"
              value={`${stats.completedPendingRecords}건`}
              onPress={() => router.push('/hospital/bookings')}
            />
            <StatCard
              icon="document-text"
              iconColor={theme.colors.purple}
              label="미정산 청구"
              value={`${stats.unsettledClaims}건`}
              onPress={() => router.push('/hospital/payments')}
            />
            <StatCard
              icon="cash"
              iconColor={theme.colors.success}
              label="이번 달 수익"
              value={`₩${(stats.thisMonthRevenue / 10000).toFixed(0)}만`}
            />
          </View>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 작업</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="clipboard"
              iconColor={theme.colors.primary}
              title="진료 기록 작성"
              description="완료된 예약 선택"
              onPress={() => router.push('/hospital/bookings')}
            />
            <ActionCard
              icon="list"
              iconColor={theme.colors.info}
              title="진료 기록 조회"
              description="작성한 기록 확인"
              onPress={() => router.push('/hospital/records')}
            />
            <ActionCard
              icon="document-text"
              iconColor={theme.colors.purple}
              title="청구 내역"
              description="보험 청구 현황"
              onPress={() => router.push('/hospital/claims')}
            />
            <ActionCard
              icon="cash"
              iconColor={theme.colors.success}
              title="정산 내역"
              description="정산 현황 확인"
              onPress={() => router.push('/hospital/payments')}
            />
            <ActionCard
              icon="people"
              iconColor="#9C27B0"
              title="수의사 관리"
              description="수의사 등록 및 일정 관리"
              onPress={() => router.push('/hospital/veterinarians')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityEmpty}>최근 활동이 없습니다</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// === Helper Components ===

interface StatCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  onPress?: () => void;
}

function StatCard({ icon, iconColor, label, value, onPress }: StatCardProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Component>
  );
}

interface ActionCardProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
}

function ActionCard({ icon, iconColor, title, description, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={28} color={iconColor} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray600,
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  activityEmpty: {
    fontSize: 14,
    color: theme.colors.gray500,
  },
  bottomSpacing: {
    height: 40,
  },
});
