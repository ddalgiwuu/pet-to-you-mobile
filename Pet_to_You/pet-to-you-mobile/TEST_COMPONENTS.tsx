/**
 * Quick Integration Test for Component Library
 * Uncomment this file in your app to test all components
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Input, Badge, Modal, ProgressBar, Switch } from './components/ui';
import { FloatingCard, SpringButton, AnimatedCounter } from './components/animations';
import { colors, spacing, typography } from './constants/theme';

export const ComponentTest = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress] = useState(65);
  const [counter] = useState(1234);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Component Library Test</Text>

      {/* Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>
        <Button title="Primary" onPress={() => console.log('Primary')} />
        <Button title="Secondary" variant="secondary" onPress={() => {}} />
        <Button title="Outline" variant="outline" onPress={() => {}} />
        <Button title="Loading" loading onPress={() => {}} />
      </View>

      {/* Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards</Text>
        <Card onPress={() => console.log('Card pressed')}>
          <Text>Basic Card</Text>
        </Card>
        <FloatingCard>
          <Card>
            <Text>Floating Card</Text>
          </Card>
        </FloatingCard>
      </View>

      {/* Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Input</Text>
        <Input
          label="Email"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter email"
        />
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.row}>
          <Badge label="Primary" />
          <Badge label="Success" variant="success" />
          <Badge label="Error" variant="error" />
        </View>
      </View>

      {/* Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <ProgressBar progress={progress} />
      </View>

      {/* Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch</Text>
        <View style={styles.row}>
          <Text>Toggle</Text>
          <Switch value={switchValue} onValueChange={setSwitchValue} />
        </View>
      </View>

      {/* Counter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Counter</Text>
        <AnimatedCounter value={counter} prefix="$" decimals={2} />
      </View>

      {/* Modal Trigger */}
      <View style={styles.section}>
        <Button title="Open Modal" onPress={() => setModalVisible(true)} />
      </View>

      {/* Spring Button */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spring Button</Text>
        <SpringButton style={styles.springButton}>
          <Text style={styles.springText}>Press Me!</Text>
        </SpringButton>
      </View>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Test Modal">
        <Text>This is a test modal</Text>
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.heading1,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  springButton: {
    backgroundColor: colors.accent,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  springText: {
    ...typography.heading3,
  },
});

export default ComponentTest;
