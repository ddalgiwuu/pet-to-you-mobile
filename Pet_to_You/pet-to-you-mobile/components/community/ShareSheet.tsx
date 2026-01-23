/**
 * ShareSheet Component
 * Bottom sheet with share options
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { copyLink, sharePost, shareToKakao } from '@/utils/share';

interface ShareOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  title: string;
  content?: string;
  imageUrl?: string;
}

export default function ShareSheet({
  visible,
  onClose,
  postId,
  title,
  content,
  imageUrl,
}: ShareSheetProps) {
  const shareOptions: ShareOption[] = [
    {
      id: '1',
      icon: 'copy-outline',
      label: '링크 복사',
      color: '#4ECDC4',
      onPress: async () => {
        await copyLink(postId);
        onClose();
      },
    },
    {
      id: '2',
      icon: 'share-outline',
      label: '더보기',
      color: '#95E1D3',
      onPress: async () => {
        await sharePost(title, postId);
        onClose();
      },
    },
    {
      id: '3',
      icon: 'chatbubble',
      label: '카카오톡',
      color: '#FFE66D',
      onPress: async () => {
        await shareToKakao(title, content || '', imageUrl);
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>공유하기</Text>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsGrid}>
            {shareOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={option.onPress}
                style={styles.optionButton}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Cancel Button */}
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  title: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.text.primary,
  },
  optionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
    justifyContent: 'space-around',
  },
  optionButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cancelButton: {
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
