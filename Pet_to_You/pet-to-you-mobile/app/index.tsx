/**
 * Splash Screen with 3D animated pet and logo reveal
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { colors, animations } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const petRotation = useSharedValue(0);
  const petScale = useSharedValue(0.5);

  useEffect(() => {
    // Start animations
    logoScale.value = withSequence(
      withSpring(1.2, animations.spring.bouncy),
      withSpring(1, animations.spring.gentle)
    );

    logoOpacity.value = withTiming(1, {
      duration: animations.duration.slow,
      easing: Easing.ease,
    });

    petRotation.value = withTiming(360, {
      duration: 2000,
      easing: Easing.ease,
    });

    petScale.value = withSpring(1, animations.spring.bouncy);

    // Navigate after animation
    const timer = setTimeout(() => {
      runOnJS(navigate)();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const navigate = () => {
    if (!hasCompletedOnboarding) {
      router.replace('/(auth)/onboarding');
    } else if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const petStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${petRotation.value}deg` },
      { scale: petScale.value },
    ],
  }));

  return (
    <LinearGradient
      colors={colors.gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* 3D Pet Placeholder - Replace with Spline component */}
        <Animated.View style={[styles.petContainer, petStyle]}>
          <View style={styles.petPlaceholder}>
            <Animated.Text style={[styles.petEmoji, logoStyle]}>
              🐶
            </Animated.Text>
          </View>
        </Animated.View>

        {/* Logo */}
        <Animated.Text style={[styles.logo, logoStyle]}>
          Pet to You
        </Animated.Text>
        <Animated.Text style={[styles.tagline, logoStyle]}>
          반려동물 케어의 시작
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    marginBottom: 40,
  },
  petPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 100,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
    textAlign: 'center',
  },
});
