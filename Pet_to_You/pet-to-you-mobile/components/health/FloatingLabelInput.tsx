/**
 * Floating Label Input Component
 * Material Design inspired text input with smooth animations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  required?: boolean;
  onPress?: () => void;
  readonly?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  icon,
  error,
  required = false,
  value,
  onChangeText,
  onPress,
  readonly = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const labelPosition = useSharedValue(0);
  const borderColor = useSharedValue(0);

  const hasValue = value && value.length > 0;

  useEffect(() => {
    if (isFocused || hasValue) {
      labelPosition.value = withTiming(1, { duration: 200 });
    } else {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused, hasValue]);

  useEffect(() => {
    if (error) {
      borderColor.value = withTiming(2, { duration: 200 });
    } else if (isFocused) {
      borderColor.value = withTiming(1, { duration: 200 });
    } else {
      borderColor.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused, error]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(labelPosition.value, [0, 1], [0, -10]);
    const fontSize = interpolate(labelPosition.value, [0, 1], [16, 12]);

    return {
      transform: [{ translateY }],
      fontSize,
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    const getBorderColor = () => {
      if (borderColor.value === 2) return theme.colors.error;
      if (borderColor.value === 1) return theme.colors.primary;
      return theme.colors.gray200;
    };

    return {
      borderColor: getBorderColor(),
      borderWidth: borderColor.value === 1 || borderColor.value === 2 ? 2 : 1,
    };
  });

  // For readonly fields with onPress (like date picker)
  if (readonly && onPress) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            console.log('Date picker clicked!');
            onPress();
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.inputContainer, styles.readonlyContainer]}>
            {icon && (
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color={theme.colors.gray400} />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.labelFloated}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
              </Text>

              <Text style={styles.valueText}>{value}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }

  // For regular editable inputs
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => inputRef.current?.focus()}
        activeOpacity={1}
      >
        <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon}
                size={20}
                color={
                  error
                    ? theme.colors.error
                    : isFocused
                    ? theme.colors.primary
                    : theme.colors.gray400
                }
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Animated.Text
              style={[
                styles.label,
                animatedLabelStyle,
                {
                  color: error
                    ? theme.colors.error
                    : isFocused || hasValue
                    ? theme.colors.primary
                    : theme.colors.gray500,
                },
              ]}
            >
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Animated.Text>

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                multiline && styles.inputMultiline,
              ]}
              value={value}
              onChangeText={onChangeText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline={multiline}
              numberOfLines={numberOfLines}
              {...props}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadows.subtle,
  },
  readonlyContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  iconContainer: {
    marginRight: 12,
    alignSelf: 'center',
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray500,
    marginBottom: 4,
  },
  labelFloated: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.error,
  },
});
