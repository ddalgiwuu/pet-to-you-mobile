/**
 * Modern Korean Calendar Component
 * Toss/Apple-inspired design with Korean localization
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
  onDone?: () => void;
}

// Helper functions
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isFutureDate = (date: Date, maxDate?: Date): boolean => {
  const compareDate = maxDate || new Date();
  compareDate.setHours(23, 59, 59, 999);
  return date > compareDate;
};

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateSelect,
  maxDate,
  minDate,
  onDone,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [slideAnim] = useState(new Animated.Value(0));

  // Korean day names
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  }, [currentYear, currentMonth]);

  // Navigation handlers
  const handlePrevMonth = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Quick action handlers
  const handleToday = () => {
    const today = new Date();
    onDateSelect(today);
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    onDateSelect(yesterday);
    setCurrentMonth(yesterday.getMonth());
    setCurrentYear(yesterday.getFullYear());
  };

  const handleThisWeek = () => {
    // Get Monday of current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    onDateSelect(monday);
    setCurrentMonth(monday.getMonth());
    setCurrentYear(monday.getFullYear());
  };

  // Date selection with animation
  const handleDateSelect = (date: Date) => {
    if (isFutureDate(date, maxDate)) return;
    if (minDate && date < minDate) return;

    onDateSelect(date);
  };

  // Get day cell style
  const getDayCellStyle = (date: Date | null) => {
    if (!date) return null;

    const isSelected = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);
    const isDisabled = isFutureDate(date, maxDate) || (minDate && date < minDate);
    const isSunday = date.getDay() === 0;
    const isSaturday = date.getDay() === 6;

    return {
      isSelected,
      isTodayDate,
      isDisabled,
      isSunday,
      isSaturday,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.gray700} />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <Text style={styles.monthYear}>
            {currentYear}년 {currentMonth + 1}월
          </Text>
        </Animated.View>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.gray700} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {dayNames.map((day, index) => (
          <View key={day} style={styles.dayHeader}>
            <Text
              style={[
                styles.dayHeaderText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const cellStyle = getDayCellStyle(date);
          if (!cellStyle) return null;

          const { isSelected, isTodayDate, isDisabled, isSunday, isSaturday } = cellStyle;

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={styles.dayCell}
              onPress={() => handleDateSelect(date)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayCellInner,
                  isTodayDate && styles.todayCell,
                  isSelected && styles.selectedCell,
                  isDisabled && styles.disabledCell,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSunday && !isSelected && !isDisabled && styles.sundayText,
                    isSaturday && !isSelected && !isDisabled && styles.saturdayText,
                    isSelected && styles.selectedDayText,
                    isDisabled && styles.disabledDayText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleToday}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionText}>오늘</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleYesterday}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionText}>어제</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleThisWeek}
          activeOpacity={0.7}
        >
          <Text style={styles.quickActionText}>이번 주</Text>
        </TouchableOpacity>
      </View>

      {/* Done button */}
      {onDone && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>완료</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  navButton: {
    padding: 8,
    borderRadius: theme.borderRadius.sm,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  sundayText: {
    color: '#FF6B6B',
  },
  saturdayText: {
    color: '#4ECDC4',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCellInner: {
    flex: 1,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#0064FF',
  },
  selectedCell: {
    backgroundColor: '#0064FF',
  },
  disabledCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedDayText: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  disabledDayText: {
    color: theme.colors.gray400,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.gray100,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  doneButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
