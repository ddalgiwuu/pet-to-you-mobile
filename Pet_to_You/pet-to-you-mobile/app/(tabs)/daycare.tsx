import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList as FlashList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ListMapToggle, SearchBar, KakaoMapView, ViewMode, MapMarker, LocationCard } from '@/components/shared';
import { useDaycares } from '@/hooks/useDaycare';
import { useLocation } from '@/hooks/useLocation';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useFilterStore } from '@/store/filterStore';
import config from '@/constants/config';

export default function DaycareScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { location } = useLocation();
  const { markers: mapMarkers, center, setCenter, addMarkers, clearMarkers, setMapReady } = useKakaoMap();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);

  const { data: daycares = [], isLoading, refetch } = useDaycares({
    lat: location?.latitude,
    lng: location?.longitude,
    searchQuery,
    enabled: !!location,
  });

  useEffect(() => {
    if (daycares.length > 0) {
      const markers: MapMarker[] = daycares.map((dc) => ({
        id: dc.id,
        lat: dc.latitude,
        lng: dc.longitude,
        title: dc.name,
        type: 'daycare',
        extra: dc,
      }));
      clearMarkers();
      addMarkers(markers);
    }
  }, [daycares]);

  useEffect(() => {
    if (location && !center) setCenter({ lat: location.latitude, lng: location.longitude, level: 3 });
  }, [location, center]);

  // Open Kakao Maps app with daycare search
  const handleFullscreenMap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const lat = location?.latitude || 37.5665;
    const lng = location?.longitude || 126.9780;

    // Kakao Maps app URL scheme
    const kakaoMapUrl = `kakaomap://look?p=${lat},${lng}`;
    const kakaoWebUrl = `https://map.kakao.com/?q=애견유치원&lat=${lat}&lng=${lng}`;

    Alert.alert(
      '지도 보기',
      '카카오맵에서 주변 유치원을 확인하시겠습니까?',
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

  const renderContent = () => {
    if (viewMode === 'map') {
      return (
        <Animated.View style={styles.mapContainer} entering={FadeIn} exiting={FadeOut}>
          <KakaoMapView markers={mapMarkers} center={center} onMapReady={() => setMapReady(true)} kakaoAppKey={config.kakaoMapsAppKey} />
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

    if (isLoading) {
      return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#66BB6A" /></View>;
    }

    return (
      <FlashList
        data={daycares}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/daycare/${item.id}`)}>
            <LocationCard
              data={{
                id: item.id,
                name: item.name,
                image: item.image,
                rating: item.rating,
                reviewCount: item.reviewCount,
                address: item.address,
                distance: item.distance,
                services: item.services,
                price: item.priceRange ? `${item.priceRange.min.toLocaleString()}원~` : undefined,
              }}
              variant="daycare"
            />
          </TouchableOpacity>
        )}
        estimatedItemSize={200}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#66BB6A" />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>유치원</Text>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="유치원 이름 검색" style={styles.searchBar} />
        <ListMapToggle mode={viewMode} onModeChange={setViewMode} />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 16 },
  searchBar: { marginBottom: 12 },
  listContent: { padding: 20 },
  mapContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullscreenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#66BB6A',
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
