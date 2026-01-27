/**
 * Hospital Detail Component - Perfect Spacing & UX
 * Naver-inspired with optimized spacing for best readability
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Hospital } from '@/hooks/useHospitals';
import { colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface HospitalDetailProps {
  hospital: Hospital;
  onBookPress?: () => void;
}

const TAB_ITEMS = [
  { id: 'home', label: '홈' },
  { id: 'services', label: '진료' },
  { id: 'facilities', label: '시설' },
  { id: 'about', label: '소개' },
];

export const HospitalDetail: React.FC<HospitalDetailProps> = ({
  hospital,
  onBookPress,
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${hospital.phone}`);
  };

  const handleGetDirections = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = Platform.select({
      ios: `maps://app?daddr=${hospital.latitude},${hospital.longitude}`,
      android: `geo:${hospital.latitude},${hospital.longitude}?q=${hospital.name}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${hospital.name}\n${hospital.address}\n${hospital.phone}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleTabPress = (tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  };

  const images = hospital.images && hospital.images.length > 0
    ? hospital.images
    : hospital.image
    ? [hospital.image]
    : [];

  const getPlaceholderColors = () => {
    if (hospital.has24Hour) return ['#667eea', '#764ba2'];
    if (hospital.hasEmergency) return ['#f093fb', '#f5576c'];
    return ['#4facfe', '#00f2fe'];
  };

  // Day mappings
  const DAY_MAPPING: { [key: string]: string } = {
    sunday: '일',
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
  };

  const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Get today's hours
  const getTodayHours = () => {
    if (!hospital.openingHours) return null;

    const todayIndex = new Date().getDay();
    const todayKey = DAY_KEYS[todayIndex]; // 'wednesday'
    const todayName = DAY_MAPPING[todayKey]; // '수'
    const todayHours = hospital.openingHours[todayKey];

    if (!todayHours) return null;

    const isString = typeof todayHours === 'string';
    if (isString) {
      return { dayName: todayName, hours: todayHours, isClosed: false };
    } else if (todayHours && typeof todayHours === 'object') {
      const isClosed = !todayHours.isOpen;
      const hoursText = !isClosed && todayHours.openTime && todayHours.closeTime
        ? `${todayHours.openTime} - ${todayHours.closeTime}`
        : '정보없음';
      return { dayName: todayName, hours: hoursText, isClosed };
    }
    return null;
  };

  const todayHoursInfo = getTodayHours();

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.tabContent}>
            {/* Address Row */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAddressExpanded(!addressExpanded);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={22} color={colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoValue} numberOfLines={addressExpanded ? undefined : 1}>
                  {hospital.address}
                </Text>
              </View>
              <Ionicons
                name={addressExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>

            {/* Distance Info */}
            {hospital.distance && (
              <View style={styles.infoRow}>
                <Ionicons name="walk-outline" size={22} color={colors.text.secondary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.distanceInfo}>
                    현위치에서 {hospital.distance < 1
                      ? `${(hospital.distance * 1000).toFixed(0)}m`
                      : `${hospital.distance.toFixed(1)}km`}
                  </Text>
                </View>
              </View>
            )}

            {/* Today Hours Row - Always Show */}
            {hospital.openingHours && (
              <>
                <TouchableOpacity
                  style={styles.infoRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setHoursExpanded(!hoursExpanded);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={22} color={colors.text.secondary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>
                      {todayHoursInfo
                        ? `오늘(${todayHoursInfo.dayName}요일) ${todayHoursInfo.isClosed ? '휴무' : todayHoursInfo.hours}`
                        : '운영시간 정보 없음'}
                    </Text>
                  </View>
                  <Ionicons
                    name={hoursExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>

                {/* Expanded All Hours */}
                {hoursExpanded && (
                  <View style={styles.expandedSection}>
                    {DAY_KEYS.map((dayKey) => {
                      const hours = hospital.openingHours[dayKey];
                      const dayNameKorean = DAY_MAPPING[dayKey];
                      const todayIndex = new Date().getDay();
                      const todayKey = DAY_KEYS[todayIndex];
                      const isToday = dayKey === todayKey;
                      const isString = typeof hours === 'string';

                      let timeDisplay = '정보없음';
                      let isClosed = false;

                      if (isString) {
                        timeDisplay = hours;
                      } else if (hours && typeof hours === 'object') {
                        isClosed = !hours.isOpen;
                        if (!isClosed && hours.openTime && hours.closeTime) {
                          timeDisplay = `${hours.openTime} - ${hours.closeTime}`;
                        }
                      }

                      return (
                        <View
                          key={dayKey}
                          style={[styles.expandedRow, isToday && styles.expandedTodayRow]}
                        >
                          <Text style={[styles.expandedDay, isToday && styles.expandedTodayText]}>
                            {dayNameKorean}요일
                          </Text>
                          <Text style={[styles.expandedTime, isToday && styles.expandedTodayText]}>
                            {isClosed ? '휴무' : timeDisplay}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {/* Phone Row */}
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={22} color={colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.phoneNumber}>{hospital.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('복사 완료', '전화번호가 복사되었습니다.');
                }}
              >
                <Text style={styles.copyText}>복사</Text>
              </TouchableOpacity>
            </View>

            {/* Services Preview */}
            {hospital.services && hospital.services.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="medical-outline" size={22} color={colors.text.secondary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>
                    {hospital.services.slice(0, 3).join(', ')}
                    {hospital.services.length > 3 ? '...' : ''}
                  </Text>
                </View>
              </View>
            )}

            {/* More Info Button */}
            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={() => handleTabPress('about')}
              activeOpacity={0.7}
            >
              <Text style={styles.moreInfoText}>정보 더보기</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        );

      case 'services':
        const getServiceIcon = (service: string) => {
          if (service.includes('예방')) return 'shield-checkmark';
          if (service.includes('수술')) return 'medkit';
          if (service.includes('치과')) return 'happy';
          if (service.includes('피부')) return 'heart';
          if (service.includes('안과')) return 'eye';
          if (service.includes('내과')) return 'fitness';
          return 'medical';
        };

        return (
          <View style={styles.tabContent}>
            {hospital.services && hospital.services.length > 0 ? (
              <View style={styles.servicesGrid}>
                {hospital.services.map((service, index) => (
                  <View key={index} style={styles.serviceCard}>
                    <View style={styles.serviceIconContainer}>
                      <Ionicons
                        name={getServiceIcon(service) as any}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.serviceCardText}>{service}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>진료과목 정보가 없습니다</Text>
              </View>
            )}
          </View>
        );

      case 'facilities':
        const facilities = [
          { key: 'has24Hour', icon: 'time', label: '24시간 운영', color: '#667eea', desc: '24시간 진료 가능' },
          { key: 'hasNightCare', icon: 'moon', label: '야간진료', color: '#764ba2', desc: '저녁 9시 이후 진료' },
          { key: 'hasParking', icon: 'car', label: '주차 가능', color: colors.teal, desc: '병원 전용 주차장' },
          { key: 'hasEmergency', icon: 'medical', label: '응급진료', color: colors.error, desc: '응급 상황 대응 가능' },
        ];

        const availableFacilities = facilities.filter(f => hospital[f.key as keyof Hospital]);

        return (
          <View style={styles.tabContent}>
            {availableFacilities.length > 0 ? (
              <View style={styles.facilitiesListContainer}>
                {availableFacilities.map((facility, index) => (
                  <View key={index} style={styles.facilityRow}>
                    <View style={[styles.facilityIconCircle, { backgroundColor: facility.color + '15' }]}>
                      <Ionicons name={facility.icon as any} size={24} color={facility.color} />
                    </View>
                    <View style={styles.facilityInfo}>
                      <Text style={styles.facilityTitle}>{facility.label}</Text>
                      <Text style={styles.facilityDesc}>{facility.desc}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={facility.color} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="information-circle-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>편의시설 정보가 없습니다</Text>
              </View>
            )}
          </View>
        );

      case 'about':
        return (
          <View style={styles.tabContent}>
            {hospital.description ? (
              <View style={styles.aboutContainer}>
                <View style={styles.aboutCard}>
                  <View style={styles.aboutHeader}>
                    <Ionicons name="document-text" size={20} color={colors.primary} />
                    <Text style={styles.aboutHeaderText}>병원 소개</Text>
                  </View>
                  <Text style={styles.aboutText}>{hospital.description}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>병원 소개가 없습니다</Text>
              </View>
            )}
          </View>
        );

      default:
        return <View style={styles.tabContent} />;
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[2]}
      scrollEventThrottle={16}
      bounces={true}
      bouncesZoom={false}
      decelerationRate="normal"
    >
      {/* Hero Images - Larger */}
      <View style={styles.heroContainer}>
        {images.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveImageIndex(index);
              }}
            >
              {images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {images.length > 1 && (
              <View style={styles.imageCount}>
                <Text style={styles.imageCountText}>
                  {activeImageIndex + 1}/{images.length}
                </Text>
              </View>
            )}
          </>
        ) : (
          <LinearGradient
            colors={getPlaceholderColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroPlaceholder}
          >
            <Ionicons name="business" size={64} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        )}

        {/* Share Button Only */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Hospital Header - Better Spacing */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <View style={styles.statusBadge}>
            {hospital.isOpen && <View style={styles.statusDot} />}
            <Text style={styles.statusText}>
              {hospital.isOpen ? '영업중' : '영업종료'}
            </Text>
          </View>
        </View>

        {hospital.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFB300" />
            <Text style={styles.ratingText}>{hospital.rating.toFixed(1)}</Text>
            <Text style={styles.ratingDivider}>·</Text>
            <Text style={styles.reviewText}>방문자 리뷰 {hospital.reviewCount || 0}</Text>
          </View>
        )}

        {/* Primary Action Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButtonPrimary}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, '#FF8FAB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTextPrimary}>전화하기</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaButtonSecondary}
            onPress={handleGetDirections}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaTextSecondary}>길찾기</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Action Buttons */}
        <View style={styles.compactActionsContainer}>
          <TouchableOpacity
            style={styles.compactActionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('저장', '병원을 저장하시겠습니까?');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.compactActionText}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.compactActionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.compactActionText}>공유</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Tabs - Horizontal Scroll */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TAB_ITEMS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Bottom Spacing - Reduced */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    position: 'relative',
    height: 240,
    backgroundColor: '#f5f5f5',
  },
  heroImage: {
    width,
    height: 240,
  },
  heroPlaceholder: {
    width,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F5F5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  ratingDivider: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginHorizontal: 4,
  },
  reviewText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  ctaButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  ctaButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  ctaTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  compactActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  compactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  compactActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
    minWidth: 60,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: colors.text.primary,
  },
  tabContent: {
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: 22,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: 22,
  },
  distanceInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  expandedSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  expandedTodayRow: {
    backgroundColor: '#FFF5F8',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  expandedDay: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  expandedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  expandedTodayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  moreInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  servicesGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  facilitiesListContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  facilityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityInfo: {
    flex: 1,
  },
  facilityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  facilityDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  aboutContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  aboutCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  aboutHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  aboutText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text.secondary,
    lineHeight: 24,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
});

export default HospitalDetail;
