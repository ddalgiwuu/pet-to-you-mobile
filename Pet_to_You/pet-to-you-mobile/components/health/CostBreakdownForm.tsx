/**
 * Cost Breakdown Form Component
 * Comprehensive form for inputting medical costs with 7 categories and service items
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicalRecord } from '@/types';
import { theme } from '@/constants/theme';

export interface CostBreakdownFormData {
  costBreakdown: MedicalRecord['costBreakdown'];
  serviceItems: MedicalRecord['serviceItems'];
  payment: MedicalRecord['payment'];
}

interface Props {
  initialData?: CostBreakdownFormData;
  onChange: (data: CostBreakdownFormData) => void;
  disabled?: boolean;
}

export default function CostBreakdownForm({ initialData, onChange, disabled = false }: Props) {
  // === Cost Breakdown State ===
  const [costBreakdown, setCostBreakdown] = useState<MedicalRecord['costBreakdown']>(
    initialData?.costBreakdown || {
      consultation: 0,
      procedures: 0,
      medication: 0,
      hospitalization: 0,
      diagnosticTests: 0,
      supplies: 0,
      other: 0,
    }
  );

  // === Service Items State ===
  const [serviceItems, setServiceItems] = useState<MedicalRecord['serviceItems']>(
    initialData?.serviceItems || []
  );

  // === Payment State ===
  const [paymentMethod, setPaymentMethod] = useState<MedicalRecord['payment']['paymentMethod']>(
    initialData?.payment?.paymentMethod || 'card'
  );
  const [paymentStatus, setPaymentStatus] = useState<MedicalRecord['payment']['paymentStatus']>(
    initialData?.payment?.paymentStatus || 'completed'
  );

  // === Calculated Values ===
  const [totalCost, setTotalCost] = useState(0);
  const [insuranceCoverage, setInsuranceCoverage] = useState(0);
  const [selfPayment, setSelfPayment] = useState(0);

  // Calculate totals whenever cost breakdown or service items change
  useEffect(() => {
    const breakdown = costBreakdown;
    const total =
      (breakdown.consultation || 0) +
      (breakdown.procedures || 0) +
      (breakdown.medication || 0) +
      (breakdown.hospitalization || 0) +
      (breakdown.diagnosticTests || 0) +
      (breakdown.supplies || 0) +
      (breakdown.other || 0);

    setTotalCost(total);

    // Calculate insurance coverage (70% default for now - will be calculated by AI later)
    const coverage = total * 0.7;
    setInsuranceCoverage(coverage);
    setSelfPayment(total - coverage);
  }, [costBreakdown]);

  // Notify parent of changes
  useEffect(() => {
    const payment: MedicalRecord['payment'] = {
      totalAmount: totalCost,
      insuranceCoverage,
      selfPayment,
      paymentMethod,
      paymentStatus,
      paidAmount: paymentStatus === 'completed' ? totalCost : 0,
      remainingAmount: paymentStatus === 'completed' ? 0 : totalCost,
    };

    onChange({
      costBreakdown,
      serviceItems,
      payment,
    });
  }, [costBreakdown, serviceItems, totalCost, insuranceCoverage, selfPayment, paymentMethod, paymentStatus]);

  // === Event Handlers ===
  const updateCostField = (field: keyof typeof costBreakdown, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setCostBreakdown((prev) => ({ ...prev, [field]: numValue }));
  };

  const addServiceItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      insuranceCovered: true,
    };
    setServiceItems([...(serviceItems || []), newItem]);
  };

  const updateServiceItem = (id: string, field: string, value: any) => {
    setServiceItems(
      (serviceItems || []).map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate total price
          if (field === 'quantity' || field === 'unitPrice') {
            updated.totalPrice = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeServiceItem = (id: string) => {
    setServiceItems((serviceItems || []).filter((item) => item.id !== id));
  };

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* === Cost Breakdown === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>진료비 내역</Text>
        <Text style={styles.sectionDescription}>7개 항목으로 나누어 입력하세요</Text>

        <View style={styles.costGrid}>
          <CostInput
            label="진찰료"
            value={costBreakdown.consultation.toString()}
            onChange={(v) => updateCostField('consultation', v)}
            disabled={disabled}
          />
          <CostInput
            label="시술비"
            value={costBreakdown.procedures.toString()}
            onChange={(v) => updateCostField('procedures', v)}
            disabled={disabled}
          />
          <CostInput
            label="약제비"
            value={costBreakdown.medication.toString()}
            onChange={(v) => updateCostField('medication', v)}
            disabled={disabled}
          />
          <CostInput
            label="입원비"
            value={(costBreakdown.hospitalization || 0).toString()}
            onChange={(v) => updateCostField('hospitalization', v)}
            disabled={disabled}
          />
          <CostInput
            label="검사비"
            value={(costBreakdown.diagnosticTests || 0).toString()}
            onChange={(v) => updateCostField('diagnosticTests', v)}
            disabled={disabled}
          />
          <CostInput
            label="재료비"
            value={(costBreakdown.supplies || 0).toString()}
            onChange={(v) => updateCostField('supplies', v)}
            disabled={disabled}
          />
          <CostInput
            label="기타"
            value={(costBreakdown.other || 0).toString()}
            onChange={(v) => updateCostField('other', v)}
            disabled={disabled}
          />
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>총 진료비</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
        </View>
      </View>

      {/* === Service Items === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>세부 항목</Text>
            <Text style={styles.sectionDescription}>선택사항: 상세 진료 내역 추가</Text>
          </View>
          {!disabled && (
            <TouchableOpacity style={styles.addButton} onPress={addServiceItem}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {serviceItems && serviceItems.length > 0 ? (
          serviceItems.map((item) => (
            <View key={item.id} style={styles.serviceItem}>
              <View style={styles.serviceItemHeader}>
                <TextInput
                  style={styles.serviceNameInput}
                  placeholder="예: 혈액검사"
                  value={item.name}
                  onChangeText={(v) => updateServiceItem(item.id, 'name', v)}
                  editable={!disabled}
                />
                {!disabled && (
                  <TouchableOpacity onPress={() => removeServiceItem(item.id)}>
                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.serviceItemRow}>
                <View style={styles.serviceItemField}>
                  <Text style={styles.serviceLabel}>수량</Text>
                  <TextInput
                    style={styles.serviceInput}
                    keyboardType="number-pad"
                    value={item.quantity.toString()}
                    onChangeText={(v) =>
                      updateServiceItem(item.id, 'quantity', parseInt(v) || 1)
                    }
                    editable={!disabled}
                  />
                </View>

                <View style={styles.serviceItemField}>
                  <Text style={styles.serviceLabel}>단가</Text>
                  <TextInput
                    style={styles.serviceInput}
                    keyboardType="number-pad"
                    placeholder="0"
                    value={item.unitPrice > 0 ? item.unitPrice.toString() : ''}
                    onChangeText={(v) =>
                      updateServiceItem(item.id, 'unitPrice', parseInt(v) || 0)
                    }
                    editable={!disabled}
                  />
                </View>

                <View style={styles.serviceItemField}>
                  <Text style={styles.serviceLabel}>합계</Text>
                  <Text style={styles.serviceTotal}>{formatCurrency(item.totalPrice)}</Text>
                </View>
              </View>

              <View style={styles.insuranceCoverageRow}>
                <Text style={styles.insuranceLabel}>보험 적용</Text>
                <Switch
                  value={item.insuranceCovered}
                  onValueChange={(v) => updateServiceItem(item.id, 'insuranceCovered', v)}
                  disabled={disabled}
                  trackColor={{ false: theme.colors.gray200, true: theme.colors.primaryLight }}
                  thumbColor={item.insuranceCovered ? theme.colors.primary : theme.colors.gray400}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>세부 항목이 없습니다. 추가 버튼을 눌러 입력하세요.</Text>
        )}
      </View>

      {/* === Payment Info === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>결제 정보</Text>

        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>결제 방법</Text>
          <View style={styles.paymentMethods}>
            {(['card', 'cash', 'account', 'insurance'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === method && styles.paymentMethodButtonActive,
                ]}
                onPress={() => setPaymentMethod(method)}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.paymentMethodTextActive,
                  ]}
                >
                  {method === 'card'
                    ? '카드'
                    : method === 'cash'
                    ? '현금'
                    : method === 'account'
                    ? '계좌'
                    : '보험'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>결제 상태</Text>
          <View style={styles.paymentMethods}>
            {(['pending', 'partial', 'completed'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.paymentMethodButton,
                  paymentStatus === status && styles.paymentMethodButtonActive,
                ]}
                onPress={() => setPaymentStatus(status)}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentStatus === status && styles.paymentMethodTextActive,
                  ]}
                >
                  {status === 'pending'
                    ? '미결제'
                    : status === 'partial'
                    ? '부분결제'
                    : '완료'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.paymentSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>총액</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalCost)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>보험 적용 (예상)</Text>
            <Text style={[styles.summaryValue, styles.insuranceValue]}>
              -{formatCurrency(insuranceCoverage)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.finalRow]}>
            <Text style={styles.finalLabel}>본인 부담</Text>
            <Text style={styles.finalValue}>{formatCurrency(selfPayment)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// === Cost Input Component ===
interface CostInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function CostInput({ label, value, onChange, disabled }: CostInputProps) {
  return (
    <View style={styles.costInputContainer}>
      <Text style={styles.costLabel}>{label}</Text>
      <View style={styles.costInputWrapper}>
        <Text style={styles.currencySymbol}>₩</Text>
        <TextInput
          style={styles.costInput}
          keyboardType="number-pad"
          placeholder="0"
          value={value !== '0' ? value : ''}
          onChangeText={onChange}
          editable={!disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.gray500,
  },
  costGrid: {
    gap: 12,
  },
  costInputContainer: {
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray700,
    marginBottom: 6,
  },
  costInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 16,
    color: theme.colors.gray400,
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.gray900,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: theme.colors.gray200,
    marginTop: 8,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  serviceItem: {
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  serviceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginRight: 8,
  },
  serviceItemRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  serviceItemField: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: 4,
  },
  serviceInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
  },
  serviceTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    paddingTop: 8,
  },
  insuranceCoverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insuranceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.gray400,
    paddingVertical: 32,
  },
  paymentRow: {
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray700,
    marginBottom: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentMethodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray600,
  },
  paymentMethodTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  paymentSummary: {
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  insuranceValue: {
    color: theme.colors.success,
  },
  finalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  finalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  finalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
