/**
 * HashtagChip Component
 * Displays hashtag as a chip with optional remove button
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '@/constants/theme';

interface HashtagChipProps {
  tag: string;
  onPress?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export default function HashtagChip({
  tag,
  onPress,
  onRemove,
  showRemove = false,
}: HashtagChipProps) {
  const displayTag = tag.startsWith('#') ? tag : `#${tag}`;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, showRemove && styles.chipWithRemove]}
    >
      <Text style={styles.chipText}>{displayTag}</Text>
      {showRemove && onRemove && (
        <Pressable onPress={onRemove} style={styles.removeButton}>
          <Ionicons name="close-circle" size={16} color={colors.primary} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.full,
    gap: 4,
  },
  chipWithRemove: {
    paddingRight: 6,
  },
  chipText: {
    ...typography.body2,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  removeButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
