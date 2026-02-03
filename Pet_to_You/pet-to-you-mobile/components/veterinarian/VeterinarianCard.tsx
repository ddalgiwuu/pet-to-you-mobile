import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Veterinarian } from '@/types';
import * as Haptics from 'expo-haptics';

export type VeterinarianCardVariant = 'selector' | 'dashboard' | 'detail';

interface VeterinarianCardProps {
  veterinarian: Veterinarian;
  variant?: VeterinarianCardVariant;
  isSelected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
}

export const VeterinarianCard: React.FC<VeterinarianCardProps> = ({
  veterinarian,
  variant = 'selector',
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onEdit();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onDelete();
    }
  };

  const handleToggleActive = () => {
    if (onToggleActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggleActive();
    }
  };

  const getWorkingDays = () => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const schedule = veterinarian.workingHours;
    const dayKeys: Array<keyof typeof schedule> = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    const workingDays = dayKeys
      .map((key, index) => (schedule[key].isWorking ? days[index] : null))
      .filter(Boolean)
      .join(', ');

    return workingDays || '휴무';
  };

  const getWorkingHours = () => {
    const schedule = veterinarian.workingHours;
    const firstWorkingDay = Object.values(schedule).find((day) => day.isWorking);
    return firstWorkingDay
      ? `${firstWorkingDay.startTime}-${firstWorkingDay.endTime}`
      : '휴무';
  };

  // Selector variant (고객용)
  if (variant === 'selector') {
    return (
      <TouchableOpacity
        style={[
          styles.selectorCard,
          isSelected && styles.selectorCardSelected,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.selectorContent}>
          <View style={styles.selectorPhoto}>
            {veterinarian.photo ? (
              <Image
                source={{ uri: veterinarian.photo }}
                style={styles.selectorPhotoImage}
              />
            ) : (
              <View style={styles.selectorPhotoPlaceholder}>
                <Ionicons name="medical" size={24} color="#999" />
              </View>
            )}
          </View>

          <View style={styles.selectorInfo}>
            <Text style={styles.selectorName}>
              {veterinarian.name} {veterinarian.title || '수의사'}
            </Text>
            <View style={styles.selectorMeta}>
              {veterinarian.specialization && veterinarian.specialization.length > 0 && (
                <Text style={styles.selectorSpecialty}>
                  {veterinarian.specialization.join(' · ')}
                </Text>
              )}
              {veterinarian.rating && (
                <View style={styles.selectorRating}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.selectorRatingText}>
                    {veterinarian.rating.toFixed(1)}
                  </Text>
                  {veterinarian.reviewCount && (
                    <Text style={styles.selectorReviewCount}>
                      ({veterinarian.reviewCount})
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectorCheckmark}>
              <Ionicons name="checkmark-circle" size={24} color="#42A5F5" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Dashboard variant (병원 대시보드용)
  if (variant === 'dashboard') {
    return (
      <View
        style={[
          styles.dashboardCard,
          !veterinarian.isActive && styles.dashboardCardInactive,
        ]}
      >
        <View style={styles.dashboardContent}>
          <View style={styles.dashboardPhoto}>
            {veterinarian.photo ? (
              <Image
                source={{ uri: veterinarian.photo }}
                style={styles.dashboardPhotoImage}
              />
            ) : (
              <View style={styles.dashboardPhotoPlaceholder}>
                <Ionicons name="medical" size={28} color="#999" />
              </View>
            )}
          </View>

          <View style={styles.dashboardInfo}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardName}>
                {veterinarian.name} {veterinarian.title || '수의사'}
              </Text>
              {!veterinarian.isActive && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>비활성</Text>
                </View>
              )}
            </View>

            {veterinarian.specialization && veterinarian.specialization.length > 0 && (
              <Text style={styles.dashboardSpecialty}>
                {veterinarian.specialization.join(' · ')}
              </Text>
            )}

            <Text style={styles.dashboardSchedule}>
              {getWorkingDays()}: {getWorkingHours()}
            </Text>
          </View>
        </View>

        <View style={styles.dashboardActions}>
          {onToggleActive && (
            <TouchableOpacity
              style={[
                styles.dashboardActionButton,
                veterinarian.isActive ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={handleToggleActive}
            >
              <Text
                style={[
                  styles.dashboardActionText,
                  veterinarian.isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {veterinarian.isActive ? '활성' : '비활성'}
              </Text>
            </TouchableOpacity>
          )}

          {onEdit && (
            <TouchableOpacity
              style={[styles.dashboardActionButton, styles.editButton]}
              onPress={handleEdit}
            >
              <Ionicons name="create" size={16} color="#42A5F5" />
              <Text style={[styles.dashboardActionText, styles.editText]}>
                편집
              </Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={[styles.dashboardActionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={16} color="#F44336" />
              <Text style={[styles.dashboardActionText, styles.deleteText]}>
                삭제
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Detail variant (상세 정보)
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <View style={styles.detailPhoto}>
          {veterinarian.photo ? (
            <Image
              source={{ uri: veterinarian.photo }}
              style={styles.detailPhotoImage}
            />
          ) : (
            <View style={styles.detailPhotoPlaceholder}>
              <Ionicons name="medical" size={40} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.detailInfo}>
          <Text style={styles.detailName}>
            {veterinarian.name} {veterinarian.title || '수의사'}
          </Text>

          {veterinarian.rating && (
            <View style={styles.detailRating}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.detailRatingText}>
                {veterinarian.rating.toFixed(1)}
              </Text>
              {veterinarian.reviewCount && (
                <Text style={styles.detailReviewCount}>
                  ({veterinarian.reviewCount}개 리뷰)
                </Text>
              )}
            </View>
          )}

          {veterinarian.specialization && veterinarian.specialization.length > 0 && (
            <View style={styles.detailSpecialties}>
              {veterinarian.specialization.map((spec, index) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyChipText}>{spec}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Contact Info */}
      {(veterinarian.phone || veterinarian.email) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>연락처</Text>
          {veterinarian.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.detailRowText}>{veterinarian.phone}</Text>
            </View>
          )}
          {veterinarian.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={16} color="#666" />
              <Text style={styles.detailRowText}>{veterinarian.email}</Text>
            </View>
          )}
        </View>
      )}

      {/* Working Hours */}
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>근무시간</Text>
        <Text style={styles.detailSchedule}>
          근무 요일: {getWorkingDays()}
        </Text>
        <Text style={styles.detailSchedule}>
          근무 시간: {getWorkingHours()}
        </Text>
        {veterinarian.breakTimes && veterinarian.breakTimes.length > 0 && (
          <Text style={styles.detailBreak}>
            휴게시간: {veterinarian.breakTimes.map((bt) => `${bt.startTime}-${bt.endTime}`).join(', ')}
          </Text>
        )}
      </View>

      {/* License */}
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>면허 정보</Text>
        <Text style={styles.detailLicense}>
          면허번호: {veterinarian.veterinarianLicense}
        </Text>
        <Text style={styles.detailConsultation}>
          진료시간: {veterinarian.consultationDuration}분
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Selector variant
  selectorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  selectorCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#42A5F5',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  selectorPhotoImage: {
    width: '100%',
    height: '100%',
  },
  selectorPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorInfo: {
    flex: 1,
    gap: 4,
  },
  selectorName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  selectorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  selectorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectorRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectorReviewCount: {
    fontSize: 12,
    color: '#999',
  },
  selectorCheckmark: {
    marginLeft: 'auto',
  },

  // Dashboard variant
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dashboardCardInactive: {
    opacity: 0.6,
  },
  dashboardContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dashboardPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  dashboardPhotoImage: {
    width: '100%',
    height: '100%',
  },
  dashboardPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardInfo: {
    flex: 1,
    gap: 4,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  inactiveBadge: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F44336',
  },
  dashboardSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  dashboardSchedule: {
    fontSize: 13,
    color: '#999',
  },
  dashboardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dashboardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#FFE0E0',
    borderColor: '#F44336',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#42A5F5',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  dashboardActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#F44336',
  },
  editText: {
    color: '#42A5F5',
  },
  deleteText: {
    color: '#F44336',
  },

  // Detail variant
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  detailPhotoImage: {
    width: '100%',
    height: '100%',
  },
  detailPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
    gap: 8,
  },
  detailName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailReviewCount: {
    fontSize: 14,
    color: '#999',
  },
  detailSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyChip: {
    backgroundColor: '#E1BEE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6A1B9A',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailRowText: {
    fontSize: 14,
    color: '#666',
  },
  detailSchedule: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailBreak: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  detailLicense: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailConsultation: {
    fontSize: 14,
    color: '#666',
  },
});

export default VeterinarianCard;
