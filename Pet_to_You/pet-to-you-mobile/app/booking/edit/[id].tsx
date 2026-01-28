/**
 * Edit Booking Screen
 * Allows changing date and time for existing booking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { DateTimePicker } from '@/components/booking';
import { colors, typography, spacing } from '@/constants/theme';

export default function EditBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Mock booking data (replace with actual API call)
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  // Load booking data
  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockBooking = {
        id,
        hospitalName: '24시 행복 동물병원',
        hospitalAddress: '서울시 강남구 역삼동 123-45',
        petName: '멍멍이',
        date: '2026-01-25',
        time: '14:00',
        serviceType: '일반진료',
        symptoms: '정기 검진',
      };
      setBooking(mockBooking);
      setSelectedDate(new Date(mockBooking.date));
      setSelectedTime(mockBooking.time);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleSave = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('알림', '날짜와 시간을 선택해주세요');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // TODO: API call to update booking
    Alert.alert(
      '예약 수정 완료',
      '예약이 성공적으로 수정되었습니다.',
      [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>예약 정보 불러오는 중...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ccc" />
        <Text style={styles.errorText}>예약 정보를 불러올 수 없습니다</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
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

      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>예약 수정</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Hospital Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="medical" size={20} color={colors.primary} />
              <Text style={styles.infoHeaderText}>병원 정보</Text>
            </View>
            <Text style={styles.hospitalName}>{booking.hospitalName}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>{booking.hospitalAddress}</Text>
            </View>
          </View>

          {/* Pet Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="paw" size={20} color={colors.primary} />
              <Text style={styles.infoHeaderText}>반려동물</Text>
            </View>
            <Text style={styles.petName}>{booking.petName}</Text>
            <Text style={styles.serviceType}>{booking.serviceType}</Text>
          </View>

          {/* Current Booking Info */}
          <View style={styles.currentBookingCard}>
            <Text style={styles.currentBookingLabel}>현재 예약 시간</Text>
            <View style={styles.currentBookingInfo}>
              <Ionicons name="calendar" size={18} color={colors.text.secondary} />
              <Text style={styles.currentBookingText}>
                {format(new Date(`${booking.date}T${booking.time}`), 'yyyy년 MM월 dd일 (EEE) HH:mm', { locale: ko })}
              </Text>
            </View>
          </View>

          {/* Date Time Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.sectionTitle}>새로운 날짜 및 시간 선택</Text>
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              hospitalId={booking.hospitalId || ''}
            />
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, '#FF8FAB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveBtnGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>수정 완료</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  currentBookingCard: {
    backgroundColor: '#FFF5F8',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  currentBookingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  currentBookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentBookingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  pickerSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
