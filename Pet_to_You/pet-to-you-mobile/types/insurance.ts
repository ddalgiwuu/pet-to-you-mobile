/**
 * Insurance types for Pet to You mobile app
 * 한국 반려동물 보험 시스템
 */

// ==================== Core Types ====================

/**
 * 보장 유형
 */
export type CoverageType =
  | 'general'     // 일반 진료
  | 'surgery'     // 수술
  | 'emergency'   // 응급
  | 'dental'      // 치과
  | 'chronic'     // 만성질환
  | 'diagnostic'  // 진단검사
  | 'hospitalization'; // 입원

/**
 * 보험 플랜 (상품)
 */
export interface InsurancePlan {
  id: string;
  name: string;
  provider: string; // 보험사 (현대해상, DB손해보험 등)
  description: string;
  monthlyPremium: number; // 월 보험료
  yearlyPremium: number; // 연 보험료
  maxCoverage: number; // 최대 보장액 (연간)
  deductible: number; // 자기부담금

  // 보장 내역
  coverageTypes: {
    type: CoverageType;
    coveragePercent: number; // 보장률 (60-100%)
    maxAmount?: number; // 항목별 최대 보장액
  }[];

  // 가입 조건
  minAge: number; // 최소 가입 연령 (개월)
  maxAge: number; // 최대 가입 연령 (개월)
  eligibleSpecies: ('dog' | 'cat' | 'other')[];
  waitingPeriod: number; // 대기기간 (일)

  // 선택적 보장 (추가 옵션)
  optionalCoverages?: {
    type: CoverageType;
    additionalPremium: number; // 추가 보험료
    coveragePercent: number;
  }[];

  // UI
  isPopular?: boolean; // 인기 상품
  isRecommended?: boolean; // 추천 상품
  color?: string; // 카드 색상
}

/**
 * 보험 정책 (가입된 보험)
 */
export interface InsurancePolicy {
  id: string;
  userId: string;
  petId: string;
  planId: string;

  // 보험 정보
  provider: string;
  planName: string;
  policyNumber: string; // 증권번호

  // 보장 정보
  monthlyPremium: number;
  yearlyPremium: number;
  maxCoverage: number;
  remainingCoverage: number; // 남은 보장액
  deductible: number;
  coverageTypes: {
    type: CoverageType;
    coveragePercent: number;
    maxAmount?: number;
  }[];

  // 기간
  startDate: string; // 보장 시작일
  endDate: string; // 보장 종료일
  renewalDate: string; // 갱신일
  waitingPeriodEndDate: string; // 대기기간 종료일

  // 상태
  status: 'pending' | 'active' | 'suspended' | 'expired' | 'cancelled';

  // 결제
  paymentMethod: 'card' | 'account'; // 카드/계좌
  autoRenewal: boolean; // 자동갱신
  billingCycle: 'monthly' | 'yearly'; // 월납/연납

  // 청구 통계
  totalClaimsSubmitted: number; // 총 청구 건수
  totalClaimsPaid: number; // 총 지급액

  createdAt: string;
  updatedAt: string;
}

/**
 * 보험금 청구
 */
export interface InsuranceClaim {
  id: string;
  userId: string;
  policyId: string;
  petId: string;

  // 사고 정보
  incidentDate: string; // 발생일
  incidentType: CoverageType; // 진료 유형
  diagnosis: string; // 진단명
  treatment: string; // 치료 내역

  // 병원 정보
  hospitalId?: string;
  hospitalName: string;
  veterinarian: string;

  // 금액
  totalAmount: number; // 총 진료비
  deductibleAmount: number; // 자기부담금
  coveragePercent: number; // 적용 보장률
  claimAmount: number; // 청구 금액
  approvedAmount?: number; // 승인 금액
  paidAmount?: number; // 지급 금액

  // 서류
  documents: ClaimDocument[];

  // 상태
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'paid';

  // 처리 정보
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  rejectionReason?: string;

  // 건강 기록 연동
  medicalRecordId?: string;

  // 타임라인
  timeline: ClaimTimeline[];

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 청구 서류
 */
export interface ClaimDocument {
  id: string;
  claimId: string;
  type: 'receipt' | 'medical_record' | 'diagnosis' | 'prescription' | 'other';
  name: string;
  uri: string; // 파일 경로 또는 URL
  mimeType: string; // image/jpeg, application/pdf 등
  size: number; // bytes
  uploadedAt: string;
}

/**
 * 청구 타임라인
 */
export interface ClaimTimeline {
  id: string;
  status: InsuranceClaim['status'];
  timestamp: string;
  description: string;
  actor?: string; // 처리자
}

/**
 * 자동 청구 제안
 */
export interface AutoClaimSuggestion {
  id: string;
  medicalRecordId: string;
  policyId: string;

  // 건강 기록 정보
  petId: string;
  incidentDate: string;
  diagnosis: string;
  treatment: string;
  hospitalName: string;

  // 예상 정보
  estimatedCost: number; // 예상 진료비
  estimatedClaimAmount: number; // 예상 청구액
  coverageType: CoverageType;
  coveragePercent: number;

  // AI 분석
  confidence: number; // 0-1, AI 신뢰도
  isEligible: boolean; // 청구 가능 여부
  reason?: string; // 불가능한 경우 사유

  createdAt: string;
}

// ==================== Extended Types ====================

/**
 * MedicalRecord 확장 (보험 통합)
 * Note: types/index.ts의 MedicalRecord와 병합 필요
 */
export interface MedicalRecordWithInsurance {
  id: string;
  petId: string;
  date: string;
  type: 'checkup' | 'surgery' | 'emergency' | 'vaccination' | 'dermatology' | 'dental' | 'ophthalmology' | 'orthopedics' | 'internal_medicine' | 'general_surgery' | 'health_check' | 'hospitalization';
  diagnosis: string;
  treatment: string;
  veterinarian: string;
  hospitalId: string;
  notes?: string;

  // 보험 통합 필드
  estimatedCost?: number; // 진료비
  insuranceClaimId?: string; // 연결된 청구 ID
  isInsuranceCovered?: boolean; // 보험 적용 여부
  insuranceProvider?: string; // 적용된 보험사
  claimStatus?: InsuranceClaim['status']; // 청구 상태
}

// ==================== API Request/Response Types ====================

/**
 * 보험 가입 요청
 */
export interface PurchaseInsuranceRequest {
  planId: string;
  petId: string;
  selectedCoverageTypes: CoverageType[];
  optionalCoverages?: CoverageType[];
  startDate: string;
  paymentMethod: 'card' | 'account';
  autoRenewal: boolean;
  billingCycle: 'monthly' | 'yearly';
}

/**
 * 청구 제출 요청
 */
export interface SubmitClaimRequest {
  policyId: string;
  petId: string;
  incidentDate: string;
  incidentType: CoverageType;
  diagnosis: string;
  treatment: string;
  hospitalId?: string;
  hospitalName: string;
  veterinarian: string;
  totalAmount: number;
  documents: {
    type: ClaimDocument['type'];
    uri: string;
    name: string;
    mimeType: string;
    size: number;
  }[];
  medicalRecordId?: string;
  notes?: string;
}

// ==================== Filter & Query Types ====================

/**
 * 보험 플랜 필터
 */
export interface InsurancePlanFilters {
  species?: Pet['species'];
  age?: number; // 개월
  minPremium?: number;
  maxPremium?: number;
  provider?: string;
  coverageTypes?: CoverageType[];
}

/**
 * 정책 상태 필터
 */
export type PolicyStatus = InsurancePolicy['status'];

/**
 * 청구 상태 필터
 */
export type ClaimStatus = InsuranceClaim['status'];

// ==================== Helper Types ====================

/**
 * 보험 통계
 */
export interface InsuranceStats {
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  approvedClaims: number;
  totalPaid: number;
  totalCoverage: number;
  remainingCoverage: number;
}

/**
 * Pet type reference (from index.ts)
 */
type Pet = {
  species: 'dog' | 'cat' | 'other';
};
