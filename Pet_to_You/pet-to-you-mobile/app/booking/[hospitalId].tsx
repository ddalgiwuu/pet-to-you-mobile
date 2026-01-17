/**
 * Booking Flow Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Card, ProgressBar } from '@/components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const STEPS = ['반려동물 선택', '날짜 선택', '시간 선택', '확인'];
const MOCK_PETS = [{ id: '1', name: '멍멍이', emoji: '🐶' }, { id: '2', name: '야옹이', emoji: '🐱' }];
const MOCK_DATES = ['2024-01-20', '2024-01-21', '2024-01-22'];
const MOCK_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00'];

export default function BookingScreen() {
  const { hospitalId } = useLocalSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>반려동물을 선택하세요</Text>
            {MOCK_PETS.map((pet, index) => (
              <Animated.View key={pet.id} entering={FadeInDown.delay(index * 100)}>
                <Pressable
                  onPress={() => setSelectedPet(pet.id)}
                  style={[styles.optionCard, selectedPet === pet.id && styles.optionCardActive]}
                >
                  <Text style={styles.petEmoji}>{pet.emoji}</Text>
                  <Text style={styles.petName}>{pet.name}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>날짜를 선택하세요</Text>
            {MOCK_DATES.map((date, index) => (
              <Animated.View key={date} entering={FadeInDown.delay(index * 100)}>
                <Pressable
                  onPress={() => setSelectedDate(date)}
                  style={[styles.optionCard, selectedDate === date && styles.optionCardActive]}
                >
                  <Text style={styles.optionText}>{date}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>시간을 선택하세요</Text>
            <View style={styles.timeGrid}>
              {MOCK_TIMES.map((time, index) => (
                <Animated.View key={time} entering={FadeInDown.delay(index * 50)}>
                  <Pressable
                    onPress={() => setSelectedTime(time)}
                    style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                  >
                    <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>
                      {time}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>예약 정보 확인</Text>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>예약 내역</Text>
              <Text style={styles.summaryText}>반려동물: {MOCK_PETS.find(p => p.id === selectedPet)?.name}</Text>
              <Text style={styles.summaryText}>날짜: {selectedDate}</Text>
              <Text style={styles.summaryText}>시간: {selectedTime}</Text>
            </Card>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar progress={(currentStep + 1) / STEPS.length * 100} />
        <Text style={styles.headerTitle}>{STEPS[currentStep]}</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            title="이전"
            onPress={() => setCurrentStep(currentStep - 1)}
            variant="outline"
          />
        )}
        <Button
          title={currentStep === STEPS.length - 1 ? '예약 확정' : '다음'}
          onPress={handleNext}
          disabled={
            (currentStep === 0 && !selectedPet) ||
            (currentStep === 1 && !selectedDate) ||
            (currentStep === 2 && !selectedTime)
          }
          fullWidth={currentStep === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.surface },
  headerTitle: { ...typography.heading2, marginTop: spacing.md },
  content: { flex: 1 },
  stepContent: { padding: spacing.lg },
  stepTitle: { ...typography.heading3, marginBottom: spacing.lg },
  optionCard: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', ...shadows.small },
  optionCardActive: { backgroundColor: colors.primary, ...shadows.medium },
  petEmoji: { fontSize: 40, marginRight: spacing.md },
  petName: { ...typography.heading3 },
  optionText: { ...typography.body1 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeSlot: { width: '30%', padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, alignItems: 'center' },
  timeSlotActive: { backgroundColor: colors.primary },
  timeText: { ...typography.body1, color: colors.text.primary },
  timeTextActive: { color: colors.background, fontWeight: '600' },
  summaryCard: { padding: spacing.lg, ...shadows.small },
  summaryTitle: { ...typography.heading3, marginBottom: spacing.md },
  summaryText: { ...typography.body1, marginBottom: spacing.sm },
  footer: { padding: spacing.lg, flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.surface },
});
