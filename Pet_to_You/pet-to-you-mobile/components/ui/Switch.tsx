/**
 * Toss-style Toggle Switch Component
 * Features: Smooth slide animation, background morph, circle bounce, haptic feedback
 */

import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, animations } from '@/constants/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  hapticFeedback?: boolean;
}

const SWITCH_WIDTH = 51;
const SWITCH_HEIGHT = 31;
const CIRCLE_SIZE = 27;
const PADDING = 2;

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  activeColor = colors.primary,
  inactiveColor = colors.text.tertiary,
  hapticFeedback = true,
}) => {
  const translateX = useSharedValue(value ? SWITCH_WIDTH - CIRCLE_SIZE - PADDING * 2 : 0);
  const backgroundColor = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (disabled) return;

    const newValue = !value;

    // Slide animation
    translateX.value = withSpring(
      newValue ? SWITCH_WIDTH - CIRCLE_SIZE - PADDING * 2 : 0,
      animations.spring.snappy
    );

    // Background color morph
    backgroundColor.value = withTiming(newValue ? 1 : 0, {
      duration: animations.duration.normal,
    });

    // Circle bounce
    scale.value = withSequence(
      withSpring(1.1, animations.spring.bouncy),
      withSpring(1, animations.spring.gentle)
    );

    if (hapticFeedback) {
      Haptics.impactAsync(
        newValue
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    onValueChange(newValue);
  }, [value, disabled, onValueChange, hapticFeedback]);

  const trackStyle = useAnimatedStyle(() => {
    const bgColor =
      backgroundColor.value === 1
        ? activeColor
        : backgroundColor.value === 0
        ? inactiveColor
        : `rgba(${Math.round(255 * (1 - backgroundColor.value))}, ${Math.round(
            107 * backgroundColor.value
          )}, ${Math.round(157 * backgroundColor.value)}, 1)`;

    return {
      backgroundColor: bgColor,
    };
  });

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View style={[styles.track, trackStyle, disabled && styles.disabled]}>
        <Animated.View style={[styles.circle, circleStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});
