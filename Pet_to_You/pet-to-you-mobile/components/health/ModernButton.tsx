/**
 * Modern Button Component
 * Toss-inspired button with gradient and haptic feedback
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 100 });

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getGradientColors = () => {
    if (disabled || loading) {
      return [theme.colors.gray300, theme.colors.gray400];
    }

    switch (variant) {
      case 'primary':
        return theme.colors.gradients.primary;
      case 'success':
        return [theme.colors.success, theme.colors.teal];
      case 'secondary':
        return [theme.colors.secondary, theme.colors.teal];
      default:
        return [theme.colors.white, theme.colors.white];
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.colors.gray500 : theme.colors.primary;
    }
    return theme.colors.white;
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'medium':
        return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 15;
      case 'large':
        return 16;
    }
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon}
          size={getTextSize() + 2}
          color={getTextColor()}
          style={styles.iconLeft}
        />
      )}
      <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }]}>
        {loading ? '처리 중...' : title}
      </Text>
      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={getTextSize() + 2}
          color={getTextColor()}
          style={styles.iconRight}
        />
      )}
    </>
  );

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[fullWidth && styles.fullWidth]}
    >
      <Animated.View
        style={[
          styles.container,
          getSizeStyle(),
          variant === 'outline' && styles.outline,
          animatedStyle,
          style,
        ]}
      >
        {variant === 'outline' ? (
          <>{content}</>
        ) : (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {content}
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  container: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  outline: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
