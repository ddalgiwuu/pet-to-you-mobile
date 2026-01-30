/**
 * Core TypeScript types for Pet to You mobile app
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  userId?: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  weight?: number;
  profileImage?: string;
  color?: string;
  image?: string;
  images?: string[];

  // Medical Info
  medicalRecords?: MedicalRecord[];
  vaccinations?: Vaccination[] | { name: string; date: string; nextDate?: string }[];
  allergies?: string[];
  diseases?: string[];
  neutered?: boolean;
  microchipId?: string;

  // Additional
  personality?: string;
  specialNeeds?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalRecord {
  // === Core Fields ===
  id: string;
  petId: string;
  date: string;
  type: 'checkup' | 'surgery' | 'emergency' | 'vaccination' | 'dermatology' | 'dental' | 'ophthalmology' | 'orthopedics' | 'internal_medicine' | 'general_surgery' | 'health_check' | 'hospitalization';
  diagnosis: string;
  treatment: string;
  veterinarian: string;
  hospitalId: string;
  notes?: string;

  // === Category 1: Booking Connection ===
  bookingId?: string;

  // === Category 2: Cost Tracking (Required) ===
  estimatedCost?: number;           // AI estimation
  actualCost?: number;              // Actual hospital charge ⭐
  costBreakdown?: {
    consultation: number;           // Consultation fee ⭐
    procedures: number;             // Procedure fee ⭐
    medication: number;             // Medication cost ⭐
    hospitalization?: number;       // Hospitalization fee
    diagnosticTests?: number;       // Diagnostic test fee
    supplies?: number;              // Supplies cost
    other?: number;                 // Other costs
  };

  // === Category 3: Service Items (Optional) ===
  serviceItems?: {
    id: string;
    name: string;                   // e.g., "Blood test"
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    insuranceCovered: boolean;      // Insurance coverage flag ⭐
  }[];

  // === Category 4: Payment Tracking (Required) ===
  payment?: {
    totalAmount: number;            // Total amount ⭐
    insuranceCoverage: number;      // Insurance coverage ⭐
    selfPayment: number;            // Self-payment ⭐
    paymentMethod: 'card' | 'cash' | 'account' | 'insurance';
    paymentStatus: 'pending' | 'partial' | 'completed';
    paidAmount: number;
    remainingAmount: number;
  };

  // === Category 5: Document Management (Required) ===
  documents?: {
    id: string;
    type: 'receipt' | 'medical_record' | 'diagnosis' | 'prescription' | 'xray' | 'lab_result' | 'photo' | 'other';
    name: string;
    uri: string;                    // S3 URL ⭐
    mimeType: string;
    size: number;
    uploadedAt: string;
    uploadedBy?: string;
  }[];

  // === Category 6: Insurance Matching (Auto) ===
  insuranceClaimId?: string;
  isInsuranceCovered?: boolean;
  insuranceProvider?: string;
  claimStatus?: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'paid';
  insuranceCoverageType?: CoverageType;  // AI auto-classification ⭐
  insuranceEligibilityVerified?: boolean;
  verificationDate?: string;

  // === Category 7: Claim History (Multi-claim) ===
  claimHistory?: {
    claimId: string;
    status: string;
    submittedAt: string;
    amount: number;
    isPrimary: boolean;             // Primary insurance flag
  }[];

  // === Category 8: Follow-up ===
  followUp?: {
    required: boolean;
    scheduledDate?: string;
    notes?: string;
  };

  // === Category 9: Procedure Codes (Optional) ===
  procedureCode?: string;           // Korean procedure code
  diagnosisCode?: string;           // KCD code

  // === Category 10: Metadata ===
  createdBy?: 'patient' | 'hospital_staff' | 'system';
  recordStatus?: 'draft' | 'completed' | 'billed' | 'settled';
  hospitalName?: string;            // Denormalized for quick lookup ⭐

  // Hospital payment tracking
  hospitalPaymentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  hospitalPaidAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDueDate: string;
  veterinarian: string;
  hospitalId: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  reviewCount: number;
  services: string[];
  specialties?: string[]; // Alias for services (for HospitalCard compatibility)
  openHours?: OpenHours;
  openingHours?: {
    [key: string]:
      | string // Mock format: "09:00-20:00"
      | {     // Backend format
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
  };
  images?: string[];
  isEmergency: boolean;
  isOpen?: boolean;
  hasParking?: boolean;
  hasEmergency?: boolean;
  has24Hour?: boolean;
  hasNightCare?: boolean;
  description?: string;
}

export interface OpenHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  petId: string;
  hospitalId: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

export interface OnboardingScreen {
  id: number;
  title: string;
  description: string;
  image: string;
}

// Insurance types
export * from './insurance';
