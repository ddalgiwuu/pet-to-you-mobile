import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { VeterinarianCard } from './VeterinarianCard';
import {
  useVeterinarians,
  useDeleteVeterinarian,
  useToggleVeterinarianStatus,
} from '@/hooks/useVeterinarians';

interface VeterinarianListProps {
  hospitalId: string;
}

export const VeterinarianList: React.FC<VeterinarianListProps> = ({
  hospitalId,
}) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: veterinarians = [],
    isLoading,
    refetch,
  } = useVeterinarians(hospitalId, false);

  const deleteVetMutation = useDeleteVeterinarian(hospitalId);
  const toggleStatusMutation = useToggleVeterinarianStatus(hospitalId);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEdit = (vetId: string) => {
    router.push(`/hospital/veterinarians/${vetId}/edit`);
  };

  const handleDelete = (vetId: string, vetName: string) => {
    Alert.alert(
      '수의사 삭제',
      `${vetName} 수의사를 삭제하시겠습니까?\n연결된 예약 정보는 유지됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteVetMutation.mutate(vetId, {
              onSuccess: () => {
                Alert.alert('완료', '수의사가 삭제되었습니다.');
              },
              onError: (error) => {
                Alert.alert('오류', '삭제에 실패했습니다. 다시 시도해주세요.');
                console.error('Delete veterinarian error:', error);
              },
            });
          },
        },
      ]
    );
  };

  const handleToggleActive = (vetId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    toggleStatusMutation.mutate(
      { vetId, isActive: newStatus },
      {
        onSuccess: () => {
          // Success feedback handled by mutation
        },
        onError: (error) => {
          Alert.alert('오류', '상태 변경에 실패했습니다.');
          console.error('Toggle veterinarian status error:', error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42A5F5" />
        <Text style={styles.loadingText}>수의사 목록 불러오는 중...</Text>
      </View>
    );
  }

  if (veterinarians.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Ionicons name="medical-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>등록된 수의사가 없습니다</Text>
        <Text style={styles.emptyText}>
          첫 번째 수의사를 등록하여{'\n'}병원 진료 시스템을 시작하세요
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#42A5F5"
        />
      }
    >
      {veterinarians.map((vet, index) => (
        <Animated.View
          key={vet.id}
          entering={FadeInDown.delay(index * 80)}
        >
          <VeterinarianCard
            veterinarian={vet}
            variant="dashboard"
            onEdit={() => handleEdit(vet.id)}
            onDelete={() => handleDelete(vet.id, vet.name)}
            onToggleActive={() => handleToggleActive(vet.id, vet.isActive)}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default VeterinarianList;
