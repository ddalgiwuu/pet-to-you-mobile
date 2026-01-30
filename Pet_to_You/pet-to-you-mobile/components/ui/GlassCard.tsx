/**
 * Glassmorphism Card Component
 * 2024-2025 Modern UI Trend: Glass morphism with blur effects
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, borderRadius } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number; // Blur intensity (0-100)
  tint?: 'light' | 'dark' | 'default';
  pressable?: boolean;
  onPress?: () => void;
  elevation?: number; // Shadow elevation
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  pressable = false,
  onPress,
  elevation = 4,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  // Animated style for press effect
  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      pressed.value,
      [0, 1],
      [0.1, 0.05]
    );

    const shadowRadius = interpolate(
      pressed.value,
      [0, 1],
      [elevation * 2, elevation]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      shadowRadius,
    };
  });

  // Gesture handlers for pressable cards
  const tap = Gesture.Tap()
    .onBegin(() => {
      if (pressable) {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
        pressed.value = withTiming(1, { duration: 100 });
      }
    })
    .onFinalize(() => {
      if (pressable) {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        pressed.value = withTiming(0, { duration: 150 });
        if (onPress) {
          onPress();
        }
      }
    });

  const cardContent = (
    <Animated.View
      style={[
        styles.container,
        {
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: 0.1,
          shadowRadius: elevation * 2,
          elevation: elevation, // Android
        },
        animatedStyle,
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint={tint} style={styles.blurContainer}>
          <View style={styles.content}>{children}</View>
        </BlurView>
      ) : (
        // Android fallback with semi-transparent background
        <View style={[styles.blurContainer, styles.androidGlass]}>
          <View style={styles.content}>{children}</View>
        </View>
      )}
    </Animated.View>
  );

  if (pressable) {
    return <GestureDetector gesture={tap}>{cardContent}</GestureDetector>;
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  blurContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  androidGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  content: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'transparent',
  },
});
