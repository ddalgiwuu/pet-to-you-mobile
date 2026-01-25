/**
 * Haptic Feedback Button
 * 2024-2025 Trend: Enhanced tactile feedback for better UX
 */

import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '@/constants/theme';

interface HapticButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticStrength?: 'light' | 'medium' | 'heavy';
  gradientColors?: [string, string]; // Custom gradient colors
  subtitle?: string; // Optional subtitle for bento cards
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const HapticButton: React.FC<HapticButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  hapticStrength = 'medium',
  gradientColors,
  subtitle,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const triggerHaptic = () => {
    const feedbackStyle = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    }[hapticStrength];

    Haptics.impactAsync(feedbackStyle);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
    runOnJS(triggerHaptic)();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          minHeight: 56,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          minHeight: 48,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      case 'medium':
      default:
        return 16;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      case 'medium':
      default:
        return 20;
    }
  };

  const renderContent = () => {
    const isLight = variant === 'outline' || variant === 'ghost';
    const textColor = isLight ? colors.primary : colors.background;

    const iconElement = icon && (
      <Ionicons
        name={icon}
        size={variant === 'gradient' ? 28 : getIconSize()}
        color={textColor}
        style={{ marginRight: iconPosition === 'left' ? 8 : 0, marginLeft: iconPosition === 'right' ? 8 : 0 }}
      />
    );

    // Gradient/Bento card layout (vertical)
    if (variant === 'gradient' && subtitle) {
      return (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={28}
              color={colors.background}
              style={{ marginBottom: 8 }}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: 15,
                fontWeight: '700',
                color: colors.background,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
              },
            ]}
          >
            {subtitle}
          </Text>
        </>
      );
    }

    // Default horizontal layout
    return (
      <>
        {iconPosition === 'left' && iconElement}
        <Text
          style={[
            styles.text,
            {
              fontSize: getTextSize(),
              color: textColor,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  const baseStyles = [
    styles.button,
    getSizeStyles(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
        disabled={disabled || loading}
      >
        <AnimatedLinearGradient
          colors={[colors.primary, colors.primary + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyles}
        >
          {renderContent()}
        </AnimatedLinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'gradient') {
    const defaultColors = gradientColors || [colors.primary, colors.primary + 'DD'];
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
        disabled={disabled || loading}
      >
        <AnimatedLinearGradient
          colors={defaultColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[baseStyles, styles.gradientCard]}
        >
          {renderContent()}
        </AnimatedLinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        animatedStyle,
        baseStyles,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
      ]}
      disabled={disabled || loading}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    ...typography.button,
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  secondary: {
    backgroundColor: colors.surface,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  subtitle: {
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
});
