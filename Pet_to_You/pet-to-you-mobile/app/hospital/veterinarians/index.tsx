/**
 * Veterinarians List Screen
 * Hospital staff management - list view
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { VeterinarianList } from '@/components/veterinarian';

// TODO: Get from auth context
const MOCK_HOSPITAL_ID = 'hospital-1';

export default function VeterinariansScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '수의사 관리',
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/hospital/veterinarians/create')}
              style={styles.headerButton}
            >
              <Ionicons name="add" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <VeterinarianList hospitalId={MOCK_HOSPITAL_ID} />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/hospital/veterinarians/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButton: {
    marginRight: 8,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
