/**
 * Enhanced Booking Flow Screen
 * Steps: 1) Pet Selection → 2) Service Type → 3) Date/Time → 4) Symptoms/Notes → 5) Confirmation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ProgressBar } from '@/components/ui';
import {
  PetSelector,
  ServiceSelector,
  DateTimePicker,
  BookingSummary,
} from '@/components/booking';
import { useHospitalById } from '@/hooks/useHospitals';
import { useCreateBooking } from '@/hooks/useHospitals';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const STEPS = [
  '반려동물 선택',
  '진료 유형',
  '날짜/시간',
  '증상 및 요청사항',
  '예약 확인',
];

export default function BookingScreen() {
  const { hospitalId } = useLocalSearchParams<{ hospitalId: string }>();
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPetId, setSelectedPetId] = useState<string>();
  const [selectedServiceType, setSelectedServiceType] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch hospital data
  const { data: hospital, isLoading: isLoadingHospital } = useHospitalById(hospitalId);

  // Fetch selected pet
  const { data: selectedPet } = useQuery({
    queryKey: ['pet', selectedPetId],
    queryFn: async () => {
      if (!selectedPetId) return null;
      const response = await api.getPetById(selectedPetId);
      return response.data;
    },
    enabled: !!selectedPetId,
  });

  // Create booking mutation
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();

  const handleNext = () => {
    // Validation
    if (currentStep === 0 && !selectedPetId) {
      Alert.alert('알림', '반려동물을 선택해주세요');
      return;
    }
    if (currentStep === 1 && !selectedServiceType) {
      Alert.alert('알림', '진료 유형을 선택해주세요');
      return;
    }
    if (currentStep === 2 && (!selectedDate || !selectedTime)) {
      Alert.alert('알림', '날짜와 시간을 모두 선택해주세요');
      return;
    }

    if (currentStep < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    } else {
      handleConfirm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleConfirm = () => {
    if (!selectedPetId || !selectedServiceType || !selectedDate || !selectedTime) {
      Alert.alert('오류', '필수 정보를 모두 입력해주세요');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const bookingData = {
      hospitalId,
      petId: selectedPetId,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      serviceType: selectedServiceType,
      symptoms,
      notes,
    };

    createBooking(bookingData, {
      onSuccess: () => {
        Alert.alert(
          '예약 완료',
          '예약이 성공적으로 등록되었습니다',
          [
            {
              text: '확인',
              onPress: () => router.push('/(tabs)/bookings'),
            },
          ]
        );
      },
      onError: (error) => {
        Alert.alert(
          '예약 실패',
          '예약 중 오류가 발생했습니다. 다시 시도해주세요'
        );
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View
            key="step-0"
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.stepContainer}
          >
            <PetSelector
              selectedPetId={selectedPetId}
              onSelectPet={setSelectedPetId}
            />
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View
            key="step-1"
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.stepContainer}
          >
            <ServiceSelector
              selectedServiceId={selectedServiceType}
              onSelectService={setSelectedServiceType}
            />
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            key="step-2"
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.stepContainer}
          >
            <DateTimePicker
              hospitalId={hospitalId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
            />
          </Animated.View>
        );

      case 3:
      case 4:
        return (
          <Animated.View
            key="step-3-4"
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.stepContainer}
          >
            <BookingSummary
              hospital={hospital}
              pet={selectedPet}
              serviceType={selectedServiceType}
              date={selectedDate}
              time={selectedTime}
              symptoms={symptoms}
              notes={notes}
              onSymptomsChange={setSymptoms}
              onNotesChange={setNotes}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  if (isLoadingHospital) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42A5F5" />
      </View>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed =
    (currentStep === 0 && selectedPetId) ||
    (currentStep === 1 && selectedServiceType) ||
    (currentStep === 2 && selectedDate && selectedTime) ||
    currentStep === 3 ||
    currentStep === 4;

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
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
            </View>
            <Text style={styles.stepTitle}>
              {currentStep + 1}/{STEPS.length} {STEPS[currentStep]}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>{renderStepContent()}</View>

        {/* Footer Navigation */}
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={20} color="#666" />
                <Text style={styles.prevButtonText}>이전</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed && styles.nextButtonDisabled,
                currentStep === 0 && styles.nextButtonFull,
              ]}
              onPress={handleNext}
              disabled={!canProceed || isCreatingBooking}
              activeOpacity={0.8}
            >
              {isCreatingBooking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {isLastStep ? '예약 확정' : '다음'}
                  </Text>
                  {!isLastStep && (
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 4,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 6,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
