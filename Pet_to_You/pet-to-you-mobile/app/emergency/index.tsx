/**
 * Emergency Screen
 * 24-hour emergency consultation and nearby emergency hospitals
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useHospitals } from '@/hooks/useHospitals';
import { useLocation } from '@/hooks/useLocation';

// Emergency hotline number
const EMERGENCY_HOTLINE = '1588-1234';

export default function EmergencyScreen() {
  const router = useRouter();
  const { location } = useLocation();

  // Get 24-hour hospitals nearby
  const { data: hospitals = [] } = useHospitals({
    lat: location?.latitude,
    lng: location?.longitude,
    filters: { openNow: true },
    enabled: true,
  });

  // Filter for 24-hour hospitals
  const emergencyHospitals = hospitals
    .filter((h: any) => h.is24Hours || h.has24Hour || h.specialties?.includes('24시간'))
    .slice(0, 5);

  const handleCall = (phoneNumber: string) => {
    Alert.alert(
      '전화 연결',
      `${phoneNumber}로 전화를 걸까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전화하기',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber.replace(/-/g, '')}`);
          },
        },
      ]
    );
  };

  const handleNavigate = (lat: number, lng: number, name: string) => {
    Alert.alert(
      '길찾기',
      `${name}까지 길찾기를 시작할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '카카오맵',
          onPress: () => {
            Linking.openURL(`kakaomap://route?ep=${lat},${lng}&by=CAR`);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
          },
        },
      ]
    );
  };

  const handleHospitalPress = (id: string) => {
    router.push(`/hospital/${id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>응급 상황</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emergency Banner */}
        <LinearGradient
          colors={['#FF6B6B', '#FF4757']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emergencyBanner}
        >
          <Ionicons name="warning" size={32} color={colors.background} />
          <Text style={styles.bannerTitle}>응급 상황이신가요?</Text>
          <Text style={styles.bannerSubtitle}>
            24시간 상담 전화로 즉시 연락하세요
          </Text>
          <Pressable
            onPress={() => handleCall(EMERGENCY_HOTLINE)}
            style={styles.callButton}
          >
            <Ionicons name="call" size={20} color="#FF6B6B" />
            <Text style={styles.callButtonText}>{EMERGENCY_HOTLINE}</Text>
          </Pressable>
        </LinearGradient>

        {/* Nearby Emergency Hospitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가까운 24시간 병원</Text>

          {emergencyHospitals.length > 0 ? (
            <View style={styles.hospitalList}>
              {emergencyHospitals.map((hospital: any, index: number) => (
                <Pressable
                  key={hospital.id}
                  onPress={() => handleHospitalPress(hospital.id)}
                  style={[
                    styles.hospitalCard,
                    index === emergencyHospitals.length - 1 && styles.hospitalCardLast,
                  ]}
                >
                  <View style={styles.hospitalTop}>
                    <View style={styles.hospitalLeft}>
                      <View style={styles.hospitalIconContainer}>
                        <Ionicons name="medical" size={24} color={colors.primary} />
                      </View>
                      <View style={styles.hospitalInfo}>
                        <View style={styles.hospitalTitleRow}>
                          <Text style={styles.hospitalName} numberOfLines={1}>
                            {hospital.name}
                          </Text>
                          <View style={styles.openBadge}>
                            <View style={styles.openDot} />
                            <Text style={styles.openText}>영업중</Text>
                          </View>
                        </View>
                        {hospital.distance && (
                          <Text style={styles.hospitalDistance}>
                            <Ionicons name="location" size={12} color={colors.text.tertiary} />{' '}
                            {hospital.distance}
                          </Text>
                        )}
                        {hospital.address && (
                          <Text style={styles.hospitalAddress} numberOfLines={1}>
                            {hospital.address}
                          </Text>
                        )}
                        {hospital.specialties && hospital.specialties.length > 0 && (
                          <View style={styles.specialtyContainer}>
                            {hospital.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                              <View key={idx} style={styles.specialtyTag}>
                                <Text style={styles.specialtyText}>{specialty}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.hospitalActions}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCall(hospital.phone);
                      }}
                      style={styles.actionButton}
                    >
                      <Ionicons name="call-outline" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>전화</Text>
                    </Pressable>
                    <View style={styles.actionDivider} />
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleNavigate(hospital.latitude, hospital.longitude, hospital.name);
                      }}
                      style={styles.actionButton}
                    >
                      <Ionicons name="navigate-outline" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>길찾기</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="location-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>주변에 24시간 병원을 찾을 수 없습니다</Text>
              <Text style={styles.emptySubtext}>위치 권한을 확인하거나 지역을 변경해보세요</Text>
            </View>
          )}
        </View>

        {/* Emergency Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>응급처치 가이드</Text>
          <View style={styles.guideCard}>
            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <Text style={styles.guideNumberText}>1</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>침착하게 상황 파악</Text>
                <Text style={styles.guideText}>
                  반려동물의 증상과 상태를 차분히 관찰하세요
                </Text>
              </View>
            </View>

            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <Text style={styles.guideNumberText}>2</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>병원에 먼저 연락</Text>
                <Text style={styles.guideText}>
                  이동하기 전 병원에 전화하여 상황을 설명하세요
                </Text>
              </View>
            </View>

            <View style={styles.guideItem}>
              <View style={styles.guideNumber}>
                <Text style={styles.guideNumberText}>3</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>안전하게 이동</Text>
                <Text style={styles.guideText}>
                  반려동물을 안정시키고 안전하게 이동하세요
                </Text>
              </View>
            </View>

            <View style={[styles.guideItem, styles.guideItemLast]}>
              <View style={styles.guideNumber}>
                <Text style={styles.guideNumberText}>4</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>증상과 이력 준비</Text>
                <Text style={styles.guideText}>
                  최근 증상과 예방접종 이력을 준비하세요
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Warning Notice */}
        <View style={styles.section}>
          <View style={styles.warningCard}>
            <Ionicons name="alert-circle" size={20} color="#FFE66D" />
            <Text style={styles.warningText}>
              심각한 응급 상황의 경우 119에 연락하여 동물병원 이송을 요청할 수 있습니다
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading2,
    fontSize: 18,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  emergencyBanner: {
    margin: 16,
    padding: 24,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: 8,
    ...shadows.medium,
  },
  bannerTitle: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.background,
    textAlign: 'center',
  },
  bannerSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    ...shadows.small,
  },
  callButtonText: {
    ...typography.heading3,
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  hospitalList: {
    gap: 12,
  },
  hospitalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 12,
    ...shadows.small,
  },
  hospitalCardLast: {
    marginBottom: 0,
  },
  hospitalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hospitalLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  hospitalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalInfo: {
    flex: 1,
    gap: 4,
  },
  hospitalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  hospitalName: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#4ECDC420',
    borderRadius: borderRadius.full,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ECDC4',
  },
  openText: {
    ...typography.caption,
    fontSize: 11,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  hospitalDistance: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  hospitalAddress: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.secondary,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  specialtyTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.sm,
  },
  specialtyText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  hospitalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  actionDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  actionText: {
    ...typography.body2,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  emptyText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 16,
    ...shadows.small,
  },
  guideItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  guideItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  guideNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideNumberText: {
    ...typography.body1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  guideContent: {
    flex: 1,
    gap: 4,
  },
  guideTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  guideText: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFE66D20',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FFE66D50',
  },
  warningText: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
