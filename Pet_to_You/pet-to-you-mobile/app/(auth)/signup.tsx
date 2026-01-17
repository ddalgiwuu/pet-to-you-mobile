/**
 * Signup screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { colors, typography, spacing } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSignup = async () => {
    // TODO: Implement signup
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>회원가입</Text>
        <Input label="이름" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <Input label="이메일" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" />
        <Input label="비밀번호" value={form.password} onChangeText={(password) => setForm({ ...form, password })} secureTextEntry />
        <Input label="비밀번호 확인" value={form.confirmPassword} onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })} secureTextEntry />
        <Button title="가입하기" onPress={handleSignup} fullWidth />
        <Button title="로그인으로 돌아가기" onPress={() => router.back()} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 60 },
  title: { ...typography.heading1, marginBottom: spacing.xl },
});
