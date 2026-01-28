/**
 * Daycare Screen - Same UI as Hospitals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SearchBar, FullscreenMapModal } from '@/components/shared';
import { useDaycares } from '@/hooks/useDaycare';
import { useLocation } from '@/hooks/useLocation';
import { useFilterStore } from '@/store/filterStore';
import { getShortDistrict } from '@/services/geocoding';
import { colors } from '@/constants/theme';

const SORT_OPTIONS = [
  { id: 'distance', label: '거리순', icon: 'location' as const },
  { id: 'rating', label: '평점순', icon: 'star' as const },
  { id: 'name', label: '이름순', icon: 'text' as const },
];

export default function DaycareScreen() {
  const router = useRouter();
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [district, setDistrict] = useState<string>('위치 확인 중...');
  const [sortBy, setSortBy] = useState('distance');

  const { location, isLoading: isLoadingLocation, refreshLocation } = useLocation();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);

  const { data: daycares = [], isLoading, error, refetch } = useDaycares({
    lat: location?.latitude,
    lng: location?.longitude,
    searchQuery,
    enabled: !!location,
  });

  useEffect(() => {
    if (location) {
      getShortDistrict(location)
        .then((districtName) => setDistrict(districtName))
        .catch(() => setDistrict('위치 확인 실패'));
    }
  }, [location]);

  const renderDaycareItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.daycareCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/daycare/${item.id}` as any);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.daycareNamestyles} numberOfLines={1}>{item.name}</Text>
        {item.isOpen && (
          <View style={styles.openBadge}>
            <View style={styles.openDot} />
            <Text style={styles.openText}>영업중</Text>
          </View>
        )}
      </View>

      {item.rating > 0 && (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB300" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          {item.reviewCount > 0 && (
            <Text style={styles.reviewText}>({item.reviewCount})</Text>
          )}
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
        <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
      </View>

      {item.distance && (
        <View style={styles.distanceRow}>
          <Ionicons name="walk-outline" size={14} color={colors.primary} />
          <Text style={styles.distanceText}>
            {item.distance < 1
              ? `${(item.distance * 1000).toFixed(0)}m`
              : `${item.distance.toFixed(1)}km`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading || isLoadingLocation) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isLoadingLocation ? '위치 확인 중...' : '유치원 검색 중...'}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ccc" />
          <Text style={styles.errorText}>유치원 목록을 불러올 수 없습니다</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (daycares.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={daycares}
        renderItem={renderDaycareItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

      <View style={styles.header}>
        <Text style={styles.title}>유치원 찾기</Text>
        {location && (
          <TouchableOpacity
            style={styles.locationDisplay}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMapModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.locationText}>{district}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="유치원 이름 검색"
          style={styles.searchBar}
        />

        <View style={styles.filterSortRow}>
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

        {showSortSheet && (
          <View style={styles.sortSheet}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy(option.id);
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
          </View>
        )}
      </View>

      {renderContent()}

      {location && (
        <FullscreenMapModal
          visible={mapModalVisible}
          onClose={() => setMapModalVisible(false)}
          latitude={location.latitude}
          longitude={location.longitude}
          markers={daycares.map(d => ({
            id: d.id,
            name: d.name,
            lat: d.latitude,
            lng: d.longitude,
          }))}
        />
      )}
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 14,
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
  sortSheet: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  daycareCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  daycareNamestyles: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 12,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  openText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  reviewText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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
    backgroundColor: colors.primary,
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
    color: '#999',
  },
});
