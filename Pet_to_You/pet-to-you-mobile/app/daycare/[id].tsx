import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDaycareById } from '@/hooks/useDaycare';

const { width } = Dimensions.get('window');

export default function DaycareDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: daycare, isLoading } = useDaycareById(id);

  if (isLoading || !daycare) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#66BB6A" /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        <ScrollView>
          {daycare.image && <Image source={{ uri: daycare.image }} style={styles.heroImage} />}
          
          <View style={styles.content}>
            <Text style={styles.name}>{daycare.name}</Text>
            {daycare.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#FFB300" />
                <Text style={styles.rating}>{daycare.rating.toFixed(1)}</Text>
                {daycare.reviewCount && <Text style={styles.reviewCount}>({daycare.reviewCount})</Text>}
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color="#666" />
              <Text style={styles.infoText}>{daycare.address}</Text>
            </View>
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${daycare.phone}`)}>
              <Ionicons name="call" size={18} color="#666" />
              <Text style={styles.infoText}>{daycare.phone}</Text>
            </TouchableOpacity>

            {daycare.services && daycare.services.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>제공 서비스</Text>
                <View style={styles.servicesGrid}>
                  {daycare.services.map((service, index) => (
                    <View key={index} style={styles.serviceChip}>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {daycare.priceRange && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>가격</Text>
                <Text style={styles.priceText}>
                  {daycare.priceRange.min.toLocaleString()}원 ~ {daycare.priceRange.max.toLocaleString()}원
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity style={styles.reserveButton} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.push(`/daycare/reserve?daycareId=${id}`); }}>
            <Text style={styles.reserveButtonText}>예약하기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 100, elevation: 4 },
  heroImage: { width, height: 280 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  rating: { fontSize: 16, fontWeight: '600', color: '#333' },
  reviewCount: { fontSize: 14, color: '#999' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoText: { flex: 1, fontSize: 15, color: '#666' },
  section: { marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#E8F5E9', borderRadius: 16 },
  serviceText: { fontSize: 14, fontWeight: '500', color: '#66BB6A' },
  priceText: { fontSize: 17, fontWeight: '600', color: '#333' },
  footer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingHorizontal: 20, paddingTop: 12 },
  reserveButton: { backgroundColor: '#66BB6A', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  reserveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
