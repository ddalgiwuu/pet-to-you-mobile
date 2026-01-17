/**
 * Component Showcase Example
 * Demonstrates usage of all Toss-inspired UI components
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, Input, Badge, Modal, ProgressBar, Switch } from '../ui';
import { FloatingCard, SpringButton, AnimatedCounter } from '../animations';
import { colors, spacing, typography } from '@/constants/theme';

export const ComponentShowcase: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(65);
  const [counter, setCounter] = useState(1234);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Buttons</Text>
      <View style={styles.section}>
        <Button title="Primary Button" onPress={() => console.log('Primary pressed')} />
        <Button
          title="Secondary Button"
          variant="secondary"
          onPress={() => console.log('Secondary pressed')}
        />
        <Button
          title="Outline Button"
          variant="outline"
          onPress={() => console.log('Outline pressed')}
        />
        <Button
          title="Ghost Button"
          variant="ghost"
          onPress={() => console.log('Ghost pressed')}
        />
        <Button
          title="Loading Button"
          loading
          onPress={() => console.log('Loading pressed')}
        />
        <Button
          title="Disabled Button"
          disabled
          onPress={() => console.log('Disabled pressed')}
        />
      </View>

      <Text style={styles.sectionTitle}>Cards</Text>
      <View style={styles.section}>
        <Card onPress={() => console.log('Card pressed')}>
          <Text style={styles.cardText}>Pressable Card with Gradient Border</Text>
        </Card>

        <FloatingCard>
          <Card glassEffect>
            <Text style={styles.cardText}>Floating Card with Glass Effect</Text>
          </Card>
        </FloatingCard>

        <Card onLongPress={() => console.log('Long press')} gradientBorder={false}>
          <Text style={styles.cardText}>Card with Long Press (no gradient)</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Inputs</Text>
      <View style={styles.section}>
        <Input
          label="Email"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          value="correct"
          success
          placeholder="Enter password"
          secureTextEntry
        />

        <Input
          label="Error Input"
          value="wrong"
          error="This field is required"
          placeholder="Error state"
        />
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={[styles.section, styles.badgeContainer]}>
        <Badge label="Primary" variant="primary" />
        <Badge label="Secondary" variant="secondary" />
        <Badge label="Success" variant="success" />
        <Badge label="Error" variant="error" />
        <Badge
          label="Removable"
          variant="primary"
          onRemove={() => console.log('Badge removed')}
        />
        <Badge label="Large" variant="primary" size="large" />
        <Badge label="Small" variant="secondary" size="small" />
      </View>

      <Text style={styles.sectionTitle}>Progress Bar</Text>
      <View style={styles.section}>
        <ProgressBar progress={progress} />
        <View style={styles.buttonRow}>
          <Button
            title="Increase"
            size="small"
            onPress={() => setProgress(Math.min(100, progress + 10))}
          />
          <Button
            title="Decrease"
            size="small"
            variant="outline"
            onPress={() => setProgress(Math.max(0, progress - 10))}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Switch</Text>
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable notifications</Text>
          <Switch value={switchValue} onValueChange={setSwitchValue} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Disabled switch</Text>
          <Switch value={false} onValueChange={() => {}} disabled />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Animated Counter</Text>
      <View style={styles.section}>
        <AnimatedCounter value={counter} prefix="$" decimals={2} />
        <View style={styles.buttonRow}>
          <Button
            title="Increase"
            size="small"
            onPress={() => setCounter(counter + 1000)}
          />
          <Button
            title="Decrease"
            size="small"
            variant="outline"
            onPress={() => setCounter(Math.max(0, counter - 1000))}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Modal</Text>
      <View style={styles.section}>
        <Button title="Open Modal" onPress={() => setModalVisible(true)} />
      </View>

      <Text style={styles.sectionTitle}>Spring Button</Text>
      <View style={styles.section}>
        <SpringButton style={styles.springButton} stiffness={200} damping={10}>
          <Text style={styles.springButtonText}>Press me for spring effect!</Text>
        </SpringButton>
      </View>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Example Modal"
      >
        <Text style={styles.modalText}>
          This is a Toss-style bottom sheet modal with pan gesture support.
        </Text>
        <Text style={styles.modalText}>Swipe down or tap the backdrop to close.</Text>
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  cardText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.body1,
    color: colors.text.primary,
  },
  modalText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  springButton: {
    backgroundColor: colors.accent,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  springButtonText: {
    ...typography.heading3,
    color: colors.text.primary,
  },
});
