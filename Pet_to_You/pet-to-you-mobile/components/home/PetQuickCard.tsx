/**
 * Pet Quick Access Card
 * Optimized with React Best Practices
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

interface Pet {
  id: string;
  name: string;
  species: string;
  emoji: string;
  color: string[];
}

interface PetQuickCardProps {
  onAddPet?: () => void;
  onPetPress?: (petId: string) => void;
}

// Mock data - replace with useUserPets() SWR hook
const MOCK_PETS: Pet[] = [
  { id: '1', name: '멍멍이', species: '강아지', emoji: '🐶', color: ['#FFB4B4', '#FFE5E5'] },
  { id: '2', name: '나비', species: '고양이', emoji: '🐱', color: ['#B4D4FF', '#E5F1FF'] },
];

// Rule 5.2: Extract to Memoized Components
const PetCard = React.memo(({
  pet,
  index,
  onPress
}: {
  pet: Pet;
  index: number;
  onPress?: (petId: string) => void;
}) => {
  // Rule 5.5: Stable callback
  const handlePress = React.useCallback(() => {
    onPress?.(pet.id);
  }, [pet.id, onPress]);

  return (
    <Animated.View entering={FadeInRight.delay(100 * index)}>
      <Pressable onPress={handlePress}>
        <LinearGradient colors={pet.color} style={styles.petCard}>
          <Text style={styles.petEmoji}>{pet.emoji}</Text>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petSpecies}>{pet.species}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

// Rule 6.3: Hoist Static JSX
const AddPetIcon = <Ionicons name="add" size={32} color={colors.text.tertiary} />;

export default function PetQuickCard({ onAddPet, onPetPress }: PetQuickCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>우리 아이들</Text>
        <Pressable onPress={onAddPet} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {MOCK_PETS.map((pet, index) => (
          <PetCard
            key={pet.id}
            pet={pet}
            index={index}
            onPress={onPetPress}
          />
        ))}

        {/* Add Pet Card */}
        <Pressable onPress={onAddPet} style={styles.addPetCard}>
          {AddPetIcon}
          <Text style={styles.addPetText}>반려동물 추가</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading3,
    color: colors.text.primary,
  },
  addButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  petCard: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.small,
  },
  petEmoji: {
    fontSize: 40,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  petSpecies: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  addPetCard: {
    width: 160,
    height: 80,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.surface,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addPetText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
