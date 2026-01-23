import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const SERVICE_TYPES = [
  { id: 'general', label: '일반 진료', icon: 'medical' as const, color: '#42A5F5' },
  { id: 'vaccination', label: '예방 접종', icon: 'shield-checkmark' as const, color: '#66BB6A' },
  { id: 'emergency', label: '응급 진료', icon: 'warning' as const, color: '#FF5252' },
  { id: 'surgery', label: '수술', icon: 'cut' as const, color: '#FF9800' },
  { id: 'dental', label: '치과', icon: 'fitness' as const, color: '#AB47BC' },
  { id: 'checkup', label: '건강 검진', icon: 'pulse' as const, color: '#26C6DA' },
];

interface ServiceSelectorProps {
  selectedServiceId?: string;
  onSelectService: (serviceId: string) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedServiceId,
  onSelectService,
}) => {
  const handleSelectService = (serviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectService(serviceId);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>진료 유형을 선택하세요</Text>

      {SERVICE_TYPES.map((service, index) => (
        <Animated.View key={service.id} entering={FadeInDown.delay(index * 80)}>
          <TouchableOpacity
            style={[
              styles.serviceCard,
              selectedServiceId === service.id && styles.serviceCardSelected,
            ]}
            onPress={() => handleSelectService(service.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: service.color + '20' },
              ]}
            >
              <Ionicons
                name={service.icon}
                size={28}
                color={service.color}
              />
            </View>

            <Text style={styles.serviceLabel}>{service.label}</Text>

            <View
              style={[
                styles.checkbox,
                selectedServiceId === service.id && {
                  backgroundColor: service.color,
                  borderColor: service.color,
                },
              ]}
            >
              {selectedServiceId === service.id && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  serviceCardSelected: {
    borderColor: '#42A5F5',
    backgroundColor: '#E3F2FD',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceSelector;
