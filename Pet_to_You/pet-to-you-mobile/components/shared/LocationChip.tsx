import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LocationChipProps {
  district: string;
  onPress: () => void;
  loading?: boolean;
}

export default function LocationChip({ district, onPress, loading = false }: LocationChipProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const displayText = loading ? '위치 확인 중...' : district;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.text} numberOfLines={1}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </View>
      
      {loading && <View style={styles.loadingOverlay} />}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    gap: 4,
  },
  icon: {
    fontSize: 14,
    lineHeight: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 16,
    maxWidth: 120,
  },
  arrow: {
    fontSize: 10,
    color: colors.text.tertiary,
    lineHeight: 12,
    marginLeft: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
  },
});
