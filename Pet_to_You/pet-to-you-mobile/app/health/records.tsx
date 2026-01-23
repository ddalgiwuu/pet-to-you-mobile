/**
 * Health Records Screen
 * View pet health history, vaccinations, allergies, and medical records
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { usePets, Pet } from '@/hooks/usePets';

export default function HealthRecordsScreen() {
  const router = useRouter();
  const { data: pets = [] } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    pets.length > 0 ? pets[0].id : null
  );

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // Check if vaccination is upcoming within 30 days
  const isVaccinationUpcoming = (nextDate?: string) => {
    if (!nextDate) return false;
    const next = new Date(nextDate);
    const now = new Date();
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>건강 기록</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="medical-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>등록된 반려동물이 없습니다</Text>
          <Text style={styles.emptySubtitle}>먼저 반려동물을 등록해주세요</Text>
          <Pressable
            onPress={() => router.push('/pets/register' as any)}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>펫 등록하기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>건강 기록</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>반려동물 선택</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petSelectorScroll}
          >
            {pets.map((pet) => (
              <Pressable
                key={pet.id}
                onPress={() => setSelectedPetId(pet.id)}
                style={[
                  styles.petSelector,
                  selectedPetId === pet.id && styles.petSelectorActive,
                ]}
              >
                <Ionicons
                  name={pet.species === 'dog' ? 'paw' : pet.species === 'cat' ? 'paw-outline' : 'paw'}
                  size={20}
                  color={selectedPetId === pet.id ? colors.background : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.petSelectorText,
                    selectedPetId === pet.id && styles.petSelectorTextActive,
                  ]}
                >
                  {pet.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {selectedPet && (
          <>
            {/* Vaccinations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>예방접종 이력</Text>
              {selectedPet.vaccinations && selectedPet.vaccinations.length > 0 ? (
                <View style={styles.card}>
                  {selectedPet.vaccinations.map((vaccination, index) => (
                    <View
                      key={index}
                      style={[
                        styles.recordItem,
                        index === selectedPet.vaccinations!.length - 1 && styles.recordItemLast,
                      ]}
                    >
                      <View style={styles.recordLeft}>
                        <View style={styles.recordIconContainer}>
                          <Ionicons name="shield-checkmark" size={20} color="#4ECDC4" />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordTitle}>{vaccination.name}</Text>
                          <Text style={styles.recordDate}>접종일: {formatDate(vaccination.date)}</Text>
                          {vaccination.nextDate && (
                            <Text
                              style={[
                                styles.recordNextDate,
                                isVaccinationUpcoming(vaccination.nextDate) && styles.recordNextDateUrgent,
                              ]}
                            >
                              다음 접종: {formatDate(vaccination.nextDate)}
                              {isVaccinationUpcoming(vaccination.nextDate) && ' (곧 예정)'}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="shield-outline" size={32} color={colors.text.tertiary} />
                  <Text style={styles.emptyCardText}>예방접종 기록이 없습니다</Text>
                </View>
              )}
            </View>

            {/* Allergies */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>알레르기</Text>
              {selectedPet.allergies && selectedPet.allergies.length > 0 ? (
                <View style={styles.card}>
                  <View style={styles.tagContainer}>
                    {selectedPet.allergies.map((allergy, index) => (
                      <View key={index} style={styles.tag}>
                        <Ionicons name="warning" size={14} color="#FF6B6B" />
                        <Text style={styles.tagText}>{allergy}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="checkmark-circle-outline" size={32} color="#4ECDC4" />
                  <Text style={styles.emptyCardText}>알려진 알레르기가 없습니다</Text>
                </View>
              )}
            </View>

            {/* Diseases */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>질병 이력</Text>
              {selectedPet.diseases && selectedPet.diseases.length > 0 ? (
                <View style={styles.card}>
                  <View style={styles.tagContainer}>
                    {selectedPet.diseases.map((disease, index) => (
                      <View key={index} style={styles.diseaseTag}>
                        <Ionicons name="medical" size={14} color="#FFE66D" />
                        <Text style={styles.diseaseTagText}>{disease}</Text>
                      </View>
                    ))}
                  </View>
                  {selectedPet.specialNeeds && (
                    <View style={styles.specialNeedsContainer}>
                      <Text style={styles.specialNeedsLabel}>특이사항</Text>
                      <Text style={styles.specialNeedsText}>{selectedPet.specialNeeds}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="heart-outline" size={32} color="#4ECDC4" />
                  <Text style={styles.emptyCardText}>질병 이력이 없습니다</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>기본 정보</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>생년월일</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedPet.birthDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>성별</Text>
                  <Text style={styles.infoValue}>
                    {selectedPet.gender === 'male' ? '수컷' : selectedPet.gender === 'female' ? '암컷' : '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>체중</Text>
                  <Text style={styles.infoValue}>{selectedPet.weight ? `${selectedPet.weight}kg` : '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>중성화</Text>
                  <Text style={styles.infoValue}>
                    {selectedPet.neutered !== undefined
                      ? selectedPet.neutered
                        ? '완료'
                        : '미완료'
                      : '-'}
                  </Text>
                </View>
                {selectedPet.microchipId && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>마이크로칩</Text>
                    <Text style={styles.infoValue}>{selectedPet.microchipId}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading2,
    fontSize: 18,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  petSelectorScroll: {
    gap: 8,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petSelectorActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  petSelectorText: {
    ...typography.body2,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  petSelectorTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    ...shadows.small,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  recordItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  recordLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC420',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    gap: 4,
  },
  recordTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordDate: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.secondary,
  },
  recordNextDate: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  recordNextDateUrgent: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B6B15',
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.body2,
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  diseaseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFE66D30',
    borderRadius: borderRadius.full,
  },
  diseaseTagText: {
    ...typography.body2,
    fontSize: 13,
    color: '#D4A400',
    fontWeight: '500',
  },
  specialNeedsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  specialNeedsLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  specialNeedsText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  emptyButtonText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.background,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  emptyCardText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
