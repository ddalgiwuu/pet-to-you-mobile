/**
 * Toss-style Animated Badge/Chip Component
 * Features: Pill shape, gradient, bounce entrance, remove animation
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, borderRadius, animations } from '@/constants/theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'neutral';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  onRemove?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
  hapticFeedback?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  onRemove,
  leftIcon,
  rightIcon,
  gradient = true,
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Bounce entrance animation
    scale.value = withSequence(
      withSpring(1.2, animations.spring.bouncy),
      withSpring(1, animations.spring.gentle)
    );
    opacity.value = withTiming(1, { duration: animations.duration.normal });
  }, []);

  const handleRemove = useCallback(() => {
    if (!onRemove) return;

    // Remove animation: scale down and fade out
    scale.value = withSpring(0, animations.spring.snappy);
    opacity.value = withTiming(0, { duration: animations.duration.fast }, (finished) => {
      if (finished) {
        runOnJS(onRemove)();
      }
    });

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onRemove, hapticFeedback]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'neutral':
        return colors.surface;
      default:
        return colors.primary;
    }
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'primary':
        return [...colors.gradients.primary] as readonly [string, string, ...string[]];
      case 'secondary':
        return [colors.secondary, '#5DE0D7'] as const;
      case 'success':
        return [colors.success, '#B8F3E8'] as const;
      case 'error':
        return [colors.error, '#FF9B9B'] as const;
      case 'neutral':
        return [...colors.gradients.card] as readonly [string, string, ...string[]];
      default:
        return [...colors.gradients.primary] as readonly [string, string, ...string[]];
    }
  };

  const getTextColor = (): string => {
    return variant === 'neutral' ? colors.text.primary : colors.background;
  };

  const content = (
    <>
      {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
      <Text style={[styles.label, styles[`${size}Text` as keyof typeof styles], { color: getTextColor() }]}>
        {label}
      </Text>
      {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      {onRemove && (
        <TouchableOpacity
          onPress={handleRemove}
          style={styles.removeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.removeIcon, { color: getTextColor() }]}>×</Text>
        </TouchableOpacity>
      )}
    </>
  );

  if (gradient && variant !== 'neutral') {
    return (
      <Animated.View style={[styles.badge, styles[size], animatedStyle]}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor: getBackgroundColor() },
        animatedStyle,
      ]}
    >
      {content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  small: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  large: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 13,
  },
  largeText: {
    fontSize: 15,
  },
  icon: {
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
  },
});
