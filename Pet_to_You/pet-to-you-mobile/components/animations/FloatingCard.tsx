/**
 * Floating Card with Parallax Animation
 * Features: Subtle float animation, rotation tilt on scroll, loop animation
 */

import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { animations } from '@/constants/theme';

interface FloatingCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  floatDistance?: number;
  duration?: number;
  rotationDegree?: number;
  delay?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  style,
  floatDistance = 5,
  duration = 3000,
  rotationDegree = 2,
  delay = 0,
}) => {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Float animation (up and down)
    translateY.value = withRepeat(
      withSequence(
        withTiming(delay, { duration: delay }), // Initial delay
        withTiming(-floatDistance, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(floatDistance, {
          duration: duration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Subtle rotation tilt
    rotate.value = withRepeat(
      withSequence(
        withTiming(delay, { duration: delay }),
        withTiming(rotationDegree, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-rotationDegree, {
          duration: duration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, [floatDistance, duration, rotationDegree, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
