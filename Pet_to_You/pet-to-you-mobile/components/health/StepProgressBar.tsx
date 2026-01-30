/**
 * Modern Step Progress Bar Component
 * Toss-inspired horizontal progress indicator with smooth animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface Step {
  number: number;
  label: string;
  icon?: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedColor?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  completedColor = theme.colors.success,
  activeColor = theme.colors.primary,
  inactiveColor = theme.colors.gray300,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring((currentStep - 1) / (steps.length - 1), {
      damping: 20,
      stiffness: 90,
    });
  }, [currentStep]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      {/* Progress Bar Background */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: activeColor },
            progressBarStyle,
          ]}
        />
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <StepIndicator
              key={step.number}
              step={step}
              isCompleted={isCompleted}
              isActive={isActive}
              completedColor={completedColor}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
            />
          );
        })}
      </View>
    </View>
  );
};

interface StepIndicatorProps {
  step: Step;
  isCompleted: boolean;
  isActive: boolean;
  completedColor: string;
  activeColor: string;
  inactiveColor: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  isCompleted,
  isActive,
  completedColor,
  activeColor,
  inactiveColor,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.1, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else if (isCompleted) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(0.5, { duration: 200 });
    }
  }, [isActive, isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getBackgroundColor = () => {
    if (isCompleted) return completedColor;
    if (isActive) return activeColor;
    return inactiveColor;
  };

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        style={[
          styles.stepCircle,
          { backgroundColor: getBackgroundColor() },
          animatedStyle,
        ]}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={20} color={theme.colors.white} />
        ) : (
          <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
            {step.number}
          </Text>
        )}
      </Animated.View>
      <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
        {step.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
  },
  progressTrack: {
    position: 'absolute',
    top: 36,
    left: '12%',
    right: '12%',
    height: 3,
    backgroundColor: theme.colors.gray200,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...theme.shadows.medium,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray500,
  },
  stepNumberActive: {
    color: theme.colors.white,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray500,
    textAlign: 'center',
    maxWidth: 80,
  },
  stepLabelActive: {
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
});
