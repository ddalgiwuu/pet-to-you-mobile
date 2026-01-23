# Pet to You - Backend API 상세 명세서

> 모든 엔드포인트의 비즈니스 로직, 데이터베이스 쿼리, 보안, 성능을 상세히 기술합니다.

**버전**: v2.1
**작성일**: 2025-12-29
**백엔드 기술**: NestJS 10 + PostgreSQL 16 + Prisma 5

---

## 목차

1. [인증 API](#1-인증-api)
2. [병원 예약 API](#2-병원-예약-api) ⭐ 핵심
3. [유치원 API](#3-유치원-api) ⭐ 핵심
4. [입양 API](#4-입양-api) ⭐ 핵심
5. [보험 API](#5-보험-api) ⭐ 핵심
6. [어드민 API](#6-어드민-api)
7. [공통 사항](#7-공통-사항)

---

## 1. 인증 API

### POST /auth/social-login

#### 개요
- **목적**: 소셜 로그인 (카카오, Apple, 네이버)
- **인증**: 불필요 (Public)
- **Rate Limit**: IP당 분당 10회

#### 비즈니스 로직

**Flow**:
```
1. 소셜 로그인 토큰 검증
   ├─ Kakao API 호출
   ├─ Apple API 호출
   └─ Naver API 호출
   ↓
2. 사용자 정보 추출 (이메일, 이름, 프로필 사진)
   ↓
3. DB에서 사용자 조회 (email + provider)
   ├─ 존재: 업데이트 (lastLoginAt)
   └─ 미존재: 신규 생성
   ↓
4. JWT 토큰 발급
   ├─ Access Token (1시간)
   └─ Refresh Token (7일)
   ↓
5. 응답 반환
```

#### Request
```json
{
  "provider": "KAKAO",  // KAKAO | APPLE | NAVER
  "accessToken": "kakao_access_token_string"
}
```

#### Response (201 Created)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@kakao.com",
    "name": "김민지",
    "profileImageUrl": "https://...",
    "authProvider": "KAKAO",
    "createdAt": "2025-12-29T10:00:00Z"
  }
}
```

#### 에러 케이스
```
400 Bad Request:
  - provider가 enum에 없음
  - accessToken 누락

401 Unauthorized:
  - 소셜 로그인 토큰 검증 실패
  - 토큰 만료됨

500 Internal Server Error:
  - 소셜 API 호출 실패
  - DB 연결 오류
```

#### 데이터베이스 쿼리

**Prisma 코드**:
```typescript
// 1. 사용자 조회 또는 생성
const user = await prisma.user.upsert({
  where: {
    email_authProvider: {
      email: socialUserInfo.email,
      authProvider: provider
    }
  },
  update: {
    lastLoginAt: new Date(),
    profileImageUrl: socialUserInfo.profileImageUrl
  },
  create: {
    email: socialUserInfo.email,
    name: socialUserInfo.name,
    authProvider: provider,
    authProviderId: socialUserInfo.id,
    profileImageUrl: socialUserInfo.profileImageUrl
  }
});
```

#### 보안 고려사항
- ✅ OAuth State 파라미터 검증 (CSRF 방어)
- ✅ 소셜 로그인 토큰 서버 측 검증 필수
- ✅ JWT Secret은 환경 변수 (256bit 이상)
- ✅ Refresh Token은 httpOnly cookie 저장

#### 성능
- 소셜 API 호출: 평균 200-500ms
- DB upsert: 10-20ms
- 총 응답 시간 목표: < 1초

#### 테스트 케이스
- ✅ 카카오 로그인 성공
- ✅ 신규 사용자 생성
- ✅ 기존 사용자 로그인
- ✅ 잘못된 토큰 거부
- ✅ 지원하지 않는 provider 거부

---

## 2. 병원 예약 API ⭐ 핵심

### POST /appointments

#### 개요
- **목적**: 새로운 병원 예약 생성
- **인증**: Required (JWT)
- **권한**: 사용자 본인만
- **Rate Limit**: 사용자당 분당 10회

#### 비즈니스 로직

**Flow**:
```
1. 인증 확인 (JWT Guards)
   ↓
2. 권한 확인
   ├─ petId 소유권 (user.id = pet.userId)
   └─ hospitalId 존재 여부
   ↓
3. 유효성 검증
   ├─ appointmentDateTime이 미래인가?
   ├─ appointmentDateTime이 병원 영업시간 내인가?
   └─ 시간 중복 있는가? (같은 병원, 같은 시간, 활성 예약)
   ↓
4. 예약 생성 (트랜잭션)
   ├─ appointments 테이블에 INSERT
   └─ notifications 테이블에 INSERT (병원 알림)
   ↓
5. 알림 발송
   ├─ 사용자: "예약이 접수되었습니다"
   └─ 병원: "새 예약이 있습니다" (어드민 푸시)
   ↓
6. 응답 반환
```

#### Request
```json
{
  "petId": "550e8400-e29b-41d4-a716-446655440000",
  "hospitalId": "660e8400-e29b-41d4-a716-446655440001",
  "appointmentDateTime": "2025-12-30T10:00:00Z",
  "treatmentType": "GENERAL",
  "symptoms": "기침을 심하게 하고 식욕이 없어요",
  "specialNotes": "슬개골 탈구 수술 병력 있음"
}
```

#### DTO (class-validator)
```typescript
export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsUUID()
  @IsNotEmpty()
  hospitalId: string;

  @IsISO8601()
  @IsNotEmpty()
  @IsFutureDate() // Custom validator
  appointmentDateTime: string;

  @IsEnum(TreatmentType)
  @IsNotEmpty()
  treatmentType: TreatmentType;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  symptoms?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  specialNotes?: string;
}
```

#### Response (201 Created)
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "PENDING",
  "appointmentDateTime": "2025-12-30T10:00:00Z",
  "treatmentType": "GENERAL",
  "symptoms": "기침을 심하게 하고 식욕이 없어요",
  "specialNotes": "슬개골 탈구 수술 병력 있음",
  "pet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "초코",
    "species": "DOG",
    "breed": "웰시코기"
  },
  "hospital": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "도그마루 메디컬 센터",
    "address": "서울시 강남구 ...",
    "phone": "02-1234-5678"
  },
  "createdAt": "2025-12-29T21:30:00Z"
}
```

#### 에러 케이스 (상세)

**400 Bad Request**:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "appointmentDateTime",
    "issue": "Must be a future date"
  }
}
```

**403 Forbidden**:
```json
{
  "code": "FORBIDDEN",
  "message": "You don't own this pet",
  "details": {
    "petId": "550e8400-...",
    "ownerId": "different-user-id"
  }
}
```

**404 Not Found**:
```json
{
  "code": "NOT_FOUND",
  "message": "Hospital not found",
  "details": {
    "hospitalId": "660e8400-..."
  }
}
```

**409 Conflict**:
```json
{
  "code": "TIME_CONFLICT",
  "message": "This time slot is already booked",
  "details": {
    "hospitalId": "660e8400-...",
    "conflictingDateTime": "2025-12-30T10:00:00Z",
    "suggestion": "Please choose another time"
  }
}
```

#### 데이터베이스 쿼리 (상세)

**1. 반려동물 소유권 확인**:
```typescript
const pet = await prisma.pet.findFirst({
  where: {
    id: dto.petId,
    userId: currentUserId,
    isDeleted: false
  }
});

if (!pet) {
  throw new ForbiddenException('You don\'t own this pet');
}
```

**2. 병원 존재 및 영업 확인**:
```typescript
const hospital = await prisma.hospital.findUnique({
  where: { id: dto.hospitalId },
  select: {
    id: true,
    name: true,
    openingHours: true,
    isActive: true
  }
});

if (!hospital || !hospital.isActive) {
  throw new NotFoundException('Hospital not found or inactive');
}

// 영업시간 체크
const isOpen = this.checkIfHospitalIsOpen(
  hospital.openingHours,
  dto.appointmentDateTime
);
if (!isOpen) {
  throw new BadRequestException('Hospital is closed at this time');
}
```

**3. 시간 중복 확인** (중요!):
```typescript
const existingAppointment = await prisma.appointment.findFirst({
  where: {
    hospitalId: dto.hospitalId,
    appointmentDateTime: dto.appointmentDateTime,
    status: {
      in: ['PENDING', 'CONFIRMED'] // 취소된 것은 제외
    }
  }
});

if (existingAppointment) {
  throw new ConflictException('Time slot already booked');
}
```

**4. 예약 생성 (트랜잭션)**:
```typescript
const appointment = await prisma.$transaction(async (tx) => {
  // 예약 생성
  const newAppointment = await tx.appointment.create({
    data: {
      userId: currentUserId,
      petId: dto.petId,
      hospitalId: dto.hospitalId,
      appointmentDateTime: new Date(dto.appointmentDateTime),
      treatmentType: dto.treatmentType,
      symptoms: dto.symptoms,
      specialNotes: dto.specialNotes,
      status: 'PENDING'
    },
    include: {
      pet: {
        select: { id: true, name: true, species: true, breed: true }
      },
      hospital: {
        select: { id: true, name: true, address: true, phone: true }
      }
    }
  });

  // 알림 생성
  await tx.notification.create({
    data: {
      userId: currentUserId,
      type: 'APPOINTMENT_CONFIRMED',
      title: '예약이 접수되었습니다',
      content: `${hospital.name}에 예약이 접수되었습니다.`,
      data: { appointmentId: newAppointment.id }
    }
  });

  return newAppointment;
});
```

#### 인덱스 최적화
```sql
-- 시간 중복 체크 성능 향상
CREATE INDEX idx_appointment_hospital_datetime_status
ON appointments (hospital_id, appointment_date_time, status);

-- 사용자 예약 조회 성능
CREATE INDEX idx_appointment_user_datetime
ON appointments (user_id, appointment_date_time DESC);
```

#### 보안 체크리스트
- ✅ JWT 인증 (Guard)
- ✅ 소유권 검증 (petId)
- ✅ Input Validation (DTO)
- ✅ SQL Injection 방어 (Prisma)
- ✅ Rate Limiting
- ✅ 민감 정보 로깅 금지

#### 성능 목표
- 응답 시간: < 200ms (P95)
- DB 쿼리: 3-4회
- 캐시: 병원 정보 (1시간 TTL)

#### 모니터링 메트릭
- 예약 생성 성공률
- 평균 응답 시간
- 시간 중복 발생률
- 에러율 (409, 403, 404)

---

### GET /appointments

#### 개요
- **목적**: 사용자 예약 내역 조회
- **인증**: Required (JWT)
- **권한**: 본인 예약만
- **Pagination**: 필수

#### Request Query Parameters
```
status: PENDING | CONFIRMED | COMPLETED | CANCELLED (옵션)
page: 1 (기본값)
limit: 20 (기본값, 최대 100)
sort: -createdAt (최신순, 기본값)
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "CONFIRMED",
      "appointmentDateTime": "2025-12-30T10:00:00Z",
      "pet": {
        "name": "초코",
        "species": "DOG"
      },
      "hospital": {
        "name": "도그마루 메디컬 센터",
        "address": "서울시 강남구"
      },
      "confirmedAt": "2025-12-29T21:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### 데이터베이스 쿼리
```typescript
const appointments = await prisma.appointment.findMany({
  where: {
    userId: currentUserId,
    ...(status && { status })
  },
  include: {
    pet: {
      select: { id: true, name: true, species: true }
    },
    hospital: {
      select: { id: true, name: true, address: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});

const total = await prisma.appointment.count({
  where: { userId: currentUserId, ...(status && { status }) }
});
```

#### 캐싱
- Redis Key: `user:${userId}:appointments:${page}:${status}`
- TTL: 5분
- 무효화: 예약 생성/수정/취소 시

---

## 3. 유치원 API ⭐ 핵심

### POST /daycare-bookings

#### 개요
- **목적**: 유치원 예약 생성
- **인증**: Required
- **권한**: 사용자 본인
- **비즈니스 복잡도**: 높음 (가격 계산, 픽업/드롭오프)

#### 비즈니스 로직

**Flow**:
```
1. 인증 & 권한 확인
   ├─ JWT 검증
   └─ petId 소유권
   ↓
2. 유치원 정보 조회
   ├─ 가격 정보 (priceInfo JSON)
   └─ 영업시간
   ↓
3. 가격 계산
   ├─ bookingType에 따라
   │   ├─ HOURLY: 시간 × 시간당 가격
   │   ├─ FULL_DAY: 종일제 가격
   │   ├─ OVERNIGHT: 1박 2일 가격
   │   └─ MONTHLY: 월정액 가격
   ├─ pickupRequired: +10,000원
   └─ dropoffRequired: +10,000원
   ↓
4. 시간 중복 확인 (선택적, 유치원 정책에 따라)
   ↓
5. 예약 생성 (트랜잭션)
   ├─ daycare_bookings 테이블
   ├─ notifications 테이블
   └─ 결제 연동 (토스페이먼츠)
   ↓
6. 알림 발송
   ↓
7. 응답 반환
```

#### Request
```json
{
  "petId": "uuid",
  "daycareId": "uuid",
  "bookingDate": "2025-12-30",
  "startTime": "08:00",
  "endTime": "18:00",
  "bookingType": "FULL_DAY",
  "pickupRequired": true,
  "dropoffRequired": false,
  "specialNotes": "분리불안이 있어요. 다른 강아지와 천천히 적응시켜주세요."
}
```

#### Response (201 Created)
```json
{
  "id": "uuid",
  "status": "PENDING",
  "bookingDate": "2025-12-30",
  "startTime": "08:00",
  "endTime": "18:00",
  "bookingType": "FULL_DAY",
  "totalPrice": 50000,  // 40,000 (종일제) + 10,000 (픽업)
  "priceBreakdown": {
    "basePrice": 40000,
    "pickupFee": 10000,
    "dropoffFee": 0,
    "total": 50000
  },
  "pet": {
    "name": "뽀미"
  },
  "daycare": {
    "name": "해피독 유치원"
  },
  "createdAt": "2025-12-29T21:40:00Z"
}
```

#### 데이터베이스 쿼리

**가격 계산 로직**:
```typescript
// 1. 유치원 정보 조회
const daycare = await prisma.daycare.findUnique({
  where: { id: dto.daycareId },
  select: { priceInfo: true }
});

// 2. 가격 계산
const priceInfo = daycare.priceInfo as PriceInfo;
let basePrice = 0;

switch (dto.bookingType) {
  case 'HOURLY':
    const hours = calculateHours(dto.startTime, dto.endTime);
    basePrice = hours * priceInfo.hourlyRate;
    break;
  case 'FULL_DAY':
    basePrice = priceInfo.fullDayRate;
    break;
  case 'OVERNIGHT':
    basePrice = priceInfo.overnightRate;
    break;
  case 'MONTHLY':
    basePrice = priceInfo.monthlyRate;
    break;
}

const pickupFee = dto.pickupRequired ? priceInfo.pickupFee : 0;
const dropoffFee = dto.dropoffRequired ? priceInfo.dropoffFee : 0;
const totalPrice = basePrice + pickupFee + dropoffFee;
```

**예약 생성**:
```typescript
const booking = await prisma.$transaction(async (tx) => {
  const newBooking = await tx.daycareBooking.create({
    data: {
      userId: currentUserId,
      petId: dto.petId,
      daycareId: dto.daycareId,
      bookingDate: new Date(dto.bookingDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      bookingType: dto.bookingType,
      pickupRequired: dto.pickupRequired,
      dropoffRequired: dto.dropoffRequired,
      specialNotes: dto.specialNotes,
      totalPrice,
      status: 'PENDING'
    },
    include: {
      pet: { select: { name: true } },
      daycare: { select: { name: true } }
    }
  });

  // 알림 생성
  await tx.notification.create({
    data: {
      userId: currentUserId,
      type: 'DAYCARE_BOOKING_CONFIRMED',
      title: '유치원 예약이 접수되었습니다',
      content: `${daycare.name}에 ${pet.name}의 예약이 접수되었습니다.`
    }
  });

  return newBooking;
});
```

#### 보안
- ✅ petId 소유권 검증 필수
- ✅ totalPrice 서버에서 재계산 (클라이언트 값 신뢰 금지)
- ✅ 트랜잭션으로 원자성 보장

#### 성능
- 캐시: 유치원 정보 (1시간 TTL)
- 인덱스: (daycare_id, booking_date, status)
- 목표: < 300ms

---

## 4. 입양 API ⭐ 핵심

### POST /adoption-applications

#### 개요
- **목적**: 입양 신청서 제출
- **인증**: Required
- **비즈니스 복잡도**: 매우 높음 (복잡한 validation)

#### 비즈니스 로직

**Flow**:
```
1. 인증 확인
   ↓
2. 동물 입양 가능 여부 확인
   ├─ availableForAdoption = true
   └─ isAdopted = false
   ↓
3. 보호소 검증
   ├─ 인증된 보호소인가?
   └─ 차단된 보호소 아닌가? (신고 5회 이상)
   ↓
4. 신청서 유효성 검증
   ├─ 필수 항목 입력 확인
   ├─ 주거 환경 적합성 (면적, 주택 유형)
   └─ 입양 사유 길이 (최소 200자)
   ↓
5. 중복 신청 확인
   ├─ 같은 동물에 대한 활성 신청 있는가?
   └─ 있으면 거부
   ↓
6. 신청서 생성
   ↓
7. 보호소에 알림
   ↓
8. 응답 반환
```

#### Request
```json
{
  "animalId": "uuid",
  "applicantInfo": {
    "name": "이지은",
    "phone": "010-1234-5678",
    "email": "jieun@example.com",
    "age": 28,
    "occupation": "NGO 활동가"
  },
  "housingInfo": {
    "type": "VILLA",  // APARTMENT | VILLA | HOUSE | STUDIO
    "area": 45,       // 평수
    "hasYard": true,
    "isPetAllowed": true,
    "proofDocument": "https://s3.../contract.pdf"  // 사육 동의서
  },
  "familyInfo": {
    "householdSize": 2,
    "hasFamilyConsent": true,
    "hasOtherPets": true,
    "otherPetsInfo": "유기견 '구름이' 2년 양육 중",
    "adoptionExperience": "유기견 입양 경험 있음"
  },
  "adoptionReason": "새로운 가족을 맞이하고 싶습니다. 구름이와 잘 어울릴 친구를 찾고 있어요. 충분한 공간과 시간이 있으며, 책임감 있게 평생 함께하겠습니다..."
}
```

#### DTO (복잡한 Nested Validation)
```typescript
export class CreateAdoptionApplicationDto {
  @IsUUID()
  animalId: string;

  @ValidateNested()
  @Type(() => ApplicantInfoDto)
  applicantInfo: ApplicantInfoDto;

  @ValidateNested()
  @Type(() => HousingInfoDto)
  housingInfo: HousingInfoDto;

  @ValidateNested()
  @Type(() => FamilyInfoDto)
  familyInfo: FamilyInfoDto;

  @IsString()
  @MinLength(200)
  @MaxLength(2000)
  adoptionReason: string;
}

class ApplicantInfoDto {
  @IsString() @IsNotEmpty() name: string;
  @IsPhoneNumber('KR') phone: string;
  @IsEmail() email: string;
  @IsInt() @Min(19) age: number;
  @IsString() occupation: string;
}

class HousingInfoDto {
  @IsEnum(HousingType) type: HousingType;
  @IsNumber() @Min(10) area: number;  // 최소 10평
  @IsBoolean() hasYard: boolean;
  @IsBoolean() isPetAllowed: boolean;
  @IsUrl() @IsOptional() proofDocument?: string;
}
```

#### Response (201 Created)
```json
{
  "id": "uuid",
  "status": "PENDING",
  "animal": {
    "id": "uuid",
    "name": "뭉치",
    "species": "DOG",
    "breed": "믹스",
    "age": 24  // 개월
  },
  "shelter": {
    "id": "uuid",
    "name": "서울동물사랑보호소",
    "verificationStatus": "VERIFIED"
  },
  "submittedAt": "2025-12-29T21:50:00Z",
  "estimatedReviewTime": "1-3일 이내"
}
```

#### 데이터베이스 쿼리

**1. 동물 입양 가능 여부 확인**:
```typescript
const animal = await prisma.adoptionAnimal.findFirst({
  where: {
    id: dto.animalId,
    availableForAdoption: true,
    isAdopted: false
  },
  include: {
    shelter: {
      select: {
        id: true,
        name: true,
        verificationStatus: true
      }
    }
  }
});

if (!animal) {
  throw new NotFoundException('Animal not available for adoption');
}

// 보호소 차단 여부 확인
if (animal.shelter.verificationStatus === 'FRAUD_SUSPECTED') {
  throw new ForbiddenException('This shelter has been blocked');
}
```

**2. 중복 신청 확인**:
```typescript
const existingApplication = await prisma.adoptionApplication.findFirst({
  where: {
    userId: currentUserId,
    animalId: dto.animalId,
    status: {
      in: ['PENDING', 'APPROVED', 'CONSULTATION_SCHEDULED']
    }
  }
});

if (existingApplication) {
  throw new ConflictException('You already have an active application for this animal');
}
```

**3. 신청서 생성**:
```typescript
const application = await prisma.adoptionApplication.create({
  data: {
    userId: currentUserId,
    animalId: dto.animalId,
    shelterId: animal.shelterId,
    status: 'PENDING',
    applicantInfo: dto.applicantInfo,
    housingInfo: dto.housingInfo,
    familyInfo: dto.familyInfo,
    adoptionReason: dto.adoptionReason
  },
  include: {
    animal: {
      select: { id: true, name: true, species: true, breed: true, age: true }
    },
    shelter: {
      select: { id: true, name: true, verificationStatus: true }
    }
  }
});
```

#### 보안
- ✅ 보호소 검증 상태 확인 (차단된 보호소 거부)
- ✅ JSON 필드 스키마 검증
- ✅ 파일 업로드 크기 제한 (10MB)
- ✅ 민감 정보 (주소, 전화번호) 암호화

---

## 5. 보험 API ⭐ 핵심

### POST /insurance-claims

#### 개요
- **목적**: 보험금 청구 (진료 기록 연동)
- **인증**: Required
- **비즈니스 복잡도**: 매우 높음 (자동 서류 생성)
- **차별화 기능**: ⭐⭐⭐

#### 비즈니스 로직

**Flow**:
```
1. 인증 & 권한
   ├─ JWT 검증
   └─ petInsurance 소유권 확인
   ↓
2. 보험 정보 조회
   ├─ 보험 유효 기간 확인
   ├─ 연간 한도 확인 (남은 금액)
   └─ 대기 기간 확인
   ↓
3. 진료 기록 검증
   ├─ healthRecordIds 소유권 (petId 일치)
   ├─ 진료 날짜 확인 (보험 가입 후)
   └─ 이미 청구된 기록 제외
   ↓
4. 청구 금액 계산
   ├─ 진료비 합계
   ├─ 자기부담금 계산 (예: 20%)
   └─ 보험사 지급 예상액
   ↓
5. PDF 서류 자동 생성 ⭐
   ├─ 청구서 템플릿
   ├─ 진료 기록 데이터 삽입
   └─ S3 업로드
   ↓
6. 청구 생성
   ↓
7. 보험사 API 연동 (선택적, 보험사 지원 시)
   ↓
8. 응답 반환
```

#### Request
```json
{
  "petInsuranceId": "uuid",
  "healthRecordIds": [
    "uuid-record-1",
    "uuid-record-2"
  ],
  "claimAmount": 150000  // 서버에서 재계산됨
}
```

#### Response (201 Created)
```json
{
  "id": "uuid",
  "status": "PENDING",
  "claimAmount": 150000,
  "deductible": 30000,      // 20% 자기부담금
  "expectedPayout": 120000, // 실제 수령액
  "documentUrl": "https://s3.../claim-doc-uuid.pdf",
  "healthRecords": [
    {
      "id": "uuid-record-1",
      "visitDate": "2025-12-15",
      "diagnosis": "슬개골 탈구",
      "cost": 100000
    },
    {
      "id": "uuid-record-2",
      "visitDate": "2025-12-20",
      "diagnosis": "재활 치료",
      "cost": 50000
    }
  ],
  "insurance": {
    "insurerName": "KB손해보험",
    "productName": "펫케어 플러스",
    "policyNumber": "KB-12345"
  },
  "submittedAt": "2025-12-29T22:00:00Z",
  "estimatedPaymentDate": "2026-01-15"  // 14일 후
}
```

#### PDF 생성 로직 (차별화)
```typescript
import PDFDocument from 'pdfkit';

async generateClaimDocument(claim: InsuranceClaim): Promise<string> {
  const doc = new PDFDocument();
  const fileName = `claim-${claim.id}.pdf`;
  const s3Key = `insurance-claims/${fileName}`;

  // PDF 생성
  doc.fontSize(20).text('보험금 청구서', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`청구 번호: ${claim.id}`);
  doc.text(`청구일: ${format(claim.submittedAt, 'yyyy-MM-dd')}`);
  doc.moveDown();

  // 보험 정보
  doc.fontSize(16).text('보험 정보');
  doc.fontSize(12).text(`보험사: ${claim.insurance.insurerName}`);
  doc.text(`증권번호: ${claim.insurance.policyNumber}`);
  doc.moveDown();

  // 진료 기록
  doc.fontSize(16).text('진료 내역');
  claim.healthRecords.forEach((record, i) => {
    doc.fontSize(12).text(`${i+1}. ${record.visitDate} - ${record.diagnosis}`);
    doc.text(`   진료비: ${record.cost.toLocaleString()}원`);
  });
  doc.moveDown();

  // 청구 금액
  doc.fontSize(16).text('청구 금액');
  doc.fontSize(14).text(`총 진료비: ${claim.claimAmount.toLocaleString()}원`);
  doc.text(`자기부담금: ${claim.deductible.toLocaleString()}원`);
  doc.text(`청구 금액: ${claim.expectedPayout.toLocaleString()}원`, { bold: true });

  doc.end();

  // S3 업로드
  const pdfBuffer = await streamToBuffer(doc);
  const url = await this.s3Service.upload(s3Key, pdfBuffer);

  return url;
}
```

#### 인덱스
```sql
-- 보험금 청구 조회 성능
CREATE INDEX idx_insurance_claim_user_status
ON insurance_claims (user_id, status, submitted_at DESC);

-- 진료 기록 중복 청구 방지
CREATE UNIQUE INDEX idx_health_record_claim
ON insurance_claim_health_records (health_record_id, insurance_claim_id);
```

---

## 6. 어드민 API

### GET /admin/dashboard

#### 개요
- **목적**: 사장님 대시보드 KPI 조회
- **인증**: Required (Admin JWT)
- **권한**: 사장님 본인 시설만
- **RBAC**: HOSPITAL_ADMIN, DAYCARE_ADMIN, SHELTER_ADMIN

#### 비즈니스 로직

**Flow**:
```
1. 어드민 인증 확인
   ├─ JWT 검증
   └─ 역할 확인 (isAdmin = true)
   ↓
2. 시설 소유권 확인
   ├─ hospitalId, daycareId, shelterId 중 하나
   └─ userId = facility.ownerId
   ↓
3. KPI 계산
   ├─ 월간 예약 건수
   ├─ 월간 수익
   ├─ 노쇼율
   ├─ 평균 평점
   └─ 신규 고객 vs 재방문
   ↓
4. 캐싱 (1시간 TTL)
   ↓
5. 응답 반환
```

#### Request Query
```
facilityType: HOSPITAL | DAYCARE | SHELTER
facilityId: uuid
period: DAILY | WEEKLY | MONTHLY (기본값: MONTHLY)
```

#### Response (200 OK)
```json
{
  "facilityId": "uuid",
  "facilityType": "DAYCARE",
  "facilityName": "해피독 유치원",
  "period": "MONTHLY",
  "kpis": {
    "totalBookings": 245,
    "totalRevenue": 9800000,
    "avgBookingValue": 40000,
    "noShowRate": 0.08,  // 8%
    "avgRating": 4.7,
    "reviewCount": 134,
    "newCustomers": 45,
    "returningCustomers": 78,
    "returnRate": 0.63  // 63%
  },
  "trends": {
    "bookings": {
      "current": 245,
      "previous": 220,
      "change": "+11.4%"
    },
    "revenue": {
      "current": 9800000,
      "previous": 8500000,
      "change": "+15.3%"
    }
  },
  "topServices": [
    { "name": "종일제", "count": 180, "revenue": 7200000 },
    { "name": "시간제", "count": 50, "revenue": 1250000 },
    { "name": "월정액", "count": 15, "revenue": 1350000 }
  ]
}
```

#### 데이터베이스 쿼리 (복잡한 집계)
```typescript
const stats = await prisma.$queryRaw`
  SELECT
    COUNT(*) as total_bookings,
    SUM(total_price) as total_revenue,
    AVG(total_price) as avg_booking_value,
    SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END)::float / COUNT(*) as no_show_rate
  FROM daycare_bookings
  WHERE daycare_id = ${facilityId}
    AND booking_date >= ${startDate}
    AND booking_date <= ${endDate}
`;

// 평점 조회
const rating = await prisma.review.aggregate({
  where: { daycareId: facilityId },
  _avg: { rating: true },
  _count: true
});

// 신규 vs 재방문 고객
const customerStats = await prisma.$queryRaw`
  SELECT
    COUNT(DISTINCT CASE
      WHEN user_first_booking_date >= ${startDate}
      THEN user_id
    END) as new_customers,
    COUNT(DISTINCT CASE
      WHEN user_first_booking_date < ${startDate}
      THEN user_id
    END) as returning_customers
  FROM (
    SELECT
      user_id,
      MIN(booking_date) OVER (PARTITION BY user_id) as user_first_booking_date
    FROM daycare_bookings
    WHERE daycare_id = ${facilityId}
  ) subquery
  WHERE booking_date >= ${startDate}
    AND booking_date <= ${endDate}
`;
```

#### 캐싱
```typescript
@Cacheable(3600) // 1시간 TTL
async getDashboardKPIs(facilityId: string, period: string) {
  // 복잡한 쿼리이므로 캐싱 필수
  return await this.calculateKPIs(facilityId, period);
}

// 캐시 무효화
async onNewBooking(facilityId: string) {
  await this.cacheManager.del(`dashboard:${facilityId}:*`);
}
```

#### 성능
- 복잡한 집계 쿼리: < 500ms
- 캐시 히트 시: < 50ms
- 인덱스: (facility_id, booking_date, status)

---

## 7. 공통 사항

### 인증 & 인가

**JWT Payload**:
```typescript
interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}
```

**Guards**:
```typescript
// JWT 인증
@UseGuards(JwtAuthGuard)

// 역할 기반
@UseGuards(RolesGuard)
@Roles('ADMIN')

// 리소스 소유권
@UseGuards(OwnershipGuard)
```

---

### 에러 응답 형식 (표준화)

```typescript
interface ErrorResponse {
  code: string;          // ERROR_CODE (대문자_언더스코어)
  message: string;       // 사용자용 메시지
  details?: any;         // 상세 정보 (개발 환경에서만)
  timestamp: string;     // ISO-8601
  path: string;          // API 경로
}
```

**예시**:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "입력 데이터가 유효하지 않습니다",
  "details": {
    "field": "appointmentDateTime",
    "constraint": "Must be a future date",
    "value": "2025-12-28T10:00:00Z"
  },
  "timestamp": "2025-12-29T22:10:00Z",
  "path": "/api/appointments"
}
```

---

### Pagination 표준

**Query Parameters**:
```
page: number (기본값 1)
limit: number (기본값 20, 최대 100)
sort: string (예: -createdAt, +name)
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "totalPages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Rate Limiting

**전역 설정**:
- 기본: IP당 분당 100 요청
- 로그인: IP당 분당 5회 (실패 시 10분 차단)
- 파일 업로드: IP당 시간당 20회
- 검색: IP당 분당 30회

**구현** (NestJS Throttler):
```typescript
@Throttle({ default: { ttl: 60000, limit: 100 } })
export class AppModule {}

// 특정 엔드포인트 오버라이드
@Throttle({ ttl: 60000, limit: 5 })
@Post('auth/login')
async login() {}
```

---

### 감사 로그 (Audit Log)

**로깅 대상**:
- 모든 인증 시도 (성공/실패)
- 민감 정보 접근 (개인정보, 결제 정보)
- 데이터 수정/삭제
- 관리자 액션

**pg_audit 설정**:
```sql
-- 모든 DML 로깅
ALTER SYSTEM SET pgaudit.log = 'write, ddl';
ALTER SYSTEM SET pgaudit.log_catalog = off;

-- 특정 테이블만 로깅
ALTER SYSTEM SET pgaudit.log_relation = 'users, appointments, adoption_applications';
```

**CloudWatch Logs 구조**:
```json
{
  "level": "info",
  "timestamp": "2025-12-29T22:15:00Z",
  "userId": "uuid",
  "action": "CREATE_APPOINTMENT",
  "resource": "appointments",
  "resourceId": "uuid",
  "ip": "123.456.789.012",
  "userAgent": "Mozilla/5.0..."
}
```

---

## 부록: 성능 벤치마크

### 목표 응답 시간

| 엔드포인트 | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| GET /hospitals (검색) | 100ms | 200ms | 300ms |
| POST /appointments | 150ms | 250ms | 400ms |
| GET /appointments | 50ms | 100ms | 150ms |
| POST /daycare-bookings | 200ms | 350ms | 500ms |
| POST /insurance-claims | 500ms | 1000ms | 1500ms |
| GET /admin/dashboard | 300ms | 600ms | 1000ms |

### 데이터베이스 성능

**Connection Pool**:
- Min: 5
- Max: 20
- Idle Timeout: 30초

**쿼리 성능 목표**:
- 단순 조회: < 10ms
- 조인 2-3개: < 50ms
- 복잡한 집계: < 200ms

---

*이 문서는 구현하면서 지속적으로 업데이트됩니다.*
*API 변경 시 OpenAPI 스펙도 함께 업데이트 필수*
