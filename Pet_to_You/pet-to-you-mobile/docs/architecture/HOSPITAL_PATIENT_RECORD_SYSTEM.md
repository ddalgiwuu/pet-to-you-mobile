# Hospital-to-Patient Medical Record Transmission System
## Comprehensive Architecture Design

---

## Executive Summary

This document outlines the architecture for a bidirectional medical record management system between hospitals and pet owners in the Pet-to-You platform. The system enables hospitals to transmit treatment records directly to users and allows users to request records from hospitals they've visited.

---

## 1. System Overview

### 1.1 Current State Analysis

**Existing Components:**
- `MedicalRecord` type with comprehensive fields (cost breakdown, documents, insurance info)
- User-initiated record creation via `/app/health/create.tsx`
- Hospital dashboard at `/app/hospital/dashboard.tsx`
- API client with hospital dashboard endpoints in `services/api.ts`
- Insurance claim integration with auto-submission capability

**Gaps Identified:**
- No hospital-initiated record transmission
- No record request workflow from user to hospital
- No push notification infrastructure for record events
- No record acceptance/modification workflow
- No payment integration for record requests

### 1.2 Proposed System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Pet-to-You Platform                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐          ┌─────────────────┐                   │
│  │   User Mobile   │◄────────►│ Hospital Portal │                   │
│  │      App        │          │   Dashboard     │                   │
│  └────────┬────────┘          └────────┬────────┘                   │
│           │                            │                             │
│           ▼                            ▼                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     API Gateway                               │   │
│  │  (Authentication, Rate Limiting, Request Routing)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│           │                            │                             │
│           ▼                            ▼                             │
│  ┌─────────────────┐          ┌─────────────────┐                   │
│  │  Record Service │◄────────►│ Transmission    │                   │
│  │                 │          │   Service       │                   │
│  └────────┬────────┘          └────────┬────────┘                   │
│           │                            │                             │
│           ▼                            ▼                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Event Bus (Kafka/Redis)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│           │         │         │         │                           │
│           ▼         ▼         ▼         ▼                           │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐                  │
│  │Push    │ │Insurance │ │Payment  │ │Audit     │                  │
│  │Service │ │Service   │ │Service  │ │Service   │                  │
│  └────────┘ └──────────┘ └─────────┘ └──────────┘                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Schema Design

### 2.1 New Types (types/recordTransmission.ts)

```typescript
/**
 * Record Transmission Types for Pet-to-You
 * Bidirectional medical record management between hospitals and users
 */

// ==================== Transmission States ====================

/**
 * Transmission status lifecycle
 */
export type TransmissionStatus =
  | 'draft'           // Hospital creating record (not sent)
  | 'pending_review'  // Sent to user, awaiting review
  | 'accepted'        // User accepted the record
  | 'modification_requested' // User requested changes
  | 'modified'        // Hospital modified based on request
  | 'rejected'        // User rejected the record
  | 'auto_accepted'   // Auto-accepted after timeout
  | 'cancelled';      // Hospital cancelled transmission

/**
 * Request status lifecycle
 */
export type RecordRequestStatus =
  | 'pending'         // User submitted request
  | 'viewed'          // Hospital viewed request
  | 'pricing'         // Hospital preparing quote
  | 'quoted'          // Quote sent to user
  | 'payment_pending' // User accepted, awaiting payment
  | 'paid'            // Payment completed
  | 'processing'      // Hospital preparing record
  | 'completed'       // Record sent to user
  | 'rejected'        // Hospital rejected request
  | 'cancelled';      // User cancelled request

// ==================== Core Models ====================

/**
 * Record Transmission - Hospital-initiated record sending
 */
export interface RecordTransmission {
  id: string;
  hospitalId: string;
  userId: string;
  petId: string;
  
  // Record reference
  medicalRecordId: string;
  medicalRecord?: MedicalRecord; // Populated on fetch
  
  // Transmission metadata
  status: TransmissionStatus;
  sentAt: string;
  reviewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  
  // Modification tracking
  modificationRequests?: ModificationRequest[];
  modificationCount: number;
  
  // User response
  userNotes?: string;
  userSignature?: string;
  
  // Hospital metadata
  sentBy: string; // Staff ID who sent
  hospitalName: string;
  
  // Auto-claim trigger
  triggerAutoClaim: boolean;
  autoClaimProcessed: boolean;
  
  // Expiry
  expiresAt: string; // Auto-accept after this date
  
  // Audit
  timeline: TransmissionTimeline[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Modification Request - User's request for changes
 */
export interface ModificationRequest {
  id: string;
  transmissionId: string;
  
  // Request details
  requestedAt: string;
  requestedBy: string; // User ID
  
  // What needs modification
  fields: {
    fieldName: string;
    currentValue: any;
    requestedChange: string;
    reason?: string;
  }[];
  
  // Hospital response
  status: 'pending' | 'accepted' | 'rejected' | 'partial';
  respondedAt?: string;
  respondedBy?: string; // Staff ID
  responseNotes?: string;
  
  // Modified values (if accepted)
  modifications?: {
    fieldName: string;
    oldValue: any;
    newValue: any;
  }[];
}

/**
 * Record Request - User-initiated record request
 */
export interface RecordRequest {
  id: string;
  userId: string;
  petId: string;
  hospitalId: string;
  
  // Request details
  visitDate: string; // Approximate visit date
  visitReason: string; // Why they visited
  recordTypes: RecordRequestType[];
  urgency: 'normal' | 'urgent';
  notes?: string;
  
  // Hospital response
  status: RecordRequestStatus;
  hospitalNotes?: string;
  
  // Pricing
  pricing?: RecordRequestPricing;
  paymentId?: string;
  
  // Fulfillment
  transmissionId?: string; // Link to created transmission
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Timeline
  timeline: RequestTimeline[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Record request types
 */
export type RecordRequestType =
  | 'full_medical_record'
  | 'diagnosis_certificate'
  | 'treatment_summary'
  | 'prescription_history'
  | 'vaccination_record'
  | 'lab_results'
  | 'imaging_results'
  | 'surgery_report'
  | 'hospitalization_summary';

/**
 * Pricing for record request
 */
export interface RecordRequestPricing {
  basePrice: number;
  urgencyFee?: number;
  documentFees: {
    type: RecordRequestType;
    price: number;
  }[];
  totalPrice: number;
  currency: 'KRW';
  validUntil: string;
  
  // Hospital policy reference
  hospitalPricingPolicyId?: string;
}

// ==================== Timeline Types ====================

/**
 * Transmission timeline event
 */
export interface TransmissionTimeline {
  id: string;
  event: TransmissionTimelineEvent;
  timestamp: string;
  actor: {
    type: 'hospital_staff' | 'user' | 'system';
    id: string;
    name?: string;
  };
  details?: string;
  metadata?: Record<string, any>;
}

export type TransmissionTimelineEvent =
  | 'created'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'modification_requested'
  | 'modification_responded'
  | 'modified'
  | 'auto_accepted'
  | 'cancelled'
  | 'insurance_claim_triggered';

/**
 * Request timeline event
 */
export interface RequestTimeline {
  id: string;
  event: RequestTimelineEvent;
  timestamp: string;
  actor: {
    type: 'hospital_staff' | 'user' | 'system';
    id: string;
    name?: string;
  };
  details?: string;
  metadata?: Record<string, any>;
}

export type RequestTimelineEvent =
  | 'submitted'
  | 'viewed'
  | 'quoted'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'payment_initiated'
  | 'payment_completed'
  | 'processing_started'
  | 'completed'
  | 'rejected'
  | 'cancelled';

// ==================== Notification Types ====================

/**
 * Push notification payload
 */
export interface RecordNotification {
  id: string;
  type: RecordNotificationType;
  recipientId: string;
  recipientType: 'user' | 'hospital';
  
  // Payload
  title: string;
  body: string;
  data: {
    actionType: string;
    entityId: string;
    entityType: 'transmission' | 'request';
    deepLink: string;
  };
  
  // Delivery
  sentAt: string;
  readAt?: string;
  
  createdAt: string;
}

export type RecordNotificationType =
  // User notifications
  | 'new_record_received'
  | 'record_modification_completed'
  | 'request_quoted'
  | 'request_completed'
  | 'request_rejected'
  // Hospital notifications
  | 'new_record_request'
  | 'modification_requested'
  | 'record_accepted'
  | 'record_rejected'
  | 'payment_received';

// ==================== Hospital-User Relationship ====================

/**
 * Track hospital-user relationship for permissions
 */
export interface HospitalUserRelationship {
  id: string;
  hospitalId: string;
  userId: string;
  
  // Relationship
  firstVisitDate: string;
  lastVisitDate: string;
  visitCount: number;
  
  // Pets treated at this hospital
  petIds: string[];
  
  // Consent
  recordSharingConsent: boolean;
  consentDate?: string;
  
  // Preferences
  preferredNotificationMethod: 'push' | 'sms' | 'email';
  autoAcceptRecords: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ==================== Extended MedicalRecord ====================

/**
 * Additional fields for MedicalRecord type (types/index.ts)
 * These should be added to the existing MedicalRecord interface
 */
export interface MedicalRecordTransmissionExtension {
  // Transmission tracking
  transmissionId?: string;
  transmissionStatus?: TransmissionStatus;
  transmittedAt?: string;
  
  // Source tracking
  source: 'user_created' | 'hospital_transmitted' | 'imported';
  sourceHospitalVerified: boolean;
  
  // Digital signature
  hospitalSignature?: {
    signedBy: string;
    signedAt: string;
    certificateId?: string;
  };
  
  // User acknowledgment
  userAcknowledged: boolean;
  userAcknowledgedAt?: string;
}
```

### 2.2 MedicalRecord Type Extension

Add to `types/index.ts` MedicalRecord interface:

```typescript
// === Category 11: Transmission Tracking ===
transmissionId?: string;
transmissionStatus?: 'draft' | 'pending_review' | 'accepted' | 'modification_requested' | 'modified' | 'rejected' | 'auto_accepted' | 'cancelled';
transmittedAt?: string;

// === Category 12: Source & Verification ===
source?: 'user_created' | 'hospital_transmitted' | 'imported';
sourceHospitalVerified?: boolean;
hospitalSignature?: {
  signedBy: string;
  signedAt: string;
  certificateId?: string;
};

// === Category 13: User Acknowledgment ===
userAcknowledged?: boolean;
userAcknowledgedAt?: string;
```

---

## 3. API Specifications

### 3.1 Hospital-Initiated Record Flow APIs

#### 3.1.1 Create and Send Record

```yaml
POST /api/v1/hospitals/{hospitalId}/transmissions
Authorization: Bearer {hospital_staff_token}
Content-Type: application/json

Request:
{
  "petId": "string",
  "userId": "string",
  "bookingId": "string (optional)",
  "medicalRecord": {
    "date": "2026-01-30T09:00:00Z",
    "type": "checkup",
    "diagnosis": "급성 위장염",
    "treatment": "수액치료, 항생제 투여",
    "veterinarian": "김수의 원장",
    "costBreakdown": {...},
    "payment": {...},
    "documents": [...]
  },
  "triggerAutoClaim": true,
  "expiryDays": 7,
  "notes": "추가 설명"
}

Response:
{
  "success": true,
  "data": {
    "transmission": {...},
    "medicalRecord": {...},
    "notificationSent": true
  }
}
```

#### 3.1.2 Get Transmission Status

```yaml
GET /api/v1/hospitals/{hospitalId}/transmissions/{transmissionId}
Authorization: Bearer {hospital_staff_token}

Response:
{
  "success": true,
  "data": {
    "transmission": {...},
    "medicalRecord": {...},
    "modificationRequests": [...],
    "timeline": [...]
  }
}
```

#### 3.1.3 Respond to Modification Request

```yaml
POST /api/v1/hospitals/{hospitalId}/transmissions/{transmissionId}/modifications/{modificationId}/respond
Authorization: Bearer {hospital_staff_token}
Content-Type: application/json

Request:
{
  "status": "accepted" | "rejected" | "partial",
  "modifications": [
    {
      "fieldName": "diagnosis",
      "newValue": "만성 위장염"
    }
  ],
  "responseNotes": "진단명 수정 완료"
}
```

### 3.2 User Response APIs

#### 3.2.1 Get Pending Transmissions

```yaml
GET /api/v1/users/{userId}/transmissions?status=pending_review
Authorization: Bearer {user_token}

Response:
{
  "success": true,
  "data": {
    "transmissions": [...],
    "total": 5,
    "unread": 2
  }
}
```

#### 3.2.2 Accept Record

```yaml
POST /api/v1/users/{userId}/transmissions/{transmissionId}/accept
Authorization: Bearer {user_token}
Content-Type: application/json

Request:
{
  "signature": "base64_signature (optional)",
  "notes": "확인했습니다"
}

Response:
{
  "success": true,
  "data": {
    "transmission": {...},
    "medicalRecord": {...},
    "autoClaimSuggestion": {...} // If triggerAutoClaim was true
  }
}
```

#### 3.2.3 Request Modification

```yaml
POST /api/v1/users/{userId}/transmissions/{transmissionId}/request-modification
Authorization: Bearer {user_token}
Content-Type: application/json

Request:
{
  "fields": [
    {
      "fieldName": "actualCost",
      "currentValue": 150000,
      "requestedChange": "진료비 영수증과 금액이 다릅니다",
      "reason": "영수증 기준 12만원"
    }
  ]
}
```

#### 3.2.4 Reject Record

```yaml
POST /api/v1/users/{userId}/transmissions/{transmissionId}/reject
Authorization: Bearer {user_token}
Content-Type: application/json

Request:
{
  "reason": "진료받은 적이 없습니다",
  "notes": "다른 보호자의 반려동물인 것 같습니다"
}
```

### 3.3 User-Initiated Record Request APIs

#### 3.3.1 Create Record Request

```yaml
POST /api/v1/users/{userId}/record-requests
Authorization: Bearer {user_token}
Content-Type: application/json

Request:
{
  "hospitalId": "hospital-123",
  "petId": "pet-456",
  "visitDate": "2026-01-15",
  "visitReason": "정기검진",
  "recordTypes": ["full_medical_record", "vaccination_record"],
  "urgency": "normal",
  "notes": "1월 15일 정기검진 기록 요청드립니다"
}

Response:
{
  "success": true,
  "data": {
    "request": {...},
    "estimatedResponseTime": "24시간 이내"
  }
}
```

#### 3.3.2 Get Request Quote

```yaml
GET /api/v1/users/{userId}/record-requests/{requestId}
Authorization: Bearer {user_token}

Response:
{
  "success": true,
  "data": {
    "request": {...},
    "pricing": {
      "basePrice": 10000,
      "documentFees": [...],
      "totalPrice": 25000,
      "validUntil": "2026-02-01T23:59:59Z"
    }
  }
}
```

#### 3.3.3 Accept Quote and Pay

```yaml
POST /api/v1/users/{userId}/record-requests/{requestId}/pay
Authorization: Bearer {user_token}
Content-Type: application/json

Request:
{
  "paymentMethod": "card",
  "paymentToken": "pg_token_xxx"
}

Response:
{
  "success": true,
  "data": {
    "payment": {...},
    "estimatedDelivery": "2026-02-02T18:00:00Z"
  }
}
```

### 3.4 Hospital Request Handling APIs

#### 3.4.1 Get Pending Requests

```yaml
GET /api/v1/hospitals/{hospitalId}/record-requests?status=pending
Authorization: Bearer {hospital_staff_token}

Response:
{
  "success": true,
  "data": {
    "requests": [...],
    "total": 3
  }
}
```

#### 3.4.2 Submit Quote

```yaml
POST /api/v1/hospitals/{hospitalId}/record-requests/{requestId}/quote
Authorization: Bearer {hospital_staff_token}
Content-Type: application/json

Request:
{
  "basePrice": 10000,
  "documentFees": [
    { "type": "full_medical_record", "price": 15000 },
    { "type": "vaccination_record", "price": 5000 }
  ],
  "estimatedDeliveryHours": 24,
  "notes": "3일 이내 발급 가능합니다"
}
```

#### 3.4.3 Fulfill Request (Send Record)

```yaml
POST /api/v1/hospitals/{hospitalId}/record-requests/{requestId}/fulfill
Authorization: Bearer {hospital_staff_token}
Content-Type: application/json

Request:
{
  "medicalRecord": {...},
  "documents": [...]
}
```

---

## 4. Mobile App Architecture

### 4.1 New Screen Structure

```
app/
├── records/                    # Record transmission screens
│   ├── inbox.tsx              # Incoming records list
│   ├── [transmissionId].tsx   # Transmission detail/review
│   ├── modification/
│   │   └── [transmissionId].tsx # Modification request form
│   └── requests/
│       ├── new.tsx            # Create record request
│       ├── [requestId].tsx    # Request detail/tracking
│       └── history.tsx        # Request history
│
├── hospital/                   # Hospital dashboard
│   ├── transmissions/
│   │   ├── create/
│   │   │   └── [bookingId].tsx # Create record for booking
│   │   └── [transmissionId].tsx # Transmission detail
│   ├── requests/
│   │   ├── index.tsx          # Incoming requests
│   │   └── [requestId].tsx    # Handle request
│   └── ...
```

### 4.2 New Hooks

```typescript
// hooks/useRecordTransmissions.ts
export function useRecordTransmissions(options?: { status?: TransmissionStatus }) {...}
export function useTransmissionById(id: string) {...}
export function useAcceptTransmission() {...}
export function useRejectTransmission() {...}
export function useRequestModification() {...}

// hooks/useRecordRequests.ts
export function useRecordRequests(options?: { status?: RecordRequestStatus }) {...}
export function useRecordRequestById(id: string) {...}
export function useCreateRecordRequest() {...}
export function useAcceptQuote() {...}
export function useCancelRequest() {...}

// hooks/useHospitalTransmissions.ts (Hospital dashboard)
export function useHospitalTransmissions(hospitalId: string) {...}
export function useCreateTransmission() {...}
export function useRespondToModification() {...}
export function useHospitalRequests(hospitalId: string) {...}
export function useSubmitQuote() {...}
export function useFulfillRequest() {...}
```

### 4.3 New API Endpoints in services/api.ts

```typescript
// === Record Transmissions (User) ===
getUserTransmissions: (status?: TransmissionStatus) =>
  apiClient.get('/users/me/transmissions', { params: { status } }),

getTransmissionById: (id: string) =>
  apiClient.get(`/users/me/transmissions/${id}`),

acceptTransmission: (id: string, data: { signature?: string; notes?: string }) =>
  apiClient.post(`/users/me/transmissions/${id}/accept`, data),

rejectTransmission: (id: string, data: { reason: string; notes?: string }) =>
  apiClient.post(`/users/me/transmissions/${id}/reject`, data),

requestModification: (id: string, data: ModificationRequestData) =>
  apiClient.post(`/users/me/transmissions/${id}/request-modification`, data),

// === Record Requests (User) ===
getUserRecordRequests: (status?: RecordRequestStatus) =>
  apiClient.get('/users/me/record-requests', { params: { status } }),

createRecordRequest: (data: CreateRecordRequestData) =>
  apiClient.post('/users/me/record-requests', data),

acceptQuote: (requestId: string, paymentData: PaymentData) =>
  apiClient.post(`/users/me/record-requests/${requestId}/pay`, paymentData),

cancelRecordRequest: (requestId: string) =>
  apiClient.post(`/users/me/record-requests/${requestId}/cancel`),

// === Hospital Transmissions ===
createHospitalTransmission: (hospitalId: string, data: CreateTransmissionData) =>
  apiClient.post(`/hospitals/${hospitalId}/transmissions`, data),

getHospitalTransmissions: (hospitalId: string, status?: TransmissionStatus) =>
  apiClient.get(`/hospitals/${hospitalId}/transmissions`, { params: { status } }),

respondToModification: (hospitalId: string, transmissionId: string, modificationId: string, data: ModificationResponseData) =>
  apiClient.post(`/hospitals/${hospitalId}/transmissions/${transmissionId}/modifications/${modificationId}/respond`, data),

// === Hospital Record Requests ===
getHospitalRecordRequests: (hospitalId: string, status?: RecordRequestStatus) =>
  apiClient.get(`/hospitals/${hospitalId}/record-requests`, { params: { status } }),

submitQuote: (hospitalId: string, requestId: string, pricing: RecordRequestPricing) =>
  apiClient.post(`/hospitals/${hospitalId}/record-requests/${requestId}/quote`, pricing),

fulfillRequest: (hospitalId: string, requestId: string, data: FulfillRequestData) =>
  apiClient.post(`/hospitals/${hospitalId}/record-requests/${requestId}/fulfill`, data),

rejectRecordRequest: (hospitalId: string, requestId: string, reason: string) =>
  apiClient.post(`/hospitals/${hospitalId}/record-requests/${requestId}/reject`, { reason }),
```

---

## 5. Push Notification Integration

### 5.1 Notification Service Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Server    │────►│  Event Queue    │────►│  Notification   │
│                 │     │   (Kafka)       │     │    Service      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼─────────┐
                        │                                │         │
                        ▼                                ▼         ▼
                 ┌─────────────┐              ┌─────────────┐ ┌─────────┐
                 │    FCM      │              │    APNS     │ │   SMS   │
                 │  (Android)  │              │   (iOS)     │ │ Gateway │
                 └─────────────┘              └─────────────┘ └─────────┘
```

### 5.2 Notification Types

```typescript
// Notification templates
const NOTIFICATION_TEMPLATES = {
  // User notifications
  new_record_received: {
    title: '새 진료 기록이 도착했습니다',
    body: '{hospitalName}에서 {petName}의 진료 기록을 보냈습니다.',
    deepLink: '/records/inbox/{transmissionId}',
  },
  record_modification_completed: {
    title: '수정 요청이 처리되었습니다',
    body: '{hospitalName}에서 진료 기록을 수정했습니다.',
    deepLink: '/records/{transmissionId}',
  },
  request_quoted: {
    title: '기록 발급 비용이 안내되었습니다',
    body: '{hospitalName}에서 ₩{price}의 비용을 안내했습니다.',
    deepLink: '/records/requests/{requestId}',
  },
  request_completed: {
    title: '요청하신 기록이 도착했습니다',
    body: '{hospitalName}에서 {petName}의 기록을 발급했습니다.',
    deepLink: '/records/requests/{requestId}',
  },
  auto_accept_reminder: {
    title: '기록 검토를 잊으셨나요?',
    body: '{daysLeft}일 후 자동 승인됩니다. 지금 확인해보세요.',
    deepLink: '/records/inbox/{transmissionId}',
  },
  
  // Hospital notifications
  new_record_request: {
    title: '새 기록 발급 요청',
    body: '{userName}님이 {petName}의 기록을 요청했습니다.',
    deepLink: '/hospital/requests/{requestId}',
  },
  modification_requested: {
    title: '기록 수정 요청',
    body: '{userName}님이 진료 기록 수정을 요청했습니다.',
    deepLink: '/hospital/transmissions/{transmissionId}',
  },
  record_accepted: {
    title: '기록이 승인되었습니다',
    body: '{userName}님이 진료 기록을 승인했습니다.',
    deepLink: '/hospital/transmissions/{transmissionId}',
  },
  payment_received: {
    title: '결제가 완료되었습니다',
    body: '{userName}님의 기록 발급 비용 ₩{amount}이 결제되었습니다.',
    deepLink: '/hospital/requests/{requestId}',
  },
};
```

### 5.3 Mobile Push Integration (Expo)

```typescript
// services/pushNotification.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from './api';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id',
  });

  // Register token with backend
  await apiClient.post('/users/me/push-token', {
    token: token.data,
    platform: Platform.OS,
  });

  return token.data;
}

export function setupNotificationHandlers() {
  // Handle notification received while app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Handle notification tap
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { data } = response.notification.request.content;
      if (data.deepLink) {
        // Navigate using expo-router
        router.push(data.deepLink as string);
      }
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
}
```

---

## 6. Payment Integration

### 6.1 Payment Flow for Record Requests

```
User                    App                     Backend                 PG (Toss/카카오페이)
 │                       │                        │                            │
 │──Accept Quote────────►│                        │                            │
 │                       │──Request Payment───────►│                            │
 │                       │                        │──Create Payment────────────►│
 │                       │                        │◄─Payment Key─────────────────│
 │                       │◄─Payment Widget URL────│                            │
 │◄─Show Payment Widget──│                        │                            │
 │                       │                        │                            │
 │──Complete Payment────►│ (PG Widget)            │                            │
 │                       │                        │◄─Webhook: Payment Success──│
 │                       │◄─Payment Confirmed─────│                            │
 │◄─Success + Tracking───│                        │                            │
```

### 6.2 Payment Types

```typescript
// types/payment.ts
export interface RecordRequestPayment {
  id: string;
  requestId: string;
  userId: string;
  hospitalId: string;
  
  // Amount
  amount: number;
  currency: 'KRW';
  
  // Payment gateway
  pgProvider: 'toss' | 'kakaopay' | 'naverpay';
  pgPaymentKey?: string;
  pgOrderId: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  
  // Metadata
  method?: 'card' | 'bank' | 'virtual_account';
  paidAt?: string;
  receiptUrl?: string;
  
  // Refund
  refundedAt?: string;
  refundReason?: string;
  refundAmount?: number;
  
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Security & Compliance

### 7.1 Access Control Matrix

| Action | User | Hospital Staff | Hospital Admin | System |
|--------|------|----------------|----------------|--------|
| View own records | ✅ | - | - | - |
| Accept/Reject transmission | ✅ | - | - | - |
| Request modification | ✅ | - | - | - |
| Request records | ✅ | - | - | - |
| View hospital transmissions | - | ✅ | ✅ | - |
| Create transmission | - | ✅ | ✅ | - |
| Respond to modification | - | ✅ | ✅ | - |
| Handle record requests | - | ✅ | ✅ | - |
| Set pricing policies | - | - | ✅ | - |
| Auto-accept expired transmissions | - | - | - | ✅ |
| Trigger insurance claims | - | - | - | ✅ |

### 7.2 Data Protection

```typescript
// Security measures
const SECURITY_CONFIG = {
  // PHI encryption
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotation: '90d',
    atRest: true,
    inTransit: true,
  },
  
  // Document storage
  documentStorage: {
    provider: 'AWS S3',
    encryption: 'SSE-S3',
    presignedUrlExpiry: 3600, // 1 hour
    accessLogging: true,
  },
  
  // Audit logging
  auditLog: {
    events: ['create', 'read', 'update', 'delete', 'export'],
    retention: '7y', // Korean law requirement
    immutable: true,
  },
  
  // Rate limiting
  rateLimiting: {
    transmission: { window: '1h', max: 100 }, // per hospital
    request: { window: '1h', max: 20 }, // per user
  },
};
```

### 7.3 Compliance Requirements

```yaml
Korean Privacy Laws:
  - 개인정보보호법 (Personal Information Protection Act)
  - 의료법 (Medical Service Act)
  - 전자서명법 (Electronic Signature Act)

Requirements:
  - PHI must be encrypted at rest and in transit
  - 7-year retention for medical records
  - Explicit consent for record sharing
  - Audit trail for all PHI access
  - Data portability (user can request all data)
  - Right to deletion (with legal retention exceptions)
  
Implementation:
  - Digital signature verification for hospital records
  - Consent tracking per hospital-user relationship
  - Immutable audit logs (write-once storage)
  - Anonymization for analytics
```

---

## 8. Insurance Auto-Claim Integration

### 8.1 Trigger Conditions

```typescript
interface AutoClaimTriggerConditions {
  // Transmission must be accepted
  transmissionAccepted: boolean;
  
  // User has active insurance policy
  hasActivePolicy: boolean;
  
  // Policy covers the treatment type
  coverageTypeMatch: boolean;
  
  // Within waiting period end date
  waitingPeriodPassed: boolean;
  
  // User opted in for auto-claim
  userOptedIn: boolean;
  
  // Hospital is verified/accredited
  hospitalVerified: boolean;
  
  // Documents complete
  hasRequiredDocuments: boolean;
}
```

### 8.2 Auto-Claim Flow

```
Record Accepted
      │
      ▼
┌─────────────────┐
│ Check Insurance │
│    Policies     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Active  │ No ─────► End
    │ Policy? │
    └────┬────┘
         │ Yes
         ▼
┌─────────────────┐
│ Check Coverage  │
│     Type        │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Covered │ No ─────► End
    │   ?     │
    └────┬────┘
         │ Yes
         ▼
┌─────────────────┐
│ Create Auto     │
│ Claim Suggestion│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notify User     │
│ (Push + In-App) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Reviews    │
│ and Submits     │
└─────────────────┘
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (2 weeks)
- [ ] Create new type definitions
- [ ] Extend MedicalRecord type
- [ ] Implement database migrations
- [ ] Create API endpoints (backend)
- [ ] Create basic API client methods

### Phase 2: Hospital-Initiated Flow (2 weeks)
- [ ] Hospital transmission creation UI
- [ ] User inbox for pending records
- [ ] Accept/Reject workflow
- [ ] Modification request flow
- [ ] Push notifications for user

### Phase 3: User-Initiated Flow (2 weeks)
- [ ] Record request creation UI
- [ ] Hospital request handling UI
- [ ] Quote/pricing workflow
- [ ] Payment integration
- [ ] Request tracking UI

### Phase 4: Integration & Polish (1 week)
- [ ] Insurance auto-claim trigger
- [ ] Comprehensive notification system
- [ ] Error handling & edge cases
- [ ] Performance optimization
- [ ] Testing & QA

### Phase 5: Security & Compliance (1 week)
- [ ] Security audit
- [ ] Compliance verification
- [ ] Penetration testing
- [ ] Documentation

---

## 10. Component Diagrams

### 10.1 User Record Inbox Screen

```
┌─────────────────────────────────────────────────────────┐
│ ← 진료 기록 수신함                                      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📋 미확인 기록 2건                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🏥 24시 강남동물병원                      1시간 전  │ │
│ │    멍멍이 - 정기검진                                │ │
│ │    진료비: ₩85,000                                  │ │
│ │    ┌──────────┐ ┌──────────┐ ┌──────────┐         │ │
│ │    │  확인   │ │ 수정요청 │ │  거부   │         │ │
│ │    └──────────┘ └──────────┘ └──────────┘         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🏥 서울동물메디컬센터                    2일 전    │ │
│ │    야옹이 - 수술 (중성화)                          │ │
│ │    진료비: ₩250,000                                │ │
│ │    7일 후 자동 승인                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│ 📝 확인 완료 (15건)                              더보기 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Hospital Transmission Creation Screen

```
┌─────────────────────────────────────────────────────────┐
│ ← 진료 기록 전송                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 예약 정보                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 김철수 고객님                                    │ │
│ │ 🐕 멍멍이 (골든리트리버, 3세)                       │ │
│ │ 📅 2026.01.30 14:00 정기검진                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 진단 및 치료 *                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 진단명: 건강함 (정기검진)                           │ │
│ │ 치료내역: 기본검진, 혈액검사, 예방접종              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 비용 정보 *                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 진찰료          ₩30,000                             │ │
│ │ 혈액검사        ₩45,000                             │ │
│ │ 예방접종        ₩35,000                             │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ 합계            ₩110,000                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 첨부 서류                                               │
│ ┌──────────┐ ┌──────────┐                              │
│ │ 📷 사진  │ │ 📄 파일  │                              │
│ └──────────┘ └──────────┘                              │
│                                                         │
│ ☑️ 보험 자동청구 안내 포함                              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                      전송하기                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Error Handling & Edge Cases

### 11.1 Error Scenarios

| Scenario | Handling |
|----------|----------|
| Network failure during transmission | Queue locally, retry with exponential backoff |
| User reviews after expiry | Show expired state, allow manual claim |
| Hospital modifies after user accepted | Create new transmission, notify user |
| Payment failure | Retry payment, hold request status |
| Duplicate transmission | Detect by booking ID, warn hospital staff |
| User deletes account | Anonymize records, maintain for compliance |
| Hospital closes | Transfer records to parent org or archive |

### 11.2 Validation Rules

```typescript
const VALIDATION_RULES = {
  transmission: {
    maxDaysAfterVisit: 30, // Can send up to 30 days after visit
    maxModificationRequests: 3, // User can request max 3 modifications
    autoAcceptDays: 7, // Auto-accept after 7 days
    expiryMinDays: 3, // Minimum expiry 3 days
    expiryMaxDays: 30, // Maximum expiry 30 days
  },
  request: {
    maxActiveRequests: 5, // Per user
    quoteValidityHours: 72, // Quote valid for 72 hours
    maxRetries: 3, // Payment retry limit
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10MB per document
    maxCount: 10, // Max 10 documents per record
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
};
```

---

## 12. Success Metrics

### 12.1 Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Transmission acceptance rate | >90% | Accepted / Total sent |
| Average review time | <24h | Time from sent to reviewed |
| Modification request rate | <10% | Modifications / Total |
| Request fulfillment time | <48h | Time from paid to delivered |
| Auto-claim conversion rate | >70% | Claims submitted / Suggestions |
| User satisfaction | >4.5/5 | Post-interaction survey |

### 12.2 Monitoring Dashboard

```yaml
Real-time Metrics:
  - Active transmissions pending review
  - Pending record requests
  - Failed payments (last 24h)
  - Average response time

Daily Reports:
  - Transmissions sent/accepted/rejected
  - Requests created/fulfilled
  - Revenue from record requests
  - Insurance claims triggered

Alerts:
  - Transmission review SLA breach (>48h)
  - Request fulfillment SLA breach (>72h)
  - Payment failure rate >5%
  - System error rate >1%
```

---

## Appendix A: Database Schema (PostgreSQL)

```sql
-- Record Transmissions
CREATE TABLE record_transmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    user_id UUID NOT NULL REFERENCES users(id),
    pet_id UUID NOT NULL REFERENCES pets(id),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id),
    
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    modification_count INTEGER DEFAULT 0,
    user_notes TEXT,
    user_signature TEXT,
    
    sent_by UUID REFERENCES hospital_staff(id),
    hospital_name VARCHAR(200) NOT NULL,
    
    trigger_auto_claim BOOLEAN DEFAULT FALSE,
    auto_claim_processed BOOLEAN DEFAULT FALSE,
    
    expires_at TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modification Requests
CREATE TABLE modification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transmission_id UUID NOT NULL REFERENCES record_transmissions(id),
    
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    requested_by UUID NOT NULL REFERENCES users(id),
    
    fields JSONB NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES hospital_staff(id),
    response_notes TEXT,
    modifications JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Record Requests
CREATE TABLE record_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    pet_id UUID NOT NULL REFERENCES pets(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    
    visit_date DATE NOT NULL,
    visit_reason TEXT NOT NULL,
    record_types TEXT[] NOT NULL,
    urgency VARCHAR(10) DEFAULT 'normal',
    notes TEXT,
    
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    hospital_notes TEXT,
    
    pricing JSONB,
    payment_id UUID REFERENCES payments(id),
    
    transmission_id UUID REFERENCES record_transmissions(id),
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transmissions_user ON record_transmissions(user_id, status);
CREATE INDEX idx_transmissions_hospital ON record_transmissions(hospital_id, status);
CREATE INDEX idx_requests_user ON record_requests(user_id, status);
CREATE INDEX idx_requests_hospital ON record_requests(hospital_id, status);
```

---

## Appendix B: Sequence Diagrams

### B.1 Hospital-Initiated Record Flow

```
Hospital Staff          Backend              User App            Push Service
     │                    │                    │                     │
     │──Create Record────►│                    │                     │
     │                    │──Store Record─────►│                     │
     │                    │──Create Transmit──►│                     │
     │◄─Transmission ID───│                    │                     │
     │                    │                    │                     │
     │──Send to User─────►│                    │                     │
     │                    │──Update Status────►│                     │
     │                    │──────────────────────────────────────────►│
     │                    │                    │◄─Push Notification───│
     │                    │                    │                     │
     │                    │◄─────User Opens────│                     │
     │                    │                    │◄─Show Transmission───│
     │                    │                    │                     │
     │                    │◄──Accept/Reject────│                     │
     │                    │──Update Status────►│                     │
     │                    │──────────────────────────────────────────►│
     │◄─Push Notification─│                    │                     │
     │                    │                    │                     │
     │                    │──Trigger AutoClaim─│                     │
     │                    │                    │◄─Claim Suggestion────│
```

### B.2 User-Initiated Record Request Flow

```
User App              Backend              Hospital Dashboard     Payment Gateway
   │                    │                        │                      │
   │──Create Request───►│                        │                      │
   │                    │──Store Request────────►│                      │
   │                    │──Push Notification────►│                      │
   │◄─Request ID────────│                        │                      │
   │                    │                        │                      │
   │                    │◄──Submit Quote─────────│                      │
   │                    │──Update Request───────►│                      │
   │◄─Quote Notification│                        │                      │
   │                    │                        │                      │
   │──Accept Quote─────►│                        │                      │
   │                    │──Create Payment───────────────────────────────►│
   │                    │◄─Payment Widget URL───────────────────────────│
   │◄─Redirect to Pay───│                        │                      │
   │                    │                        │                      │
   │──Complete Payment─────────────────────────────────────────────────►│
   │                    │◄─Payment Webhook──────────────────────────────│
   │                    │──Update Status────────►│                      │
   │◄─Payment Confirmed─│                        │                      │
   │                    │──Push: Paid───────────►│                      │
   │                    │                        │                      │
   │                    │◄──Fulfill Request──────│                      │
   │                    │──Create Transmission──►│                      │
   │◄─Record Delivered──│                        │                      │
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-30  
**Author:** Claude Architecture Team
