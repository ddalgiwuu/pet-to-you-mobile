/**
 * Pet Selector Carousel Component
 * Swipeable horizontal carousel for pet selection
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Pet } from '@/types';

interface PetSelectorCarouselProps {
  pets: Pet[];
  selectedPetId: string;
  onSelect: (petId: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const CARD_SPACING = 12;

export const PetSelectorCarousel: React.FC<PetSelectorCarouselProps> = ({
  pets,
  selectedPetId,
  onSelect,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  const getPetEmoji = (species: string) => {
    switch (species) {
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      default:
        return '🐾';
    }
  };

  const getPetGradient = (species: string) => {
    switch (species) {
      case 'dog':
        return ['#FFE5B4', '#FFD699'];
      case 'cat':
        return ['#FFE5EE', '#FFB3D9'];
      default:
        return ['#E0F7F6', '#B2EBF2'];
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
      >
        {pets.map((pet, index) => (
          <PetCard
            key={pet.id}
            pet={pet}
            isSelected={pet.id === selectedPetId}
            onSelect={() => onSelect(pet.id)}
            emoji={getPetEmoji(pet.species)}
            gradient={getPetGradient(pet.species)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface PetCardProps {
  pet: Pet;
  isSelected: boolean;
  onSelect: () => void;
  emoji: string;
  gradient: string[];
  index: number;
}

const PetCard: React.FC<PetCardProps> = ({
  pet,
  isSelected,
  onSelect,
  emoji,
  gradient,
  index,
}) => {
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(isSelected ? 3 : 0);

  React.useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.05, { damping: 12, stiffness: 150 });
      borderWidth.value = withSpring(3, { damping: 15, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      borderWidth.value = withSpring(0, { damping: 15, stiffness: 200 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
  }));

  return (
    <Pressable onPress={onSelect}>
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          isSelected && styles.cardSelected,
          index === 0 && styles.cardFirst,
        ]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
            {pet.breed && (
              <View style={styles.petDetails}>
                <Ionicons name="paw" size={10} color={theme.colors.gray600} />
                <Text style={styles.petBreed} numberOfLines={1}>{pet.breed}</Text>
              </View>
            )}
            <View style={styles.petDetails}>
              <Ionicons name="calendar" size={10} color={theme.colors.gray600} />
              <Text style={styles.petAge}>
                {pet.birthDate
                  ? `${Math.floor(
                      (Date.now() - new Date(pet.birthDate).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )}살`
                  : '나이 미등록'}
              </Text>
            </View>
          </View>

          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: theme.borderRadius.lg,
    marginRight: CARD_SPACING,
    overflow: 'hidden',
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  cardFirst: {
    marginLeft: 0,
  },
  cardSelected: {
    ...theme.shadows.large,
  },
  gradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  emojiContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  emoji: {
    fontSize: 40,
  },
  petInfo: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  petDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  petBreed: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  petAge: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    ...theme.shadows.small,
  },
});
