/**
 * Toss-style Glassmorphism Card Component
 * Features: Frosted glass, gradient border, shadow animations, press/long-press effects
 */

import React, { useCallback } from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, shadows, animations } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  glassEffect?: boolean;
  gradientBorder?: boolean;
  hapticFeedback?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  glassEffect = true,
  gradientBorder = true,
  hapticFeedback = true,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue<number>(0.15);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePressIn = useCallback(() => {
    translateY.value = withSpring(-2, animations.spring.snappy);
    shadowOpacity.value = withTiming(0.2, {
      duration: animations.duration.fast,
    });

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticFeedback]);

  const handlePressOut = useCallback(() => {
    translateY.value = withSpring(0, animations.spring.gentle);
    shadowOpacity.value = withTiming(0.15, {
      duration: animations.duration.normal,
    });
  }, []);

  const handlePress = useCallback(() => {
    if (!onPress) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress();
  }, [onPress, hapticFeedback]);

  const handleLongPress = useCallback(() => {
    if (!onLongPress) return;

    // Pulse animation
    scale.value = withSequence(
      withSpring(1.05, animations.spring.bouncy),
      withSpring(1, animations.spring.gentle)
    );

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    onLongPress();
  }, [onLongPress, hapticFeedback]);

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        glassEffect && styles.glassEffect,
        shadows.medium,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (gradientBorder) {
    return (
      <AnimatedPressable
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={!onPress && !onLongPress}
        style={[styles.borderContainer, style]}
      >
        <LinearGradient
          colors={['rgba(255,107,157,0.3)', 'rgba(78,205,196,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          {cardContent}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  borderContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 2,
    borderRadius: borderRadius.lg,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 16,
    overflow: 'hidden',
  },
  glassEffect: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // Note: backdropFilter is not supported in React Native
    // Consider using @react-native-community/blur for true glassmorphism
  },
});
