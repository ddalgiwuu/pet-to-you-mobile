/**
 * Button with Spring Physics Animation
 * Features: Press animation with overshoot, release spring back, configurable physics
 */

import React, { useCallback } from 'react';
import { Pressable, ViewStyle, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SpringButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  stiffness?: number;
  damping?: number;
  mass?: number;
  pressScale?: number;
  hapticFeedback?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SpringButton: React.FC<SpringButtonProps> = ({
  children,
  style,
  stiffness = 150,
  damping = 15,
  mass = 1,
  pressScale = 0.96,
  hapticFeedback = true,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...pressableProps
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(
    (event: any) => {
      if (disabled) return;

      scale.value = withSpring(pressScale, {
        stiffness,
        damping,
        mass,
        overshootClamping: false,
      });

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      onPressIn?.(event);
    },
    [disabled, pressScale, stiffness, damping, mass, hapticFeedback, onPressIn]
  );

  const handlePressOut = useCallback(
    (event: any) => {
      if (disabled) return;

      // Spring back with overshoot
      scale.value = withSpring(1, {
        stiffness,
        damping,
        mass,
        overshootClamping: false,
      });

      onPressOut?.(event);
    },
    [disabled, stiffness, damping, mass, onPressOut]
  );

  const handlePress = useCallback(
    (event: any) => {
      if (disabled) return;

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      onPress?.(event);
    },
    [disabled, hapticFeedback, onPress]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...pressableProps}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};
