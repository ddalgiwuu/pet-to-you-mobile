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

import {
  ListMapToggle,
  SearchBar,
  FilterSheet,
  FilterSheetRef,
  KakaoMapView,
  ViewMode,
  MapMarker,
  FilterGroup,
} from '@/components/shared';
import { HospitalListItem } from '@/components/hospital';
import { useHospitals } from '@/hooks/useHospitals';
import { useLocation } from '@/hooks/useLocation';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useFilterStore, selectHospitalFilters, selectSearchQuery, selectSortBy } from '@/store/filterStore';
import config from '@/constants/config';

const SORT_OPTIONS = [
  { id: 'distance', label: '거리순', icon: 'location' as const },
  { id: 'rating', label: '평점순', icon: 'star' as const },
  { id: 'name', label: '이름순', icon: 'text' as const },
];

export default function HospitalsScreen() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const filterSheetRef = useRef<FilterSheetRef>(null);

  // Hooks
  const { location, isLoading: isLoadingLocation, refreshLocation } = useLocation();
  const {
    markers: mapMarkers,
    center,
    setCenter,
    addMarkers,
    clearMarkers,
    setMapReady,
  } = useKakaoMap();

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

  // Convert hospitals to map markers
  useEffect(() => {
    if (hospitals.length > 0) {
      const markers: MapMarker[] = hospitals.map((hospital) => ({
        id: hospital.id,
        lat: hospital.latitude,
        lng: hospital.longitude,
        title: hospital.name,
        type: 'hospital',
        extra: hospital,
      }));
      
      clearMarkers();
      addMarkers(markers);
    }
  }, [hospitals]);

  // Set initial map center when location is available
  useEffect(() => {
    if (location && !center) {
      setCenter({
        lat: location.latitude,
        lng: location.longitude,
        level: 3,
      });
    }
  }, [location, center, setCenter]);

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

  // Handle marker press in map
  const handleMarkerPress = useCallback((marker: MapMarker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Can show bottom sheet with hospital info or navigate to detail
  }, []);

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

  // Open Kakao Maps app with hospital markers
  const handleFullscreenMap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const lat = location?.latitude || 37.5665;
    const lng = location?.longitude || 126.9780;

    // Kakao Maps app URL scheme
    const kakaoMapUrl = `kakaomap://look?p=${lat},${lng}`;
    const kakaoWebUrl = `https://map.kakao.com/?q=동물병원&lat=${lat}&lng=${lng}`;

    Alert.alert(
      '지도 보기',
      '카카오맵에서 주변 병원을 확인하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '카카오맵 열기',
          onPress: async () => {
            const supported = await Linking.canOpenURL(kakaoMapUrl);
            if (supported) {
              await Linking.openURL(kakaoMapUrl);
            } else {
              // Fallback to web version
              await Linking.openURL(kakaoWebUrl);
            }
          },
        },
      ]
    );
  }, [location]);

  // Render content based on view mode
  const renderContent = () => {
    if (viewMode === 'map') {
      return (
        <Animated.View
          style={styles.mapContainer}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <KakaoMapView
            markers={mapMarkers}
            center={center}
            onMarkerPress={handleMarkerPress}
            onMapReady={() => setMapReady(true)}
            kakaoAppKey={config.kakaoMapsAppKey}
            style={styles.map}
          />
          {/* Fullscreen Map Button */}
          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={handleFullscreenMap}
            activeOpacity={0.8}
          >
            <Ionicons name="expand" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      );
    }

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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>병원 찾기</Text>
        
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="병원 이름 검색"
          style={styles.searchBar}
        />

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          <ListMapToggle mode={viewMode} onModeChange={setViewMode} />

          <View style={styles.rightControls}>
            {/* Filter Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                filterSheetRef.current?.expand();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="options" size={20} color="#333" />
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sort Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSortSheet(!showSortSheet);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort Options */}
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
                  color={sortBy === option.id ? '#42A5F5' : '#666'}
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
                  <Ionicons name="checkmark" size={18} color="#42A5F5" />
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  fullscreenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#42A5F5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
