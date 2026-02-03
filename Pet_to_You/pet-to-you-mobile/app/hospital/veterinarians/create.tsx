/**
 * Create Veterinarian Screen
 * Hospital staff registration form
 */

import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { VeterinarianForm } from '@/components/veterinarian';
import { useCreateVeterinarian } from '@/hooks/useVeterinarians';
import { Veterinarian } from '@/types';

// TODO: Get from auth context
const MOCK_HOSPITAL_ID = 'hospital-1';

export default function CreateVeterinarianScreen() {
  const router = useRouter();
  const createMutation = useCreateVeterinarian(MOCK_HOSPITAL_ID);

  const handleSubmit = (data: Partial<Veterinarian>) => {
    const fullData = {
      ...data,
      hospitalId: MOCK_HOSPITAL_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createMutation.mutate(fullData, {
      onSuccess: () => {
        Alert.alert(
          '등록 완료',
          '수의사가 성공적으로 등록되었습니다.',
          [
            {
              text: '확인',
              onPress: () => router.back(),
            },
          ]
        );
      },
      onError: (error) => {
        console.error('Create veterinarian error:', error);
        Alert.alert('오류', '수의사 등록에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '수의사 등록',
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
        }}
      />

      <VeterinarianForm
        onSubmit={handleSubmit}
        submitLabel="등록하기"
        isLoading={createMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
