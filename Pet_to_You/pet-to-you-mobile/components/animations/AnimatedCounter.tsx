/**
 * Animated Number Counter Component
 * Features: Count up/down with easing, digit flip animation, customizable duration
 */

import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography } from '@/constants/theme';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  separator?: string;
  easing?: (value: number) => number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  style,
  prefix = '',
  suffix = '',
  separator = ',',
  easing = Easing.out(Easing.cubic),
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing,
    });

    // Update display value during animation
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      setDisplayValue(currentValue);

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayValue(endValue);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [value, duration]);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimals > 0 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.text, style]}>
        {prefix}
        {formatNumber(displayValue)}
        {suffix}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    ...typography.heading2,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});
