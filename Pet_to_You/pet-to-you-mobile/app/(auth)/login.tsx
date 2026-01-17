/**
 * Enhanced login screen with modern design and developer mode
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Button, Input } from '@/components/ui';
import { Logo } from '@/components/shared/Logo';
import { DeveloperMenu } from '@/components/auth/DeveloperMenu';
import { useAuthStore } from '@/store/authStore';
import { useDevStore } from '@/store/devStore';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const router = useRouter();
  const { login, setLoading } = useAuthStore();
  const { isDevMode, toggleDevMode, testCredentials, loadDevSettings } = useDevStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDevMenu, setShowDevMenu] = useState(false);

  // Animation values
  const shakeX = useSharedValue(0);
  const logoScale = useSharedValue(1);
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDevSettings();
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  // Triple tap detection for developer mode
  const handleLogoPress = () => {
    tapCount.current += 1;

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 500);

    if (tapCount.current === 3) {
      tapCount.current = 0;
      toggleDevMode();
      Haptics.notificationAsync(
        isDevMode
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success
      );

      logoScale.value = withSequence(
        withSpring(0.8, { damping: 10 }),
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요');
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      // Mock login - replace with actual API call
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock-token-' + Date.now();
      login(mockUser, mockToken);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err) {
      setError('로그인에 실패했습니다');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    setEmail(testCredentials.email);
    setPassword(testCredentials.password);
    setShowDevMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleGoHome = () => {
    setShowDevMenu(false);
    router.replace('/(tabs)');
  };

  const handleSocialLogin = (provider: 'kakao' | 'naver' | 'apple') => {
    // TODO: Implement OAuth2 login
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(`${provider} 로그인은 준비 중입니다`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFB6C1', '#DDA0DD', '#9370DB']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo with triple-tap detection */}
            <AnimatedPressable onPress={handleLogoPress} style={logoAnimatedStyle}>
              <View style={styles.logoContainer}>
                <Logo size="large" animated />
                {isDevMode && (
                  <View style={styles.devBadge}>
                    <Text style={styles.devBadgeText}>DEV</Text>
                  </View>
                )}
              </View>
            </AnimatedPressable>

            <Text style={styles.tagline}>반려동물을 위한 모든 것</Text>

            {/* Glassmorphism login card */}
            <Animated.View style={[styles.card, shakeStyle]}>
              <Text style={styles.cardTitle}>로그인</Text>

              <Input
                label="이메일"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="비밀번호"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button title="로그인" onPress={handleLogin} fullWidth />

              {/* Developer mode button */}
              {isDevMode && (
                <Button
                  title="🛠️ 개발자 메뉴"
                  onPress={() => setShowDevMenu(true)}
                  variant="ghost"
                  fullWidth
                />
              )}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.line} />
              </View>

              {/* Social login buttons */}
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.kakaoButton]}
                  onPress={() => handleSocialLogin('kakao')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.socialButtonText}>카카오 로그인</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, styles.naverButton]}
                  onPress={() => handleSocialLogin('naver')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.socialButtonText}>네이버 로그인</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialLogin('apple')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                    Apple 로그인
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="회원가입"
                onPress={() => router.push('/(auth)/signup')}
                variant="ghost"
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Developer Menu */}
      <DeveloperMenu
        visible={showDevMenu}
        onClose={() => setShowDevMenu(false)}
        onTestLogin={handleTestLogin}
        onGoHome={handleGoHome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    paddingTop: spacing.xl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  devBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tagline: {
    ...typography.heading3,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    gap: spacing.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  naverButton: {
    backgroundColor: '#03C75A',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    ...typography.body1,
    fontWeight: '600',
    color: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
});
