/**
 * CommunitySearchBar Component
 * Search bar with filter options for community posts
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

export type SearchFilter = 'all' | 'title' | 'content' | 'author' | 'hashtag';

interface CommunitySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  filter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
  placeholder?: string;
}

const FILTER_OPTIONS: { id: SearchFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'title', label: '제목' },
  { id: 'content', label: '내용' },
  { id: 'author', label: '작성자' },
  { id: 'hashtag', label: '해시태그' },
];

export default function CommunitySearchBar({
  value,
  onChangeText,
  filter,
  onFilterChange,
  placeholder = '검색어를 입력하세요',
}: CommunitySearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.tertiary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          </Pressable>
        )}
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Ionicons name="options" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Filter Pills */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {FILTER_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => {
                onFilterChange(option.id);
                setShowFilters(false);
              }}
              style={[
                styles.filterPill,
                filter === option.id && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === option.id && styles.filterPillTextActive,
                ]}
              >
                {option.label}
              </Text>
              {filter === option.id && (
                <Ionicons name="checkmark" size={16} color={colors.background} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Active Filter Badge */}
      {filter !== 'all' && (
        <View style={styles.activeFilterBadge}>
          <Text style={styles.activeFilterText}>
            {FILTER_OPTIONS.find((f) => f.id === filter)?.label}에서 검색 중
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    ...typography.body1,
    flex: 1,
    color: colors.text.primary,
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.secondary,
  },
  filterPillTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  activeFilterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
