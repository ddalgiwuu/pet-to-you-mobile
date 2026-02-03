import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Veterinarian } from '@/types';
import { VeterinarianCard } from './VeterinarianCard';

interface VeterinarianSelectorProps {
  veterinarians: Veterinarian[];
  selectedVetId?: string;
  onSelectVet: (vetId?: string) => void;
  showAnyOption?: boolean;
}

export const VeterinarianSelector: React.FC<VeterinarianSelectorProps> = ({
  veterinarians,
  selectedVetId,
  onSelectVet,
  showAnyOption = true,
}) => {
  const activeVeterinarians = veterinarians.filter((vet) => vet.isActive);

  const handleSelectVet = (vetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectVet(vetId === selectedVetId ? undefined : vetId);
  };

  const handleSelectAny = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectVet(undefined);
  };

  if (activeVeterinarians.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="medical-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>담당 수의사 정보가 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeVeterinarians.map((vet, index) => (
        <Animated.View
          key={vet.id}
          entering={FadeInDown.delay(index * 100)}
        >
          <VeterinarianCard
            veterinarian={vet}
            variant="selector"
            isSelected={selectedVetId === vet.id}
            onPress={() => handleSelectVet(vet.id)}
          />
        </Animated.View>
      ))}

      {/* "아무나 괜찮아요" 옵션 */}
      {showAnyOption && (
        <Animated.View
          entering={FadeInDown.delay(activeVeterinarians.length * 100)}
        >
          <TouchableOpacity
            style={[
              styles.anyOptionCard,
              !selectedVetId && styles.anyOptionCardSelected,
            ]}
            onPress={handleSelectAny}
            activeOpacity={0.8}
          >
            <View style={styles.anyOptionIcon}>
              <Ionicons
                name="people"
                size={24}
                color={!selectedVetId ? '#42A5F5' : '#999'}
              />
            </View>

            <View style={styles.anyOptionInfo}>
              <Text
                style={[
                  styles.anyOptionText,
                  !selectedVetId && styles.anyOptionTextSelected,
                ]}
              >
                아무나 괜찮아요
              </Text>
              <Text style={styles.anyOptionSubtext}>
                가장 빠른 시간에 진료받을 수 있어요
              </Text>
            </View>

            {!selectedVetId && (
              <View style={styles.anyOptionCheckmark}>
                <Ionicons name="checkmark-circle" size={24} color="#42A5F5" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  anyOptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  anyOptionCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#42A5F5',
  },
  anyOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anyOptionInfo: {
    flex: 1,
    gap: 2,
  },
  anyOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  anyOptionTextSelected: {
    color: '#42A5F5',
  },
  anyOptionSubtext: {
    fontSize: 13,
    color: '#999',
  },
  anyOptionCheckmark: {
    marginLeft: 'auto',
  },
});

export default VeterinarianSelector;
