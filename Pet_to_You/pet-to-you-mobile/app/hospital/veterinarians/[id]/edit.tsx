/**
 * Edit Veterinarian Screen
 * Hospital staff update form
 */

import React from 'react';
import { StyleSheet, Alert, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { VeterinarianForm } from '@/components/veterinarian';
import {
  useVeterinarianById,
  useUpdateVeterinarian,
} from '@/hooks/useVeterinarians';
import { Veterinarian } from '@/types';

// TODO: Get from auth context
const MOCK_HOSPITAL_ID = 'hospital-1';

export default function EditVeterinarianScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: veterinarian,
    isLoading,
  } = useVeterinarianById(MOCK_HOSPITAL_ID, id);

  const updateMutation = useUpdateVeterinarian(MOCK_HOSPITAL_ID);

  const handleSubmit = (data: Partial<Veterinarian>) => {
    const fullData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    updateMutation.mutate(
      { vetId: id, data: fullData },
      {
        onSuccess: () => {
          Alert.alert(
            '수정 완료',
            '수의사 정보가 성공적으로 수정되었습니다.',
            [
              {
                text: '확인',
                onPress: () => router.back(),
              },
            ]
          );
        },
        onError: (error) => {
          console.error('Update veterinarian error:', error);
          Alert.alert('오류', '수의사 정보 수정에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '수의사 정보 수정',
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>수의사 정보 불러오는 중...</Text>
        </View>
      ) : veterinarian ? (
        <VeterinarianForm
          initialData={veterinarian}
          onSubmit={handleSubmit}
          submitLabel="수정하기"
          isLoading={updateMutation.isPending}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>수의사 정보를 찾을 수 없습니다</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: theme.colors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.gray600,
    textAlign: 'center',
  },
});
