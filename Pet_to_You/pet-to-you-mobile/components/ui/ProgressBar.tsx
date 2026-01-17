/**
 * Toss-style Animated Progress Bar Component
 * Features: Width animation, gradient fill, shimmer effect during loading
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, animations } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showShimmer?: boolean;
  color?: string;
  backgroundColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showShimmer = true,
  color = colors.primary,
  backgroundColor = colors.surface,
  gradientColors = [...colors.gradients.primary] as readonly [string, string, ...string[]],
}) => {
  const width = useSharedValue(0);
  const shimmerTranslate = useSharedValue(-200);

  useEffect(() => {
    // Animate progress width
    width.value = withSpring(Math.max(0, Math.min(100, progress)), {
      damping: 20,
      stiffness: 90,
    });
  }, [progress]);

  useEffect(() => {
    if (showShimmer && progress < 100) {
      // Shimmer animation
      shimmerTranslate.value = withRepeat(
        withSequence(
          withTiming(200, { duration: 1500 }),
          withTiming(-200, { duration: 0 })
        ),
        -1,
        false
      );
    }
  }, [showShimmer, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <Animated.View style={[styles.progress, progressStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {showShimmer && progress < 100 && (
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          )}
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  shimmerGradient: {
    flex: 1,
  },
});
