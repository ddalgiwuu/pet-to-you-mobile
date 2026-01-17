/**
 * Onboarding screen with swipeable cards
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { colors, typography, spacing, borderRadius, animations } from '@/constants/theme';
import type { OnboardingScreen } from '@/types';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA: OnboardingScreen[] = [
  {
    id: 1,
    title: '반려동물 건강관리',
    description: '우리 아이의 건강을 체계적으로 관리하세요',
    image: '🏥',
  },
  {
    id: 2,
    title: '병원 예약',
    description: '가까운 동물병원을 찾고 간편하게 예약하세요',
    image: '📅',
  },
  {
    id: 3,
    title: '의료 기록',
    description: '진료 기록과 예방접종 일정을 한눈에',
    image: '📋',
  },
];

// Separate component for animated items (to use hooks properly)
function OnboardingItem({
  item,
  index,
  scrollX
}: {
  item: OnboardingScreen;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ];

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.slide, animatedStyle]}>
        <Text style={styles.emoji}>{item.image}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    );
}

// Separate component for pagination dots
function PaginationDot({
  index,
  scrollX
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              Extrapolate.CLAMP
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.3, 1, 0.3],
              Extrapolate.CLAMP
            );

            return {
              width: dotWidth,
              opacity,
            };
          });

  return (
    <Animated.View style={[styles.dot, animatedStyle]} />
  );
}

// Main Onboarding component
export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
      router.replace('/(auth)/login');
    }
  };

  const Pagination = () => {
    return (
      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, idx) => (
          <PaginationDot key={idx} index={idx} scrollX={scrollX} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={({ item, index }) => (
          <OnboardingItem item={item} index={index} scrollX={scrollX} />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />

      <Pagination />

      <View style={styles.footer}>
        <Button
          title={currentIndex === ONBOARDING_DATA.length - 1 ? '시작하기' : '다음'}
          onPress={handleNext}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 120,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
