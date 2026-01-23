/**
 * Hospital Detail Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { HospitalDetail, HospitalReviews } from '@/components/hospital';
import { useHospitalById, useHospitalReviews } from '@/hooks/useHospitals';

const TAB_OPTIONS = ['정보', '리뷰'] as const;
type TabType = typeof TAB_OPTIONS[number];

export default function HospitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('정보');
  const [reviewPage, setReviewPage] = useState(1);

  // Fetch hospital data
  const {
    data: hospital,
    isLoading: isLoadingHospital,
    error: hospitalError,
  } = useHospitalById(id);

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
  } = useHospitalReviews(id, reviewPage, 10, activeTab === '리뷰');

  const handleBookPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/booking/${id}`);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleLoadMoreReviews = () => {
    if (reviewsData?.hasMore && !isLoadingReviews) {
      setReviewPage((prev) => prev + 1);
    }
  };

  if (isLoadingHospital) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42A5F5" />
        <Text style={styles.loadingText}>병원 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (hospitalError || !hospital) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ccc" />
        <Text style={styles.errorText}>병원 정보를 불러올 수 없습니다</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        {/* Back Button (Floating) */}
        <TouchableOpacity
          style={styles.floatingBackButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Favorite Button (Floating) */}
        <TouchableOpacity
          style={styles.floatingFavoriteButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // TODO: Implement favorite functionality
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-outline" size={24} color="#333" />
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TAB_OPTIONS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <Animated.View
          key={activeTab}
          entering={FadeIn.duration(200)}
          style={styles.tabContent}
        >
          {activeTab === '정보' ? (
            <HospitalDetail
              hospital={hospital}
              onBookPress={handleBookPress}
            />
          ) : (
            <HospitalReviews
              reviews={reviewsData?.reviews || []}
              total={reviewsData?.total || 0}
              isLoading={isLoadingReviews}
              hasMore={reviewsData?.hasMore}
              onLoadMore={handleLoadMoreReviews}
            />
          )}
        </Animated.View>

        {/* Fixed Bottom Button */}
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookPress}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>예약하기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#42A5F5',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  floatingFavoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: Platform.OS === 'ios' ? 120 : 80,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#333',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#42A5F5',
  },
  tabContent: {
    flex: 1,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
