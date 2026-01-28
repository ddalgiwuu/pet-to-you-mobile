/**
 * Hospital Search Screen with List/Map Toggle
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList as FlashList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import {
  SearchBar,
  FilterSheet,
  FilterSheetRef,
  FilterGroup,
} from '@/components/shared';
import { HospitalListItem } from '@/components/hospital';
import { useHospitals } from '@/hooks/useHospitals';
import { useLocation } from '@/hooks/useLocation';
import { useFilterStore, selectHospitalFilters, selectSearchQuery, selectSortBy } from '@/store/filterStore';
import { getShortDistrict } from '@/services/geocoding';
import { colors } from '@/constants/theme';

const SORT_OPTIONS = [
  { id: 'distance', label: '거리순', icon: 'location' as const },
  { id: 'rating', label: '평점순', icon: 'star' as const },
  { id: 'name', label: '이름순', icon: 'text' as const },
];

export default function HospitalsScreen() {
  // Hooks
  const router = useRouter();

  // State
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [district, setDistrict] = useState<string>('위치 확인 중...');
  const filterSheetRef = useRef<FilterSheetRef>(null);

  // Hooks
  const { location, isLoading: isLoadingLocation, refreshLocation } = useLocation();

  // Store
  const hospitalFilters = useFilterStore(selectHospitalFilters);
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const sortBy = useFilterStore(selectSortBy);
  const setSortBy = useFilterStore((state) => state.setSortBy);
  const setHospitalFilters = useFilterStore((state) => state.setHospitalFilters);
  const resetHospitalFilters = useFilterStore((state) => state.resetHospitalFilters);

  // Query hospitals
  const {
    data: hospitals = [],
    isLoading,
    error,
    refetch,
  } = useHospitals({
    lat: location?.latitude,
    lng: location?.longitude,
    filters: hospitalFilters,
    searchQuery,
    sortBy,
    enabled: !!location,
  });


  // Get district name from GPS coordinates
  useEffect(() => {
    if (location) {
      getShortDistrict(location)
        .then((districtName) => setDistrict(districtName))
        .catch(() => setDistrict('위치 확인 실패'));
    }
  }, [location]);

  // Filter groups for FilterSheet
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        title: '서비스',
        multiSelect: true,
        options: [
          {
            id: '24hour',
            label: '24시간',
            icon: 'time',
            selected: hospitalFilters.has24Hour,
          },
          {
            id: 'night',
            label: '야간진료',
            icon: 'moon',
            selected: hospitalFilters.hasNightCare,
          },
          {
            id: 'parking',
            label: '주차가능',
            icon: 'car',
            selected: hospitalFilters.hasParking,
          },
          {
            id: 'emergency',
            label: '응급',
            icon: 'medical',
            selected: hospitalFilters.hasEmergency,
          },
        ],
      },
      {
        title: '영업 상태',
        multiSelect: false,
        options: [
          {
            id: 'all',
            label: '전체',
            selected: !hospitalFilters.openNow,
          },
          {
            id: 'open',
            label: '영업중만',
            icon: 'checkmark-circle',
            selected: hospitalFilters.openNow,
          },
        ],
      },
      {
        title: '최소 평점',
        multiSelect: false,
        options: [
          { id: '0', label: '전체', selected: hospitalFilters.rating === 0 },
          {
            id: '4',
            label: '4.0 이상',
            icon: 'star',
            selected: hospitalFilters.rating === 4,
          },
          {
            id: '4.5',
            label: '4.5 이상',
            icon: 'star',
            selected: hospitalFilters.rating === 4.5,
          },
        ],
      },
    ],
    [hospitalFilters]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (groupIndex: number, optionId: string) => {
      const group = filterGroups[groupIndex];
      
      if (groupIndex === 0) {
        // Services (multiSelect)
        const updates: any = {};
        switch (optionId) {
          case '24hour':
            updates.has24Hour = !hospitalFilters.has24Hour;
            break;
          case 'night':
            updates.hasNightCare = !hospitalFilters.hasNightCare;
            break;
          case 'parking':
            updates.hasParking = !hospitalFilters.hasParking;
            break;
          case 'emergency':
            updates.hasEmergency = !hospitalFilters.hasEmergency;
            break;
        }
        setHospitalFilters(updates);
      } else if (groupIndex === 1) {
        // Open Now
        setHospitalFilters({ openNow: optionId === 'open' });
      } else if (groupIndex === 2) {
        // Rating
        setHospitalFilters({ rating: parseFloat(optionId) });
      }
    },
    [filterGroups, hospitalFilters, setHospitalFilters]
  );


  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (hospitalFilters.has24Hour) count++;
    if (hospitalFilters.hasNightCare) count++;
    if (hospitalFilters.hasParking) count++;
    if (hospitalFilters.hasEmergency) count++;
    if (hospitalFilters.openNow) count++;
    if (hospitalFilters.rating > 0) count++;
    return count;
  }, [hospitalFilters]);

  // Render hospital list
  const renderContent = () => {
    if (isLoading || isLoadingLocation) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#42A5F5" />
          <Text style={styles.loadingText}>
            {isLoadingLocation ? '위치 확인 중...' : '병원 검색 중...'}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ccc" />
          <Text style={styles.errorText}>병원 목록을 불러올 수 없습니다</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hospitals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          <Text style={styles.emptySubtext}>
            다른 검색어나 필터를 시도해보세요
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        style={styles.listContainer}
        entering={FadeIn}
        exiting={FadeOut}
      >
        <FlashList
          data={hospitals}
          renderItem={({ item }) => (
            <HospitalListItem hospital={item} />
          )}
          estimatedItemSize={200}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#42A5F5"
            />
          }
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Location Permission Notice */}
      {!location && (
        <View style={styles.locationNotice}>
          <Ionicons name="location-outline" size={20} color="#FF6B9D" />
          <Text style={styles.locationNoticeText}>
            더 정확한 검색을 위해 위치 권한을 허용해주세요
          </Text>
          <Pressable onPress={refreshLocation} style={styles.locationNoticeButton}>
            <Text style={styles.locationNoticeButtonText}>권한 허용</Text>
          </Pressable>
        </View>
      )}

      {/* Header - Fixed */}
      <View style={styles.header}>
        <Text style={styles.title}>병원 찾기</Text>
        {location && (
          <View style={styles.locationDisplay}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.locationText}>{district}</Text>
          </View>
        )}
      </View>

      {/* Search & Filter Section - Fixed */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="병원 이름 검색"
          style={styles.searchBar}
        />

        {/* Filter & Sort Row */}
        <View style={styles.filterSortRow}>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              filterSheetRef.current?.expand();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.filterChipText}>필터</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSortSheet(!showSortSheet);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.filterChipText}>
              {SORT_OPTIONS.find(o => o.id === sortBy)?.label || '정렬'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Sort Sheet */}
        {showSortSheet && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.sortSheet}
          >
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy(option.id as any);
                  setShowSortSheet(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={sortBy === option.id ? colors.primary : '#666'}
                />
                <Text
                  style={[
                    styles.sortText,
                    sortBy === option.id && styles.sortTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      {/* Content */}
      {renderContent()}

      {/* Filter Bottom Sheet */}
      <FilterSheet
        ref={filterSheetRef}
        filters={filterGroups}
        onFilterChange={handleFilterChange}
        onReset={resetHospitalFilters}
        onApply={() => filterSheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF6B9D15',
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B9D30',
  },
  locationNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#FF6B9D',
    lineHeight: 18,
  },
  locationNoticeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
  },
  locationNoticeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    marginBottom: 12,
  },
  filterSortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterBadge: {
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  sortSheet: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    minWidth: 140,
  },
  sortText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  sortTextActive: {
    color: '#42A5F5',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
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
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#42A5F5',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
