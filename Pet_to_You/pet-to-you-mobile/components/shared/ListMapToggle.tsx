import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

export type ViewMode = 'list' | 'map';

interface ListMapToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  style?: any;
}

export const ListMapToggle: React.FC<ListMapToggleProps> = ({
  mode,
  onModeChange,
  style,
}) => {
  const isListMode = mode === 'list';

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = withSpring(isListMode ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [
        {
          translateX: interpolate(translateX, [0, 1], [0, 90]),
        },
      ],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => onModeChange('list')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="list"
          size={20}
          color={isListMode ? '#fff' : '#666'}
        />
        <Text style={[styles.buttonText, isListMode && styles.activeText]}>
          리스트
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onModeChange('map')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="map"
          size={20}
          color={!isListMode ? '#fff' : '#666'}
        />
        <Text style={[styles.buttonText, !isListMode && styles.activeText]}>
          지도
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: 86,
    backgroundColor: '#42A5F5',
    borderRadius: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    width: 90,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeText: {
    color: '#fff',
  },
});

export default ListMapToggle;
