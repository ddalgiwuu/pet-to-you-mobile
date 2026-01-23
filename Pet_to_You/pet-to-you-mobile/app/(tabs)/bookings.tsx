import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';

const TABS = ['예정', '완료', '취소'] as const;
type TabType = typeof TABS[number];

const STATUS_MAP: Record<TabType, 'upcoming' | 'completed' | 'cancelled'> = {
  '예정': 'upcoming',
  '완료': 'completed',
  '취소': 'cancelled',
};

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('예정');
  const status = STATUS_MAP[activeTab];
  const { data: bookings = [], isLoading, refetch } = useBookings(status);
  const { mutate: cancelBooking } = useCancelBooking();

  const handleCancel = (bookingId: string) => {
    Alert.alert('예약 취소', '정말 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      {
        text: '예',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          cancelBooking(bookingId);
        },
      },
    ]);
  };

  const renderBooking = (booking: any) => {
    const bookingDate = format(new Date(`${booking.date}T${booking.time}`), 'yyyy.MM.dd (EEE) HH:mm', { locale: ko });
    
    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.hospitalName}>{booking.hospitalName}</Text>
          <View style={[styles.statusBadge, activeTab === '예정' && styles.statusUpcoming, activeTab === '완료' && styles.statusCompleted, activeTab === '취소' && styles.statusCancelled]}>
            <Text style={styles.statusText}>{activeTab}</Text>
          </View>
        </View>

        <View style={styles.bookingInfo}>
          <Ionicons name="paw" size={16} color="#666" />
          <Text style={styles.bookingInfoText}>{booking.petName}</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.bookingInfoText}>{bookingDate}</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.bookingInfoText}>{booking.hospitalAddress}</Text>
        </View>

        {activeTab === '예정' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(booking.id)}>
              <Text style={styles.cancelButtonText}>취소하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>예약 관리</Text>
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#42A5F5" /></View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{activeTab} 예약이 없습니다</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {bookings.map(renderBooking)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 20 },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', position: 'relative' },
  tabText: { fontSize: 16, fontWeight: '500', color: '#999' },
  tabTextActive: { fontWeight: '700', color: '#333' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#42A5F5' },
  content: { flex: 1, padding: 20 },
  bookingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  hospitalName: { flex: 1, fontSize: 18, fontWeight: '700', color: '#333' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusUpcoming: { backgroundColor: '#E3F2FD' },
  statusCompleted: { backgroundColor: '#E8F5E9' },
  statusCancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },
  bookingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bookingInfoText: { fontSize: 15, color: '#666' },
  bookingActions: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  cancelButton: { paddingVertical: 12, alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8 },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: '#FF5252' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#999' },
});
