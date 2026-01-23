/**
 * Pet Registration Flow - Multi-step process
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ProgressBar } from '@/components/ui';
import { BasicInfoForm } from '@/components/pets/BasicInfoForm';
import { MedicalInfoForm } from '@/components/pets/MedicalInfoForm';
import { PhotoUpload } from '@/components/pets/PhotoUpload';
import { useCreatePet, CreatePetData } from '@/hooks/usePets';

const STEPS = ['기본 정보', '건강 정보', '사진 등록', '확인'];

export default function PetRegisterScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [petData, setPetData] = useState<Partial<CreatePetData>>({});
  const [mainPhoto, setMainPhoto] = useState<string>();
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);

  const { mutate: createPet, isPending } = useCreatePet();

  const handleNext = () => {
    // Validation
    if (currentStep === 0) {
      if (!petData.name || !petData.species) {
        Alert.alert('알림', '이름과 종류는 필수 입력 항목입니다');
        return;
      }
    }
    if (currentStep === 2 && !mainPhoto) {
      Alert.alert('알림', '대표 사진은 필수입니다');
      return;
    }

    if (currentStep < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
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

  const handleSubmit = () => {
    const finalData: CreatePetData = {
      name: petData.name!,
      species: petData.species!,
      breed: petData.breed,
      birthDate: petData.birthDate,
      gender: petData.gender,
      weight: petData.weight,
      color: petData.color,
      allergies: petData.allergies,
      diseases: petData.diseases,
      vaccinations: petData.vaccinations,
      neutered: petData.neutered,
      microchipId: petData.microchipId,
      specialNeeds: petData.specialNeeds,
    };

    createPet(finalData, {
      onSuccess: (pet) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // TODO: Upload photos after pet creation
        Alert.alert('등록 완료', '반려동물이 성공적으로 등록되었습니다', [
          { text: '확인', onPress: () => router.back() },
        ]);
      },
      onError: () => {
        Alert.alert('등록 실패', '다시 시도해주세요');
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
            <BasicInfoForm data={petData} onDataChange={setPetData} />
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
            <MedicalInfoForm data={petData} onDataChange={setPetData} />
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
            <PhotoUpload
              mainPhoto={mainPhoto}
              additionalPhotos={additionalPhotos}
              onMainPhotoChange={setMainPhoto}
              onAdditionalPhotosChange={setAdditionalPhotos}
            />
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            key="step-3"
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.stepContainer}
          >
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>등록 정보 확인</Text>
              <View style={styles.summaryCard}>
                {mainPhoto && (
                  <Image source={{ uri: mainPhoto }} style={styles.summaryImage} />
                )}
                <Text style={styles.summaryName}>{petData.name}</Text>
                <Text style={styles.summaryInfo}>
                  {petData.species === 'dog' ? '강아지' : petData.species === 'cat' ? '고양이' : '기타'}
                  {petData.breed && ` · ${petData.breed}`}
                  {petData.gender && ` · ${petData.gender === 'male' ? '남아' : '여아'}`}
                </Text>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ProgressBar progress={progress} />
            <Text style={styles.stepTitle}>
              {currentStep + 1}/{STEPS.length} {STEPS[currentStep]}
            </Text>
          </View>
        </View>

        <View style={styles.content}>{renderStepContent()}</View>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.prevButton} onPress={handleBack} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={20} color="#666" />
                <Text style={styles.prevButtonText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
              onPress={handleNext}
              disabled={isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? '등록 완료' : '다음'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 12 },
  content: { flex: 1 },
  stepContainer: { flex: 1 },
  footer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  footerButtons: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  prevButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, gap: 4 },
  prevButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  nextButton: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#42A5F5', paddingVertical: 16, borderRadius: 12 },
  nextButtonFull: { flex: 1 },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  summaryContainer: { flex: 1, padding: 20 },
  summaryTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 24 },
  summaryCard: { alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 20, padding: 24 },
  summaryImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  summaryName: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 8 },
  summaryInfo: { fontSize: 15, color: '#666' },
});
