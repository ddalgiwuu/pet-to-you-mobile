import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PetSelector } from '@/components/booking';
import { useCreateReservation } from '@/hooks/useDaycare';

export default function DaycareReserveScreen() {
  const { daycareId } = useLocalSearchParams<{ daycareId: string }>();
  const router = useRouter();
  const [selectedPetId, setSelectedPetId] = useState<string>();
  const { mutate: createReservation, isPending } = useCreateReservation();

  const handleSubmit = () => {
    if (!selectedPetId) {
      Alert.alert('알림', '반려동물을 선택해주세요');
      return;
    }

    createReservation(
      { daycareId, petId: selectedPetId },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('예약 완료', '유치원 예약이 완료되었습니다', [{ text: '확인', onPress: () => router.back() }]);
        },
        onError: () => Alert.alert('오류', '예약 중 오류가 발생했습니다'),
      }
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>유치원 예약</Text>
          <View style={{ width: 24 }} />
        </View>
        <PetSelector selectedPetId={selectedPetId} onSelectPet={setSelectedPetId} />
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isPending || !selectedPetId}>
            <Text style={styles.submitButtonText}>예약하기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  footer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingHorizontal: 20, paddingTop: 12 },
  submitButton: { backgroundColor: '#66BB6A', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
