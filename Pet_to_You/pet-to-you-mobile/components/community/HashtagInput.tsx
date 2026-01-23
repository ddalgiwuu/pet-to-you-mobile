/**
 * HashtagInput Component
 * Input field for adding hashtags with auto-detection and chip display
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import HashtagChip from './HashtagChip';

interface HashtagInputProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  maxHashtags?: number;
  placeholder?: string;
}

export default function HashtagInput({
  hashtags,
  onHashtagsChange,
  maxHashtags = 10,
  placeholder = '#해시태그를 입력하세요',
}: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const extractHashtags = (text: string): string[] => {
    // Extract all hashtags from text
    const hashtagRegex = /#[가-힣a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map((tag) => tag.substring(1)); // Remove # prefix
  };

  const handleTextChange = (text: string) => {
    setInputValue(text);

    // Extract hashtags from input
    if (text.includes('#')) {
      const tags = extractHashtags(text);

      // Get unique tags and limit to maxHashtags
      const uniqueTags = Array.from(new Set([...hashtags, ...tags])).slice(0, maxHashtags);

      if (uniqueTags.length !== hashtags.length) {
        onHashtagsChange(uniqueTags);
      }

      // Clear input after extracting hashtags
      if (tags.length > 0) {
        setInputValue('');
      }
    }
  };

  const handleRemoveHashtag = (index: number) => {
    const newHashtags = hashtags.filter((_, i) => i !== index);
    onHashtagsChange(newHashtags);
  };

  return (
    <View style={styles.container}>
      {/* Hashtag Chips */}
      {hashtags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {hashtags.map((tag, index) => (
            <HashtagChip
              key={index}
              tag={tag}
              showRemove
              onRemove={() => handleRemoveHashtag(index)}
            />
          ))}
        </ScrollView>
      )}

      {/* Input Field */}
      {hashtags.length < maxHashtags && (
        <TextInput
          value={inputValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      {/* Helper Text */}
      <Text style={styles.helperText}>
        {hashtags.length}/{maxHashtags} • '#'을 붙여서 입력하세요 (예: #강아지 #산책)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  input: {
    ...typography.body1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text.primary,
  },
  helperText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
  },
});
