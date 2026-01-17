/**
 * Developer menu overlay for testing features
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Button } from '@/components/ui';
import { useDevStore } from '@/store/devStore';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface DeveloperMenuProps {
  visible: boolean;
  onClose: () => void;
  onTestLogin: () => void;
  onGoHome: () => void;
}

export function DeveloperMenu({ visible, onClose, onTestLogin, onGoHome }: DeveloperMenuProps) {
  const { apiEndpoint, setApiEndpoint, testCredentials } = useDevStore();
  const [tempEndpoint, setTempEndpoint] = React.useState(apiEndpoint);

  const handleSaveEndpoint = () => {
    setApiEndpoint(tempEndpoint);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.menu}
        >
          <View style={styles.header}>
            <Text style={styles.title}>🛠️ Developer Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <Button
              title="🏠 홈 화면으로 바로 가기"
              onPress={onGoHome}
              variant="secondary"
              fullWidth
            />

            <Button
              title="🔐 테스트 계정으로 로그인"
              onPress={onTestLogin}
              variant="outline"
              fullWidth
            />

            <View style={styles.credentials}>
              <Text style={styles.credentialLabel}>Test Account:</Text>
              <Text style={styles.credentialValue}>{testCredentials.email}</Text>
              <Text style={styles.credentialValue}>{testCredentials.password}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Configuration</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>API Endpoint</Text>
              <TextInput
                style={styles.input}
                value={tempEndpoint}
                onChangeText={setTempEndpoint}
                placeholder="https://api.pet-to-you.com"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Button
              title="💾 Save Endpoint"
              onPress={handleSaveEndpoint}
              variant="primary"
              fullWidth
            />
          </View>

          <Text style={styles.footer}>
            Developer mode is enabled. Triple tap logo to toggle.
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading2,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  credentials: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  credentialLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  credentialValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  inputContainer: {
    gap: spacing.xs,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text.primary,
  },
  footer: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
