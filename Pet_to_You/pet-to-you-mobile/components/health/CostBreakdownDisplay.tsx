/**
 * Cost Breakdown Display Component
 * Read-only display of medical costs with visual breakdown
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicalRecord } from '@/types';
import { theme } from '@/constants/theme';

interface Props {
  record: MedicalRecord;
  showInsuranceCalculation?: boolean;
}

export default function CostBreakdownDisplay({
  record,
  showInsuranceCalculation = true,
}: Props) {
  const costBreakdown = record.costBreakdown;
  const payment = record.payment;
  const totalCost = record.actualCost || record.estimatedCost || 0;

  if (!costBreakdown && !payment) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const costItems = [
    { label: '진찰료', value: costBreakdown?.consultation, icon: 'person' },
    { label: '시술비', value: costBreakdown?.procedures, icon: 'medical' },
    { label: '약제비', value: costBreakdown?.medication, icon: 'flask' },
    { label: '입원비', value: costBreakdown?.hospitalization, icon: 'bed' },
    { label: '검사비', value: costBreakdown?.diagnosticTests, icon: 'analytics' },
    { label: '재료비', value: costBreakdown?.supplies, icon: 'cube' },
    { label: '기타', value: costBreakdown?.other, icon: 'ellipsis-horizontal' },
  ].filter((item) => item.value && item.value > 0);

  return (
    <View style={styles.container}>
      {/* Cost Breakdown */}
      {costItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진료비 내역</Text>
          <View style={styles.breakdownList}>
            {costItems.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <Ionicons name={item.icon as any} size={18} color={theme.colors.gray500} />
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>
                <Text style={styles.breakdownValue}>{formatCurrency(item.value!)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>총 진료비</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>
      )}

      {/* Service Items */}
      {record.serviceItems && record.serviceItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 항목</Text>
          <View style={styles.serviceList}>
            {record.serviceItems.map((item) => (
              <View key={item.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    {item.insuranceCovered && (
                      <View style={styles.insuranceBadge}>
                        <Ionicons name="shield-checkmark" size={12} color={theme.colors.success} />
                        <Text style={styles.insuranceBadgeText}>보험</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceDetail}>
                    {item.quantity}개 × {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <Text style={styles.serviceTotal}>{formatCurrency(item.totalPrice)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Payment Summary */}
      {payment && showInsuranceCalculation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>
          <View style={styles.paymentSummary}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>총 진료비</Text>
              <Text style={styles.paymentValue}>{formatCurrency(payment.totalAmount)}</Text>
            </View>

            {payment.insuranceCoverage > 0 && (
              <>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>보험 적용</Text>
                  <Text style={[styles.paymentValue, styles.paymentValueSuccess]}>
                    -{formatCurrency(payment.insuranceCoverage)}
                  </Text>
                </View>
                <View style={[styles.paymentRow, styles.finalPaymentRow]}>
                  <Text style={styles.finalPaymentLabel}>본인 부담</Text>
                  <Text style={styles.finalPaymentValue}>
                    {formatCurrency(payment.selfPayment)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.paymentMethodRow}>
              <Ionicons
                name={
                  payment.paymentMethod === 'card'
                    ? 'card'
                    : payment.paymentMethod === 'cash'
                    ? 'cash'
                    : payment.paymentMethod === 'account'
                    ? 'wallet'
                    : 'shield-checkmark'
                }
                size={16}
                color={theme.colors.gray500}
              />
              <Text style={styles.paymentMethodText}>
                {payment.paymentMethod === 'card'
                  ? '카드 결제'
                  : payment.paymentMethod === 'cash'
                  ? '현금 결제'
                  : payment.paymentMethod === 'account'
                  ? '계좌 이체'
                  : '보험 청구'}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  payment.paymentStatus === 'completed' && styles.statusBadgeCompleted,
                  payment.paymentStatus === 'partial' && styles.statusBadgePartial,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    payment.paymentStatus === 'completed' && styles.statusTextCompleted,
                  ]}
                >
                  {payment.paymentStatus === 'completed'
                    ? '완료'
                    : payment.paymentStatus === 'partial'
                    ? '부분결제'
                    : '미결제'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 12,
  },
  breakdownList: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    fontSize: 15,
    color: theme.colors.gray700,
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: theme.colors.gray200,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  serviceList: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  insuranceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.colors.successLight,
    borderRadius: 6,
  },
  insuranceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  serviceDetail: {
    fontSize: 13,
    color: theme.colors.gray500,
  },
  serviceTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  paymentSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  paymentValueSuccess: {
    color: theme.colors.success,
  },
  finalPaymentRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  finalPaymentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  finalPaymentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.gray100,
    borderRadius: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: theme.colors.successLight,
  },
  statusBadgePartial: {
    backgroundColor: theme.colors.warningLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  statusTextCompleted: {
    color: theme.colors.success,
  },
});
