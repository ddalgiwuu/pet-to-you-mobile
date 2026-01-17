/**
 * Toss-style Animated Text Input Component
 * Features: Floating label, focus glow, error shake, success checkmark, clear button
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, borderRadius, animations } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  success?: boolean;
  showClearButton?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticFeedback?: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  value,
  onChangeText,
  showClearButton = true,
  leftIcon,
  rightIcon,
  hapticFeedback = true,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  // Animation values
  const labelPosition = useSharedValue(hasValue || isFocused ? 1 : 0);
  const borderScale = useSharedValue(1);
  const borderColor = useSharedValue(0);
  const shakeTranslate = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    setHasValue(!!value);
    if (value) {
      labelPosition.value = withSpring(1, animations.spring.gentle);
    }
  }, [value]);

  useEffect(() => {
    if (error) {
      // Shake animation
      shakeTranslate.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [error, hapticFeedback]);

  useEffect(() => {
    if (success) {
      // Checkmark slide-in animation
      checkmarkOpacity.value = withTiming(1, { duration: animations.duration.normal });
      checkmarkScale.value = withSequence(
        withSpring(1.2, animations.spring.bouncy),
        withSpring(1, animations.spring.gentle)
      );

      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      checkmarkOpacity.value = withTiming(0, { duration: animations.duration.fast });
    }
  }, [success, hapticFeedback]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    labelPosition.value = withSpring(1, animations.spring.gentle);
    borderScale.value = withSpring(1.02, animations.spring.snappy);
    borderColor.value = withTiming(1, { duration: animations.duration.normal });
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!hasValue) {
      labelPosition.value = withSpring(0, animations.spring.gentle);
    }
    borderScale.value = withSpring(1, animations.spring.gentle);
    borderColor.value = withTiming(0, { duration: animations.duration.normal });
  }, [hasValue]);

  const handleClear = useCallback(() => {
    if (onChangeText) {
      onChangeText('');
    }
    setHasValue(false);
    labelPosition.value = withSpring(0, animations.spring.gentle);

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onChangeText, hapticFeedback]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: labelPosition.value === 1 ? -28 : 0,
      },
      {
        scale: labelPosition.value === 1 ? 0.85 : 1,
      },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: borderScale.value }, { translateX: shakeTranslate.value }],
    borderColor: error
      ? colors.error
      : success
      ? colors.success
      : borderColor.value === 1
      ? colors.primary
      : colors.text.tertiary,
    shadowOpacity: borderColor.value * 0.3,
    shadowColor: colors.primary,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
    transform: [{ scale: checkmarkScale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <View style={styles.inputWrapper}>
          <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>

          <AnimatedTextInput
            {...textInputProps}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={styles.input}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {success && (
          <Animated.Text style={[styles.checkmark, checkmarkStyle]}>✓</Animated.Text>
        )}

        {showClearButton && hasValue && !success && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearIcon}>×</Text>
          </TouchableOpacity>
        )}

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: colors.background,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    ...typography.body1,
    color: colors.text.secondary,
  },
  input: {
    ...typography.body1,
    color: colors.text.primary,
    paddingTop: 4,
    paddingBottom: 4,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.success,
    marginLeft: 8,
    fontWeight: '700',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
    marginLeft: 16,
  },
});
