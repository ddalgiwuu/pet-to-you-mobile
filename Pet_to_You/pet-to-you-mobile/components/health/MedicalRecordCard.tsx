/**
 * Medical Record Card Component
 * Enhanced card display with cost summary, insurance status, and action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MedicalRecord } from '@/types';
import { colors, typography, spacing, borderRadius, shadows, theme } from '@/constants/theme';

interface Props {
  record: MedicalRecord;
  onEdit?: () => void;
  onClaim?: () => void;
  showActions?: boolean;
}

export default function MedicalRecordCard({
  record,
  onEdit,
  onClaim,
  showActions = true,
}: Props) {
  const router = useRouter();

  // === Calculated Values ===
  const totalCost = record.actualCost || record.estimatedCost || 0;
  const insuranceCoverage = record.payment?.insuranceCoverage || 0;
  const selfPayment = record.payment?.selfPayment || 0;
  const documentCount = record.documents?.length || 0;

  // === Type Badge ===
  const getTypeBadge = () => {
    const badges = {
      checkup: { label: '일반', color: theme.colors.info, bg: theme.colors.infoLight },
      surgery: { label: '수술', color: theme.colors.warning, bg: theme.colors.warningLight },
      emergency: { label: '응급', color: theme.colors.error, bg: theme.colors.errorLight },
      vaccination: { label: '예방접종', color: theme.colors.success, bg: theme.colors.successLight },
    };
    return badges[record.type] || badges.checkup;
  };

  const typeBadge = getTypeBadge();

  // === Insurance Status Badge ===
  const getInsuranceStatusBadge = () => {
    if (!record.claimStatus) {
      return record.isInsuranceCovered
        ? { label: '청구 가능', color: theme.colors.success, bg: theme.colors.successLight }
        : null;
    }

    const statusBadges = {
      draft: { label: '작성중', color: theme.colors.gray600, bg: theme.colors.gray100 },
      submitted: { label: '제출됨', color: theme.colors.info, bg: theme.colors.infoLight },
      reviewing: { label: '검토중', color: theme.colors.warning, bg: theme.colors.warningLight },
      approved: { label: '승인됨', color: theme.colors.success, bg: theme.colors.successLight },
      rejected: { label: '거부됨', color: theme.colors.error, bg: theme.colors.errorLight },
      paid: { label: '지급완료', color: theme.colors.success, bg: theme.colors.successLight },
    };

    return statusBadges[record.claimStatus];
  };

  const insuranceStatusBadge = getInsuranceStatusBadge();

  const canEdit = !record.claimStatus || record.claimStatus === 'draft';
  const canClaim = !record.claimStatus && record.isInsuranceCovered && totalCost > 0;

  const handleCardPress = () => {
    router.push(`/health/${record.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={
                record.type === 'emergency'
                  ? 'medkit'
                  : record.type === 'surgery'
                  ? 'bandage'
                  : record.type === 'vaccination'
                  ? 'fitness'
                  : 'medical'
              }
              size={20}
              color={typeBadge.color}
            />
          </View>
          <Text style={styles.diagnosis} numberOfLines={1}>
            {record.diagnosis}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: typeBadge.bg }]}>
            <Text style={[styles.badgeText, { color: typeBadge.color }]}>
              {typeBadge.label}
            </Text>
          </View>
          {insuranceStatusBadge && (
            <View style={[styles.badge, { backgroundColor: insuranceStatusBadge.bg }]}>
              <Text style={[styles.badgeText, { color: insuranceStatusBadge.color }]}>
                {insuranceStatusBadge.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Hospital & Date */}
      <View style={styles.infoRow}>
        <Ionicons name="business-outline" size={16} color={theme.colors.gray500} />
        <Text style={styles.infoText} numberOfLines={1}>
          {record.hospitalName || '병원 정보 없음'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color={theme.colors.gray500} />
        <Text style={styles.infoText}>
          {new Date(record.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Cost Summary */}
      {totalCost > 0 && (
        <View style={styles.costSection}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>총 진료비</Text>
            <Text style={styles.costValue}>₩{totalCost.toLocaleString()}</Text>
          </View>

          {insuranceCoverage > 0 && (
            <>
              <View style={styles.costRow}>
                <Text style={styles.costLabelSmall}>보험 적용</Text>
                <Text style={styles.costValueSuccess}>
                  -₩{insuranceCoverage.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.costRow, styles.finalCostRow]}>
                <Text style={styles.costLabelBold}>본인 부담</Text>
                <Text style={styles.costValueBold}>₩{selfPayment.toLocaleString()}</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Documents */}
      {documentCount > 0 && (
        <View style={styles.documentsRow}>
          <Ionicons name="document-text-outline" size={16} color={theme.colors.gray500} />
          <Text style={styles.documentsText}>
            첨부서류 {documentCount}개
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && (canEdit || canClaim) && (
        <View style={styles.actions}>
          {canEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                if (onEdit) {
                  onEdit();
                } else {
                  router.push(`/health/edit/${record.id}`);
                }
              }}
            >
              <Ionicons name="pencil" size={18} color={theme.colors.gray700} />
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
          )}

          {canClaim && (
            <TouchableOpacity
              style={[styles.actionButton, styles.claimButton]}
              onPress={(e) => {
                e.stopPropagation();
                if (onClaim) {
                  onClaim();
                } else {
                  router.push(`/insurance/claim/review/${record.id}`);
                }
              }}
            >
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.white} />
              <Text style={styles.claimButtonText}>
                청구하기 ₩{insuranceCoverage.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Claim Status Info */}
      {record.claimStatus === 'paid' && (
        <View style={styles.paidBanner}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.paidText}>청구 지급 완료</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagnosis: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.gray600,
  },
  costSection: {
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  costLabel: {
    fontSize: 14,
    color: theme.colors.gray700,
  },
  costLabelSmall: {
    fontSize: 13,
    color: theme.colors.gray600,
  },
  costLabelBold: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  costValueSuccess: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  costValueBold: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  finalCostRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 8,
    marginTop: 6,
    marginBottom: 0,
  },
  documentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  documentsText: {
    fontSize: 13,
    color: theme.colors.gray500,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray100,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray700,
  },
  claimButton: {
    backgroundColor: theme.colors.primary,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.successLight,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  paidText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
});
