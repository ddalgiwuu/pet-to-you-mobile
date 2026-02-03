import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAvailableSlots } from '@/hooks/useHospitals';
import { MOCK_TIME_SLOTS, MOCK_VETERINARIANS } from '@/constants/mockData';
import { VeterinarianSelector } from '@/components/veterinarian/VeterinarianSelector';

interface DateTimePickerProps {
  hospitalId: string;
  selectedDate?: Date;
  selectedTime?: string;
  selectedVetId?: string;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  onSelectVet?: (vetId?: string) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  hospitalId,
  selectedDate,
  selectedTime,
  selectedVetId,
  onSelectDate,
  onSelectTime,
  onSelectVet,
}) => {
  // Generate next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  }, []);

  // Auto-select today on mount if no date is selected
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      onSelectDate(availableDates[0]);
    }
  }, []);

  // Fetch available time slots for selected date
  const formattedDate = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : '';

  const { data: apiTimeSlots = [], isLoading: isLoadingSlots, error } = useAvailableSlots(
    hospitalId,
    formattedDate,
    !!selectedDate
  );

  // Use mock data if API fails or returns empty
  let timeSlots = apiTimeSlots.length > 0 ? apiTimeSlots : MOCK_TIME_SLOTS;

  // Filter by selected veterinarian if specified
  if (selectedVetId) {
    timeSlots = timeSlots.filter(
      (slot) => slot.veterinarianId === selectedVetId
    );
  }

  // Get veterinarians for this hospital (mock data)
  const veterinarians = MOCK_VETERINARIANS.filter(
    (vet) => vet.hospitalId === hospitalId
  );
  const hasVeterinarians = veterinarians.length > 0;

  const handleDatePress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(date);
  };

  const handleTimePress = (time: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTime(time);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>날짜 선택</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesScroll}
        >
          {availableDates.map((date, index) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const dayOfWeek = format(date, 'EEE', { locale: ko });
            const dayOfMonth = format(date, 'd');
            const isToday = isSameDay(date, new Date());

            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50)}
              >
                <TouchableOpacity
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                    isToday && styles.dateCardToday,
                  ]}
                  onPress={() => handleDatePress(date)}
                  activeOpacity={0.8}
                >
                  {isToday && (
                    <View style={[styles.todayBadge, isSelected && styles.todayBadgeSelected]}>
                      <Text style={[styles.todayText, isSelected && styles.todayTextSelected]}>오늘</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.dayOfWeek,
                      isSelected && styles.dateTextSelected,
                      isToday && !isSelected && styles.todayDayText,
                    ]}
                  >
                    {dayOfWeek}
                  </Text>
                  <Text
                    style={[
                      styles.dayOfMonth,
                      isSelected && styles.dateTextSelected,
                      isToday && !isSelected && styles.todayDayText,
                    ]}
                  >
                    {dayOfMonth}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>

      {/* Veterinarian Selection */}
      {hasVeterinarians && selectedDate && onSelectVet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수의사 선택 (선택사항)</Text>
          <VeterinarianSelector
            veterinarians={veterinarians}
            selectedVetId={selectedVetId}
            onSelectVet={onSelectVet}
            showAnyOption={true}
          />
        </View>
      )}

      {/* Time Selection */}
      {selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시간 선택</Text>

          {isLoadingSlots ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#42A5F5" />
              <Text style={styles.loadingText}>
                예약 가능한 시간 확인 중...
              </Text>
            </View>
          ) : (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.available;

                return (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 40)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.timeSlot,
                        !isAvailable && styles.timeSlotDisabled,
                        isSelected && styles.timeSlotSelected,
                      ]}
                      onPress={() =>
                        isAvailable && handleTimePress(slot.time)
                      }
                      disabled={!isAvailable}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          !isAvailable && styles.timeTextDisabled,
                          isSelected && styles.timeTextSelected,
                        ]}
                      >
                        {slot.time}
                      </Text>
                      {(slot.veterinarianName || slot.doctorName) && isAvailable && (
                        <Text
                          style={[
                            styles.doctorText,
                            isSelected && styles.doctorTextSelected,
                          ]}
                        >
                          {slot.veterinarianName || slot.doctorName}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {timeSlots.length === 0 && !isLoadingSlots && (
            <View style={styles.emptySlots}>
              <Ionicons name="calendar-outline" size={40} color="#ccc" />
              <Text style={styles.emptySlotsText}>
                예약 가능한 시간이 없습니다
              </Text>
              <Text style={styles.emptySubtext}>
                다른 날짜를 선택해주세요
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  datesScroll: {
    gap: 12,
    paddingVertical: 8,    // 상단 여백 추가
  },
  dateCard: {
    width: 64,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'visible',   // 배지 표시 허용
    marginTop: 16,         // 배지 공간 확보
  },
  dateCardSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  dateCardToday: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  todayBadge: {
    position: 'absolute',
    top: -14,              // -8에서 -14로 증가
    alignSelf: 'center',   // 가운데 정렬
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 6,  // 8에서 6으로 축소
    paddingVertical: 2,    // 3에서 2로 축소
    borderRadius: 8,       // 10에서 8로 축소
    zIndex: 10,            // 상위 레이어
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  todayBadgeSelected: {
    backgroundColor: '#fff',
  },
  todayText: {
    fontSize: 9,           // 10에서 9로 축소
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,   // 타이트한 간격
  },
  todayTextSelected: {
    color: '#42A5F5',
  },
  todayDayText: {
    color: '#FF6B9D',
  },
  dayOfWeek: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  dayOfMonth: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  dateTextSelected: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '30%',
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotDisabled: {
    backgroundColor: '#fafafa',
    opacity: 0.5,
  },
  timeSlotSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeTextDisabled: {
    color: '#ccc',
  },
  timeTextSelected: {
    color: '#fff',
  },
  doctorText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  doctorTextSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptySlots: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptySlotsText: {
    fontSize: 15,
    color: '#999',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
  },
});

export default DateTimePicker;
