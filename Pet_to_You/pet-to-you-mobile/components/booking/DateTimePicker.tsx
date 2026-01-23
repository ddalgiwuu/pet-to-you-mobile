import React, { useState, useMemo } from 'react';
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

interface DateTimePickerProps {
  hospitalId: string;
  selectedDate?: Date;
  selectedTime?: string;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  hospitalId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
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

  // Fetch available time slots for selected date
  const formattedDate = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : '';

  const { data: timeSlots = [], isLoading: isLoadingSlots } = useAvailableSlots(
    hospitalId,
    formattedDate,
    !!selectedDate
  );

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
                  ]}
                  onPress={() => handleDatePress(date)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayOfWeek,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {dayOfWeek}
                  </Text>
                  <Text
                    style={[
                      styles.dayOfMonth,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {dayOfMonth}
                  </Text>
                  {isToday && !isSelected && (
                    <View style={styles.todayDot} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>

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
                      {slot.doctorName && isAvailable && (
                        <Text
                          style={[
                            styles.doctorText,
                            isSelected && styles.doctorTextSelected,
                          ]}
                        >
                          {slot.doctorName}
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
  },
  dateCardSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
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
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#42A5F5',
    marginTop: 4,
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
});

export default DateTimePicker;
