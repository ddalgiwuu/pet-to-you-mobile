/**
 * Medical Record Creation Screen
 * 4-step form for creating comprehensive medical records
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { MedicalRecord, Pet, Hospital } from '@/types';
import { useCreateMedicalRecord, CreateMedicalRecordData } from '@/hooks/useMedicalRecords';
import CostBreakdownForm, { CostBreakdownFormData } from '@/components/health/CostBreakdownForm';
import { usePets } from '@/hooks/usePets';
import { useHospitals } from '@/hooks/useHospitals';
import { StepProgressBar } from '@/components/health/StepProgressBar';
import { FloatingLabelInput } from '@/components/health/FloatingLabelInput';
import { PetSelectorCarousel } from '@/components/health/PetSelectorCarousel';
import { ModernButton } from '@/components/health/ModernButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { CalendarPicker } from '@/components/health/CalendarPicker';

type Step = 1 | 2 | 3 | 4;

export default function CreateMedicalRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createRecord, loading, error } = useCreateMedicalRecord();
  const { data: pets = [] } = usePets();

  // Step 1: Basic Info (need hospitalSearchQuery state before hook)
  const [selectedPetId, setSelectedPetId] = useState<string>(params.petId as string || '');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<MedicalRecord['type']>('checkup');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [veterinarian, setVeterinarian] = useState('');

  const { data: hospitals = [] } = useHospitals({ searchQuery: hospitalSearchQuery });

  // === Form State ===
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 2: Medical Details
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Step 3: Cost & Payment (managed by CostBreakdownForm)
  const [costData, setCostData] = useState<CostBreakdownFormData>({
    costBreakdown: {
      consultation: 0,
      procedures: 0,
      medication: 0,
      hospitalization: 0,
      diagnosticTests: 0,
      supplies: 0,
      other: 0,
    },
    serviceItems: [],
    payment: {
      totalAmount: 0,
      insuranceCoverage: 0,
      selfPayment: 0,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      paidAmount: 0,
      remainingAmount: 0,
    },
  });

  // Step 4: Documents & Confirmation
  const [documents, setDocuments] = useState<MedicalRecord['documents']>([]);
  const [autoSubmitClaim, setAutoSubmitClaim] = useState(true);

  // === Validation ===
  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(selectedPetId && date && type && selectedHospitalId && veterinarian);
      case 2:
        return !!(diagnosis.trim() && treatment.trim());
      case 3:
        return costData.payment.totalAmount > 0;
      case 4:
        return true; // Documents are optional
      default:
        return false;
    }
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case 1:
        return '기본 정보';
      case 2:
        return '진료 내역';
      case 3:
        return '비용 & 결제';
      case 4:
        return '서류 & 확인';
    }
  };

  // === Event Handlers ===
  const handleNext = () => {
    if (!canProceedToNextStep()) {
      Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNextStep()) {
      Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      // Calculate actual cost from breakdown
      const actualCost = Object.values(costData.costBreakdown).reduce(
        (sum, value) => sum + (value || 0),
        0
      );

      const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId);

      const recordData: CreateMedicalRecordData = {
        petId: selectedPetId,
        date: date.toISOString(),
        type,
        diagnosis,
        treatment,
        veterinarian,
        hospitalId: selectedHospitalId,
        hospitalName: selectedHospital?.name,
        notes: notes.trim() || undefined,

        // Cost information
        actualCost,
        costBreakdown: costData.costBreakdown,
        serviceItems: costData.serviceItems,

        // Payment information
        payment: costData.payment,

        // Documents
        documents: documents.length > 0 ? documents : undefined,

        // Follow-up (can be added later)
        followUp: {
          required: false,
        },
      };

      const createdRecord = await createRecord(recordData);

      Alert.alert(
        '저장 완료',
        autoSubmitClaim
          ? '진료 기록이 저장되었습니다.\n보험 청구를 자동으로 생성합니다.'
          : '진료 기록이 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              if (autoSubmitClaim) {
                // Navigate to auto-claim suggestion screen
                router.push('/insurance/claims');
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('저장 실패', error || '진료 기록 저장에 실패했습니다.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newDocs: MedicalRecord['documents'] = result.assets.map((asset) => ({
          id: Date.now().toString() + Math.random(),
          type: 'photo',
          name: asset.fileName || `document_${Date.now()}.jpg`,
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
          uploadedAt: new Date().toISOString(),
        }));

        setDocuments([...(documents || []), ...newDocs]);
      }
    } catch (error) {
      Alert.alert('오류', '파일 선택에 실패했습니다.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled) {
        const newDoc: MedicalRecord['documents'][0] = {
          id: Date.now().toString(),
          type: 'receipt',
          name: `receipt_${Date.now()}.jpg`,
          uri: result.assets[0].uri,
          mimeType: 'image/jpeg',
          size: result.assets[0].fileSize || 0,
          uploadedAt: new Date().toISOString(),
        };

        setDocuments([...(documents || []), newDoc]);
      }
    } catch (error) {
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((documents || []).filter((doc) => doc.id !== id));
  };

  // === Render Functions ===
  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Pet Selection Carousel */}
      <View style={styles.formGroup}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            반려동물 선택 <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>편집</Text>
          </TouchableOpacity>
        </View>
        <PetSelectorCarousel
          pets={pets}
          selectedPetId={selectedPetId}
          onSelect={setSelectedPetId}
        />
      </View>

      {/* Treatment Type with Glass Cards */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>
          진료 유형 <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.typeGrid}>
          {[
            { value: 'checkup' as const, label: '일반 진료', icon: 'medical', gradient: ['#FFE5EE', '#FFB3D9'] },
            { value: 'vaccination' as const, label: '예방접종', icon: 'shield-checkmark', gradient: ['#E8F5E9', '#C8E6C9'] },
            { value: 'surgery' as const, label: '수술', icon: 'cut', gradient: ['#E0F7F6', '#B2EBF2'] },
            { value: 'emergency' as const, label: '응급', icon: 'alert-circle', gradient: ['#FFEBEE', '#FFCDD2'] },
            { value: 'dermatology' as const, label: '피부과', icon: 'water', gradient: ['#FFF3E0', '#FFE0B2'] },
            { value: 'dental' as const, label: '치과', icon: 'happy', gradient: ['#F3E5F5', '#E1BEE7'] },
            { value: 'ophthalmology' as const, label: '안과', icon: 'eye', gradient: ['#E3F2FD', '#BBDEFB'] },
            { value: 'orthopedics' as const, label: '정형외과', icon: 'fitness', gradient: ['#FBE9E7', '#FFCCBC'] },
            { value: 'internal_medicine' as const, label: '내과', icon: 'pulse', gradient: ['#E8EAF6', '#C5CAE9'] },
            { value: 'general_surgery' as const, label: '외과', icon: 'git-merge', gradient: ['#FCE4EC', '#F8BBD0'] },
            { value: 'health_check' as const, label: '건강검진', icon: 'clipboard', gradient: ['#E0F2F1', '#B2DFDB'] },
            { value: 'hospitalization' as const, label: '입원', icon: 'bed', gradient: ['#FFF9C4', '#FFF59D'] },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.typeCardWrapper}
              onPress={() => setType(option.value)}
            >
              <LinearGradient
                colors={type === option.value ? theme.colors.gradients.primary : option.gradient}
                style={[
                  styles.typeCardModern,
                  type === option.value && styles.typeCardModernSelected,
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={type === option.value ? theme.colors.white : theme.colors.gray600}
                />
                <Text
                  style={[
                    styles.typeLabelModern,
                    type === option.value && styles.typeLabelModernSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {type === option.value && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date with Korean Calendar */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>
          진료일 <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dateInputContainer}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.colors.gray400} />
          <Text style={styles.dateText}>
            {date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <View style={styles.calendarPickerContainer}>
            <CalendarPicker
              selectedDate={date}
              onDateSelect={(selectedDate) => setDate(selectedDate)}
              maxDate={new Date()}
              onDone={() => setShowDatePicker(false)}
            />
          </View>
        )}
      </View>

      {/* Hospital Search with Autocomplete */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>
          병원 <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.searchContainer}>
          <FloatingLabelInput
            label="병원 이름으로 검색"
            icon="search-outline"
            value={hospitalSearchQuery}
            onChangeText={setHospitalSearchQuery}
            placeholder="예: 서울동물병원"
          />
          {hospitalSearchQuery.length > 0 && (
            <View style={styles.hospitalDropdown}>
              {hospitals.length > 0 ? (
                <ScrollView
                  style={styles.hospitalScrollView}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {hospitals.slice(0, 8).map((hospital) => (
                    <TouchableOpacity
                      key={hospital.id}
                      style={[
                        styles.hospitalDropdownItem,
                        selectedHospitalId === hospital.id && styles.hospitalDropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedHospitalId(hospital.id);
                        setHospitalSearchQuery(hospital.name);
                      }}
                    >
                      <View style={styles.hospitalIconBadge}>
                        <Ionicons name="business" size={18} color={theme.colors.primary} />
                      </View>
                      <View style={styles.hospitalDropdownInfo}>
                        <Text style={styles.hospitalDropdownName} numberOfLines={1}>
                          {hospital.name}
                        </Text>
                        <View style={styles.hospitalMeta}>
                          <Ionicons name="location" size={12} color={theme.colors.gray500} />
                          <Text style={styles.hospitalDropdownAddress} numberOfLines={1}>
                            {hospital.address}
                          </Text>
                        </View>
                        {hospital.distance && (
                          <View style={styles.hospitalMeta}>
                            <Ionicons name="navigate" size={12} color={theme.colors.gray500} />
                            <Text style={styles.hospitalDistance}>
                              {hospital.distance.toFixed(1)}km
                            </Text>
                          </View>
                        )}
                      </View>
                      {selectedHospitalId === hospital.id && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.hospitalEmptyState}>
                  <Ionicons name="search-outline" size={32} color={theme.colors.gray300} />
                  <Text style={styles.hospitalEmptyText}>검색 결과가 없습니다</Text>
                  <Text style={styles.hospitalEmptySubtext}>다른 병원 이름을 검색해보세요</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Veterinarian */}
      <View style={styles.formGroup}>
        <FloatingLabelInput
          label="수의사"
          icon="person-outline"
          value={veterinarian}
          onChangeText={setVeterinarian}
          placeholder="예: 김수의 원장"
          required
        />
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Diagnosis */}
      <FloatingLabelInput
        label="진단명"
        icon="medical-outline"
        value={diagnosis}
        onChangeText={setDiagnosis}
        placeholder="예: 급성 위장염"
        required
      />

      {/* Treatment */}
      <FloatingLabelInput
        label="치료 내역"
        icon="bandage-outline"
        value={treatment}
        onChangeText={setTreatment}
        placeholder="예: 수액치료, 항생제 투여, 입원 1일"
        multiline
        numberOfLines={4}
        required
      />

      {/* Symptoms */}
      <FloatingLabelInput
        label="증상"
        icon="thermometer-outline"
        value={symptoms}
        onChangeText={setSymptoms}
        placeholder="예: 구토, 설사, 식욕부진"
        multiline
        numberOfLines={3}
      />

      {/* Notes */}
      <FloatingLabelInput
        label="메모"
        icon="create-outline"
        value={notes}
        onChangeText={setNotes}
        placeholder="추가 메모사항을 입력하세요"
        multiline
        numberOfLines={4}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <CostBreakdownForm initialData={costData} onChange={setCostData} />
    </View>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Document Upload */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>첨부 서류 (선택)</Text>
        <Text style={styles.helperText}>영수증, 진단서, X-ray 등을 첨부하세요</Text>

        <View style={styles.uploadButtons}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={24} color={theme.colors.primary} />
            <Text style={styles.uploadButtonText}>사진 촬영</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
            <Ionicons name="folder-open" size={24} color={theme.colors.primary} />
            <Text style={styles.uploadButtonText}>파일 선택</Text>
          </TouchableOpacity>
        </View>

        {documents && documents.length > 0 && (
          <View style={styles.documentList}>
            {documents.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <View style={styles.documentInfo}>
                  <Ionicons
                    name={doc.type === 'receipt' ? 'receipt' : 'document'}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.documentSize}>
                    {(doc.size / 1024 / 1024).toFixed(1)}MB
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeDocument(doc.id)}>
                  <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Insurance Claim Preview */}
      <View style={styles.insurancePreview}>
        <View style={styles.insuranceHeader}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
          <Text style={styles.insuranceTitle}>보험 자동 청구</Text>
        </View>

        <View style={styles.insuranceContent}>
          <View style={styles.insuranceRow}>
            <Text style={styles.insuranceLabel}>총 진료비</Text>
            <Text style={styles.insuranceValue}>
              ₩{costData.payment.totalAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.insuranceRow}>
            <Text style={styles.insuranceLabel}>예상 청구액 (70%)</Text>
            <Text style={[styles.insuranceValue, styles.insuranceValueHighlight]}>
              ₩{Math.round(costData.payment.totalAmount * 0.7).toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.autoSubmitToggle}
          onPress={() => setAutoSubmitClaim(!autoSubmitClaim)}
        >
          <View
            style={[
              styles.checkbox,
              autoSubmitClaim && styles.checkboxChecked,
            ]}
          >
            {autoSubmitClaim && (
              <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            )}
          </View>
          <Text style={styles.autoSubmitText}>저장 후 바로 보험 청구하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '진료 기록 작성',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.gray900} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Modern Progress Bar */}
        <StepProgressBar
          steps={[
            { number: 1, label: '기본 정보', icon: 'information-circle' },
            { number: 2, label: '진료 내역', icon: 'medical' },
            { number: 3, label: '비용 & 결제', icon: 'card' },
            { number: 4, label: '서류 & 확인', icon: 'checkmark-circle' },
          ]}
          currentStep={currentStep}
        />

        {/* Step Content */}
        <View style={styles.stepContent}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </View>

        {/* Modern Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <ModernButton
              title="이전"
              onPress={handleBack}
              variant="outline"
              icon="arrow-back"
              iconPosition="left"
              style={styles.navButton}
            />
          )}

          {currentStep < 4 ? (
            <ModernButton
              title="다음"
              onPress={handleNext}
              variant="primary"
              disabled={!canProceedToNextStep()}
              icon="arrow-forward"
              iconPosition="right"
              style={[styles.navButton, currentStep > 1 && styles.navButtonFlex]}
              fullWidth
            />
          ) : (
            <ModernButton
              title="저장하기"
              onPress={handleSubmit}
              variant="success"
              disabled={loading}
              loading={loading}
              icon="checkmark-circle"
              iconPosition="left"
              style={[styles.navButton, styles.navButtonFlex]}
              fullWidth
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  required: {
    color: theme.colors.error,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCardWrapper: {
    width: '31%',
  },
  typeCardModern: {
    borderRadius: theme.borderRadius.md,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    minHeight: 75,
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  typeCardModernSelected: {
    ...theme.shadows.large,
  },
  typeLabelModern: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gray600,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  typeLabelModernSelected: {
    color: theme.colors.white,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 100,
  },
  hospitalDropdown: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginTop: -12,
    maxHeight: 320,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...theme.shadows.large,
  },
  hospitalScrollView: {
    maxHeight: 280,
  },
  hospitalDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  hospitalDropdownItemSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  hospitalIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalDropdownInfo: {
    flex: 1,
    gap: 4,
  },
  hospitalDropdownName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalDropdownAddress: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.gray500,
    flex: 1,
  },
  hospitalDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray500,
  },
  hospitalEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  hospitalEmptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.gray500,
  },
  hospitalEmptySubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.gray400,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: 12,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    gap: 8,
    ...theme.shadows.subtle,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
  documentList: {
    marginTop: 16,
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    ...theme.shadows.subtle,
  },
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  documentSize: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  insurancePreview: {
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.borderRadius.lg,
    padding: 24,
    marginTop: 16,
    ...theme.shadows.medium,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  insuranceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  insuranceContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  insuranceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insuranceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  insuranceValue: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  insuranceValueHighlight: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.success,
  },
  autoSubmitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  autoSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    ...theme.shadows.subtle,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  calendarPickerContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  navButton: {
    flex: 1,
  },
  navButtonFlex: {
    flex: 2,
  },
});
