/**
 * Breed Selector Component - SectionList version
 * Categorized breed selection with search functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SectionList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  getBreedCategories,
  getPopularBreeds,
  BreedOption,
  BreedCategory,
} from '@/constants/breeds';

interface BreedSelectorProps {
  species: 'dog' | 'cat' | 'other';
  selectedBreed?: string;
  onSelectBreed: (breed: string) => void;
}

export const BreedSelector: React.FC<BreedSelectorProps> = ({
  species,
  selectedBreed,
  onSelectBreed,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customBreed, setCustomBreed] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const categories = getBreedCategories(species);
  const popularBreeds = getPopularBreeds(species);

  // Filter breeds based on search across all categories
  const getFilteredCategories = (): BreedCategory[] => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: BreedCategory[] = [];

    categories.forEach((category) => {
      const matchingBreeds = category.data.filter((breed) => {
        const koreanMatch = breed.name.toLowerCase().includes(query);
        const englishMatch = breed.nameEn?.toLowerCase().includes(query) || false;
        return koreanMatch || englishMatch;
      });

      if (matchingBreeds.length > 0) {
        filtered.push({
          title: category.title,
          data: matchingBreeds,
        });
      }
    });

    return filtered;
  };

  const displayCategories = getFilteredCategories();
  const totalResults = displayCategories.reduce((sum, cat) => sum + cat.data.length, 0);

  const handleSelectBreed = (breed: BreedOption) => {
    if (breed.id === 'other') {
      setIsCustom(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectBreed(breed.name);
    setModalVisible(false);
    setSearchQuery('');
    setIsCustom(false);
  };

  const handleCustomSubmit = () => {
    if (customBreed.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelectBreed(customBreed.trim());
      setModalVisible(false);
      setCustomBreed('');
      setSearchQuery('');
      setIsCustom(false);
    }
  };

  const handleOpenModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchQuery('');
    setIsCustom(false);
    setCustomBreed('');
  };

  const getSpeciesLabel = () => {
    switch (species) {
      case 'dog':
        return '강아지';
      case 'cat':
        return '고양이';
      default:
        return '반려동물';
    }
  };

  const renderBreedItem = ({ item }: { item: BreedOption }) => (
    <TouchableOpacity
      style={[
        styles.breedItem,
        selectedBreed === item.name && styles.breedItemSelected,
      ]}
      onPress={() => handleSelectBreed(item)}
      activeOpacity={0.8}
    >
      <View style={styles.breedInfo}>
        <Text
          style={[
            styles.breedName,
            selectedBreed === item.name && styles.breedNameSelected,
          ]}
        >
          {item.name}
        </Text>
        {item.nameEn && (
          <Text style={styles.breedNameEn}>{item.nameEn}</Text>
        )}
      </View>

      {selectedBreed === item.name && (
        <Ionicons name="checkmark-circle" size={24} color="#42A5F5" />
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: BreedCategory }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );

  return (
    <>
      {/* Input Trigger */}
      <TouchableOpacity
        style={[
          styles.inputTrigger,
          selectedBreed && styles.inputTriggerFilled,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.inputTriggerText,
            !selectedBreed && styles.inputTriggerPlaceholder,
          ]}
        >
          {selectedBreed || `품종을 선택하세요`}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={selectedBreed ? '#333' : '#999'}
        />
      </TouchableOpacity>

      {/* Breed Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {getSpeciesLabel()} 품종 선택
            </Text>
            <View style={styles.closeButton} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="품종 검색 (예: 말티즈, poodle)"
              placeholderTextColor="#999"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Custom Breed Input */}
          {isCustom ? (
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>직접 입력하기</Text>
              <TextInput
                style={styles.customInput}
                value={customBreed}
                onChangeText={setCustomBreed}
                placeholder="품종을 입력하세요"
                placeholderTextColor="#ccc"
                autoFocus
              />
              <View style={styles.customButtons}>
                <TouchableOpacity
                  style={styles.customCancelButton}
                  onPress={() => setIsCustom(false)}
                >
                  <Text style={styles.customCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.customSubmitButton,
                    !customBreed.trim() && styles.customSubmitButtonDisabled,
                  ]}
                  onPress={handleCustomSubmit}
                  disabled={!customBreed.trim()}
                >
                  <Text style={styles.customSubmitText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Popular Breeds - Horizontal Scroll */}
              {!searchQuery.trim() && popularBreeds.length > 0 && (
                <View style={styles.popularSection}>
                  <View style={styles.popularTitleRow}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.popularTitle}>인기 품종</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.popularScroll}
                  >
                    {popularBreeds.map((breed) => (
                      <TouchableOpacity
                        key={breed.id}
                        style={[
                          styles.popularChip,
                          selectedBreed === breed.name && styles.popularChipSelected,
                        ]}
                        onPress={() => handleSelectBreed(breed)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.popularChipText,
                            selectedBreed === breed.name && styles.popularChipTextSelected,
                          ]}
                        >
                          {breed.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Results Count */}
              {searchQuery.trim() && (
                <View style={styles.resultsCount}>
                  <Text style={styles.resultsCountText}>
                    검색 결과 {totalResults}개
                  </Text>
                </View>
              )}

              {/* Categorized Breeds - SectionList */}
              {totalResults === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
                  <Text style={styles.emptyText}>
                    "{searchQuery}"와(과) 일치하는 품종이 없어요
                  </Text>
                  <TouchableOpacity
                    style={styles.customInputButton}
                    onPress={() => {
                      setIsCustom(true);
                      setCustomBreed(searchQuery);
                    }}
                  >
                    <Text style={styles.customInputButtonText}>
                      "{searchQuery}" 직접 입력하기
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <SectionList
                  sections={displayCategories}
                  keyExtractor={(item) => item.id}
                  renderItem={renderBreedItem}
                  renderSectionHeader={renderSectionHeader}
                  stickySectionHeadersEnabled={true}
                  contentContainerStyle={styles.sectionListContent}
                  showsVerticalScrollIndicator={true}
                  initialNumToRender={20}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Input Trigger
  inputTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputTriggerFilled: {
    borderColor: '#42A5F5',
  },
  inputTriggerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputTriggerPlaceholder: {
    color: '#ccc',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  // Results Count
  resultsCount: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#42A5F5',
  },

  // Custom Input
  customInputContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  customInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  customButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  customCancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  customCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  customSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#42A5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  customSubmitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  customSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  customInputButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginTop: 16,
  },
  customInputButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#42A5F5',
    textAlign: 'center',
  },

  // Popular Section
  popularSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  popularTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  popularTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  popularScroll: {
    gap: 8,
  },
  popularChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  popularChipSelected: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB800',
  },
  popularChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  popularChipTextSelected: {
    color: '#F57C00',
  },

  // SectionList
  sectionListContent: {
    paddingBottom: 20,
  },

  // Section Header
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderLine: {
    height: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },

  // Breed Items
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breedItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  breedNameSelected: {
    color: '#42A5F5',
  },
  breedNameEn: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BreedSelector;
