/**
 * Animated logo component with pet paw icon
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography } from '@/constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export function Logo({ size = 'medium', animated = true }: LogoProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }),
          withTiming(1, { duration: 800, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })
        ),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizes = {
    small: { container: 60, paw: 24, text: 16 },
    medium: { container: 80, paw: 32, text: 20 },
    large: { container: 100, paw: 40, text: 24 },
  };

  const currentSize = sizes[size];

  return (
    <View style={[styles.container, { width: currentSize.container, height: currentSize.container }]}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {/* Paw icon using unicode character */}
        <Text style={[styles.pawIcon, { fontSize: currentSize.paw }]}>🐾</Text>
      </Animated.View>
      <Text style={[styles.logoText, { fontSize: currentSize.text }]}>Pet to You</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawIcon: {
    color: colors.primary,
  },
  logoText: {
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 8,
  },
});
