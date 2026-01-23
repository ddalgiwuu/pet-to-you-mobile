import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  image?: string;
}

interface PetSelectorProps {
  selectedPetId?: string;
  onSelectPet: (petId: string) => void;
}

export const PetSelector: React.FC<PetSelectorProps> = ({
  selectedPetId,
  onSelectPet,
}) => {
  const router = useRouter();

  // Fetch user's pets
  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await api.getPets();
      return response.data as Pet[];
    },
  });

  const handleSelectPet = (petId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectPet(petId);
  };

  const handleAddPet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/pets/register');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42A5F5" />
        <Text style={styles.loadingText}>반려동물 목록 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>진료받을 반려동물을 선택하세요</Text>

      {pets.map((pet, index) => (
        <Animated.View
          key={pet.id}
          entering={FadeInDown.delay(index * 100)}
        >
          <TouchableOpacity
            style={[
              styles.petCard,
              selectedPetId === pet.id && styles.petCardSelected,
            ]}
            onPress={() => handleSelectPet(pet.id)}
            activeOpacity={0.8}
          >
            {/* Pet Image */}
            <View style={styles.petImageContainer}>
              {pet.image ? (
                <Image
                  source={{ uri: pet.image }}
                  style={styles.petImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.petImagePlaceholder}>
                  <Ionicons
                    name={pet.species === 'dog' ? 'paw' : 'paw'}
                    size={32}
                    color="#42A5F5"
                  />
                </View>
              )}
            </View>

            {/* Pet Info */}
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petDetails}>
                {pet.breed || pet.species}
                {pet.age ? ` · ${pet.age}살` : ''}
              </Text>
            </View>

            {/* Selection Indicator */}
            <View
              style={[
                styles.checkbox,
                selectedPetId === pet.id && styles.checkboxSelected,
              ]}
            >
              {selectedPetId === pet.id && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Add New Pet Button */}
      <TouchableOpacity
        style={styles.addPetButton}
        onPress={handleAddPet}
        activeOpacity={0.8}
      >
        <View style={styles.addPetIconContainer}>
          <Ionicons name="add" size={28} color="#42A5F5" />
        </View>
        <Text style={styles.addPetText}>새 반려동물 등록</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {pets.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>등록된 반려동물이 없습니다</Text>
          <Text style={styles.emptyText}>
            먼저 반려동물을 등록해주세요
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  petCardSelected: {
    borderColor: '#42A5F5',
    backgroundColor: '#E3F2FD',
  },
  petImageContainer: {
    marginRight: 16,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addPetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPetText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#42A5F5',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PetSelector;
