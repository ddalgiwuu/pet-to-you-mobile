/**
 * FilterSheet Component (Simplified for Expo Go)
 * Uses Modal instead of BottomSheet for compatibility
 */

import React, { useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface FilterOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
}

export interface FilterGroup {
  title: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface FilterSheetProps {
  filters: FilterGroup[];
  onFilterChange: (groupIndex: number, optionId: string) => void;
  onReset?: () => void;
  onApply?: () => void;
}

// Export type for ref compatibility
export interface FilterSheetRef {
  expand: () => void;
  close: () => void;
}

export const FilterSheet = forwardRef<FilterSheetRef, FilterSheetProps>(
  ({ filters, onFilterChange, onReset, onApply }, ref) => {
    const [visible, setVisible] = useState(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      expand: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const handleFilterPress = useCallback(
      (groupIndex: number, optionId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFilterChange(groupIndex, optionId);
      },
      [onFilterChange]
    );

    const handleReset = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onReset?.();
    }, [onReset]);

    const handleApply = useCallback(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onApply?.();
      setVisible(false);
    }, [onApply]);

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.headerContent}>
                <Text style={styles.title}>필터</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filters Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {filters.map((group, groupIndex) => (
                <View key={groupIndex} style={styles.filterGroup}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <View style={styles.optionsContainer}>
                    {group.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.filterOption,
                          option.selected && styles.filterOptionSelected,
                        ]}
                        onPress={() => handleFilterPress(groupIndex, option.id)}
                        activeOpacity={0.7}
                      >
                        {option.icon && (
                          <Ionicons
                            name={option.icon}
                            size={20}
                            color={option.selected ? '#fff' : '#666'}
                            style={styles.filterIcon}
                          />
                        )}
                        <Text
                          style={[
                            styles.filterLabel,
                            option.selected && styles.filterLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {option.selected && (
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Text style={styles.resetText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.7}
              >
                <Text style={styles.applyText}>적용하기</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 34,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    maxHeight: 400,
  },
  filterGroup: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    gap: 6,
  },
  filterOptionSelected: {
    backgroundColor: '#42A5F5',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterLabelSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#42A5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
