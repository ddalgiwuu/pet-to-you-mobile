# Pet to You - 개발 시작 전 필수 설정 가이드

> 모든 서비스 가입부터 환경 변수 설정까지 완벽 가이드

**작성일**: 2025-12-29
**소요 시간**: 약 2-3시간

---

## 📋 체크리스트 (필수 순서대로)

- [x] Git & GitHub 저장소 생성 ✅ 완료
- [ ] Vercel 프로젝트 생성
- [ ] MongoDB Atlas 설정 (무료)
- [ ] PostgreSQL 설정 (로컬 + 프로덕션)
- [ ] Redis 설정 (Upstash 무료 or 로컬)
- [ ] 소셜 로그인 API 설정 (카카오, 네이버, Apple)
- [ ] AWS S3 설정 (파일 저장)
- [ ] 결제 설정 (토스페이먼츠)
- [ ] AI API 설정 (OpenAI, Grok)
- [ ] 환경 변수 설정

---

## 1. Git & GitHub ✅ 완료

**GitHub 저장소**: https://github.com/ddalgiwuu/pet-to-you

**확인**:
```bash
git remote -v
# origin  https://github.com/ddalgiwuu/pet-to-you.git (fetch)
# origin  https://github.com/ddalgiwuu/pet-to-you.git (push)
```

---

## 2. Vercel 프로젝트 생성

### Vercel CLI 설치
```bash
# 전역 설치
npm install -g vercel

# 로그인
vercel login
```

### 프로젝트 생성 (3개)

**① PWA (고객용) 배포**:
```bash
cd apps/web
vercel

# 질문 응답:
# Set up and deploy? Yes
# Scope: Your account
# Link to existing project? No
# Project name: pet-to-you-web
# Directory: ./
# Override settings? No
```

**② Admin (어드민) 배포**:
```bash
cd apps/admin
vercel

# Project name: pet-to-you-admin
```

**③ API (백엔드)는 Vercel 사용 안 함** (AWS ECS 권장)

### Vercel 환경 변수 설정

**PWA 환경 변수** (vercel.com 대시보드):
```env
# API URL
NEXT_PUBLIC_API_URL=https://api.pet-to-you.com

# 기타 Public 변수
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_id
```

---

## 3. MongoDB Atlas 설정 (무료)

### Step 1: 계정 생성
1. https://www.mongodb.com/cloud/atlas/register 접속
2. Google 계정으로 가입 (빠름)
3. 무료 티어 선택 (M0 Sandbox)

### Step 2: 클러스터 생성
```
1. "Create a deployment" 클릭
2. 플랜: M0 (FREE)
3. 리전: Seoul (ap-northeast-2) ⭐ 중요
4. 클러스터 이름: pet-to-you-cluster
5. Create Deployment
```

### Step 3: 데이터베이스 사용자 생성
```
1. Database Access 메뉴
2. Add New Database User
3. Username: petadmin
4. Password: [강력한 비밀번호 생성]
5. Database User Privileges: Read and write to any database
6. Add User
```

### Step 4: 네트워크 접근 허용
```
1. Network Access 메뉴
2. Add IP Address
3. Allow Access from Anywhere (0.0.0.0/0)
   ⚠️ 프로덕션에서는 특정 IP만 허용
4. Confirm
```

### Step 5: Connection String 복사
```
1. Database 메뉴
2. Connect 버튼
3. Drivers 선택
4. Node.js 선택
5. Connection String 복사:

mongodb+srv://petadmin:<password>@pet-to-you-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Vector Search 인덱스 생성
```javascript
// MongoDB Compass or Atlas UI에서 실행
db.hospitals.createIndex(
  { "embedding": "vector" },
  {
    name: "hospital_vector_index",
    vectorSearchOptions: {
      dimensions: 1536,  // text-embedding-3-small
      similarity: "cosine"
    }
  }
)
```

---

## 4. PostgreSQL 설정

### Option 1: 로컬 개발 (Docker) ⭐ 권장

**docker-compose.yml** (프로젝트 루트):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pet-to-you-postgres
    environment:
      POSTGRES_DB: pet_to_you
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpassword123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pet-to-you-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

**실행**:
```bash
docker-compose up -d

# 확인
docker-compose ps

# 중지
docker-compose down
```

**Connection String**:
```
DATABASE_URL="postgresql://postgres:devpassword123@localhost:5432/pet_to_you"
```

---

### Option 2: 프로덕션 (Supabase) ⭐ 무료 티어

**장점**: PostgreSQL + Auth + Storage 통합, 무료 티어 500MB

**설정**:
1. https://supabase.com/ 접속
2. GitHub 계정으로 가입
3. New Project 클릭
4. 프로젝트 이름: pet-to-you
5. Database Password: [강력한 비밀번호]
6. 리전: Seoul (Northeast Asia)
7. 플랜: Free ($0/month)
8. Create project

**Connection String** (Settings → Database):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

---

### Option 3: AWS RDS (프로덕션, 유료)

**설정** (AWS Console):
```
1. RDS → Create database
2. Engine: PostgreSQL 16
3. Template: Free tier
4. DB instance: db.t3.micro
5. Storage: 20GB
6. VPC: Default
7. Public access: Yes (개발용)
8. Create database
```

**비용**: 월 $15-20 (Free Tier 12개월)

---

## 5. Redis 설정

### Option 1: 로컬 (Docker) ✅ 이미 포함
```bash
docker-compose up -d redis
```

### Option 2: Upstash (무료) ⭐ 권장

**설정**:
1. https://console.upstash.com/ 접속
2. GitHub 로그인
3. Create Database 클릭
4. Name: pet-to-you-redis
5. Type: Regional
6. Region: ap-northeast-2 (Seoul)
7. Create

**Connection String**:
```
REDIS_URL="rediss://default:[PASSWORD]@[ENDPOINT]:6379"
```

**무료 티어**:
- 10,000 commands/day
- 256MB storage
- MVP에 충분

---

## 6. 소셜 로그인 API 설정

### 카카오 개발자 등록

**Step 1: 애플리케이션 등록**
```
1. https://developers.kakao.com/ 접속
2. 카카오 계정으로 로그인
3. 내 애플리케이션 → 애플리케이션 추가
4. 앱 이름: Pet to You
5. 사업자명: [회사명 또는 개인]
6. 저장
```

**Step 2: 플랫폼 설정**
```
1. 앱 설정 → 플랫폼
2. Web 플랫폼 등록
   - 사이트 도메인: https://pet-to-you.com
   - (개발) http://localhost:3000
3. 저장
```

**Step 3: Redirect URI 설정**
```
1. 제품 설정 → 카카오 로그인
2. Redirect URI 등록:
   - https://pet-to-you.com/api/auth/kakao/callback
   - http://localhost:3000/api/auth/kakao/callback
3. 동의 항목 설정:
   - 닉네임 (필수)
   - 프로필 사진 (선택)
   - 카카오계정 (이메일) (필수)
4. 저장
```

**발급받은 키**:
```env
KAKAO_REST_API_KEY=your_rest_api_key
KAKAO_JAVASCRIPT_KEY=your_javascript_key
KAKAO_ADMIN_KEY=your_admin_key
```

---

### 네이버 개발자 등록

**Step 1: 애플리케이션 등록**
```
1. https://developers.naver.com/apps/#/register 접속
2. 네이버 로그인
3. Application 이름: Pet to You
4. 사용 API: 네이버 로그인
5. 제공 정보: 이메일, 닉네임, 프로필 사진
6. 환경 추가:
   - PC 웹: https://pet-to-you.com
   - 서비스 URL: https://pet-to-you.com/api/auth/naver/callback
7. 등록
```

**발급받은 키**:
```env
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

---

### Apple Sign In 등록

**Step 1: Apple Developer 가입**
```
1. https://developer.apple.com/ 접속
2. Apple Developer Program 가입 ($99/year)
3. Certificates, IDs & Profiles
4. Identifiers → App IDs 생성
5. Sign in with Apple 체크
```

**Step 2: Service ID 생성**
```
1. Identifiers → Services IDs
2. Service ID: com.pettoyou.signin
3. Return URLs:
   - https://pet-to-you.com/api/auth/apple/callback
4. 저장
```

**발급받은 키**:
```env
APPLE_TEAM_ID=your_team_id
APPLE_CLIENT_ID=com.pettoyou.signin
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

---

## 7. AWS S3 설정 (파일 저장소)

### Step 1: IAM 사용자 생성
```
1. AWS Console → IAM
2. Users → Create user
3. User name: pet-to-you-s3-user
4. Permissions: AmazonS3FullAccess (또는 커스텀 정책)
5. Create user
6. Security credentials → Create access key
7. Access key ID & Secret 복사
```

### Step 2: S3 Bucket 생성
```
1. S3 → Create bucket
2. Bucket name: pet-to-you-uploads
3. Region: ap-northeast-2 (Seoul)
4. Block public access: OFF (이미지 public 접근)
5. Versioning: Enable (선택)
6. Encryption: Enable (AES-256)
7. Create bucket
```

### Step 3: CORS 설정
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://pet-to-you.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

**환경 변수**:
```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=pet-to-you-uploads
```

---

## 8. 결제 설정 (토스페이먼츠)

### 가입 및 설정
```
1. https://www.tosspayments.com/ 접속
2. 회원가입
3. 개발자센터
4. 내 앱 등록:
   - 앱 이름: Pet to You
   - Redirect URL: https://pet-to-you.com/payment/success
5. API 키 발급
```

**환경 변수**:
```env
TOSS_PAYMENTS_CLIENT_KEY=test_ck_... (테스트용)
TOSS_PAYMENTS_SECRET_KEY=test_sk_... (테스트용)
```

**테스트 카드**:
- 카드번호: 5334-5555-5555-5555
- 유효기간: 12/25
- CVC: 123

---

## 9. AI API 설정

### OpenAI API
```
1. https://platform.openai.com/ 접속
2. 로그인
3. API keys → Create new secret key
4. 복사 (다시 볼 수 없음!)
```

**환경 변수**:
```env
OPENAI_API_KEY=sk-...
```

**무료 크레딧**: $5 (신규 가입 시)
**비용**: Embedding $0.02/1M tokens

---

### Grok API (x.ai)
```
1. https://x.ai/ 접속
2. API 접근 신청
3. API Key 발급
```

**환경 변수**:
```env
GROK_API_KEY=xai-...
```

**비용**:
- Grok-2: $2/M input tokens
- Vector Search: $2.50/1K searches (첫 주 무료)

---

## 10. 공공데이터 API (사업자 조회)

### 공공데이터포털
```
1. https://www.data.go.kr/ 접속
2. 회원가입
3. 오픈 API → 국세청_사업자등록정보 진위확인 및 상태조회 서비스
4. 활용신청
5. 승인 대기 (1-3일)
6. 승인 후 API 키 발급
```

**환경 변수**:
```env
PUBLIC_DATA_API_KEY=your_api_key
```

**무료**: 일 1,000건

---

## 11. 최종 환경 변수 설정

### .env.local 파일 생성
```bash
cd /Users/ryansong/Desktop/DEV/pet-to-you
cp .env.example .env.local
```

### .env.local 전체 설정
```env
# ========================================
# 데이터베이스
# ========================================
# PostgreSQL (로컬 개발)
DATABASE_URL="postgresql://postgres:devpassword123@localhost:5432/pet_to_you"

# MongoDB Atlas (프로덕션)
MONGODB_URL="mongodb+srv://petadmin:PASSWORD@pet-to-you-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority"

# Redis (로컬)
REDIS_URL="redis://localhost:6379"
# 또는 Upstash
# REDIS_URL="rediss://default:PASSWORD@ENDPOINT:6379"

# ========================================
# JWT 인증
# ========================================
JWT_ACCESS_SECRET="your-super-secret-256-bit-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-256-bit-key-change-this-too"

# ========================================
# 소셜 로그인
# ========================================
# 카카오
KAKAO_REST_API_KEY="your_kakao_rest_api_key"
KAKAO_REDIRECT_URI="http://localhost:3000/api/auth/kakao/callback"

# 네이버
NAVER_CLIENT_ID="your_naver_client_id"
NAVER_CLIENT_SECRET="your_naver_client_secret"

# Apple
APPLE_TEAM_ID="your_team_id"
APPLE_CLIENT_ID="com.pettoyou.signin"
APPLE_KEY_ID="your_key_id"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ========================================
# AWS S3
# ========================================
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_secret_access_key"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET="pet-to-you-uploads"

# ========================================
# 결제 (토스페이먼츠)
# ========================================
TOSS_PAYMENTS_CLIENT_KEY="test_ck_..."
TOSS_PAYMENTS_SECRET_KEY="test_sk_..."

# ========================================
# AI API
# ========================================
OPENAI_API_KEY="sk-..."
GROK_API_KEY="xai-..."

# ========================================
# 암호화
# ========================================
ENCRYPTION_KEY="your-32-character-encryption-key"

# ========================================
# 공공데이터
# ========================================
PUBLIC_DATA_API_KEY="your_public_data_api_key"

# ========================================
# 기타
# ========================================
NODE_ENV="development"
PORT=4000
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

---

## 12. Prisma & Mongoose 설정

### Prisma 초기화
```bash
cd apps/api
npx prisma init

# schema.prisma 파일 생성됨
# .env 파일에 DATABASE_URL 자동 추가
```

### Prisma 스키마 작성
**apps/api/prisma/schema.prisma**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String
  phone           String?
  profileImageUrl String?
  authProvider    String    // KAKAO, NAVER, APPLE
  authProviderId  String
  passwordHash    String?   // 어드민용
  isAdmin         Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?

  pets              Pet[]
  appointments      Appointment[]
  daycareBookings   DaycareBooking[]
  adoptionApplications AdoptionApplication[]
  insuranceClaims   InsuranceClaim[]

  @@map("users")
}

model Pet {
  id              String    @id @default(uuid())
  userId          String
  name            String
  species         String    // DOG, CAT, OTHER
  breed           String
  birthDate       DateTime
  gender          String    // MALE, FEMALE, UNKNOWN
  weight          Float?
  isNeutered      Boolean   @default(false)
  profileImageUrl String?
  specialNotes    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  isDeleted       Boolean   @default(false)

  user            User      @relation(fields: [userId], references: [id])
  appointments    Appointment[]
  daycareBookings DaycareBooking[]

  @@map("pets")
}

// ... 나머지 모델들
```

### 마이그레이션 실행
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### Mongoose 스키마 작성
**apps/api/src/schemas/hospital.schema.ts**:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Hospital extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop()
  phone: string;

  @Prop({ type: Object })
  openingHours: Record<string, any>;

  @Prop([String])
  specialties: string[];

  @Prop({ type: [Number], index: 'vector' })
  embedding: number[];  // Vector Search용

  @Prop({ default: true })
  isActive: boolean;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);

// Geospatial Index
HospitalSchema.index({ location: '2dsphere' });

// Vector Search Index (Atlas에서 생성)
// { embedding: 'vector' }
```

---

## 13. Vercel 환경 변수 설정

### Vercel 대시보드에서 설정
```
1. https://vercel.com/dashboard
2. pet-to-you-web 프로젝트 선택
3. Settings → Environment Variables
4. 추가할 변수:
   - NEXT_PUBLIC_API_URL (Production, Preview, Development)
   - 기타 NEXT_PUBLIC_* 변수들
5. Save
```

**중요**:
- `NEXT_PUBLIC_*`는 클라이언트에 노출됨
- Secret은 `NEXT_PUBLIC_` 없이 추가

---

## 14. 개발 서버 실행 전 체크리스트

```bash
# 1. Docker 서비스 실행
docker-compose up -d

# 2. PostgreSQL 확인
docker-compose ps postgres
# State: Up

# 3. MongoDB Atlas 연결 테스트
mongosh "mongodb+srv://petadmin:PASSWORD@..."

# 4. Redis 확인
redis-cli ping
# 응답: PONG

# 5. Prisma 마이그레이션
cd apps/api
npm run prisma:migrate
npm run prisma:generate

# 6. 의존성 설치
cd ../..
npm install

# 7. 개발 서버 실행
npm run dev

# 8. 브라우저 확인
# PWA: http://localhost:3000
# 어드민: http://localhost:3001
# API: http://localhost:4000
# Swagger: http://localhost:4000/api/docs
```

---

## 15. 예상 비용 (월간)

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| MongoDB Atlas | M0 (무료) | **$0** |
| PostgreSQL (Supabase) | Free | **$0** |
| Redis (Upstash) | Free | **$0** |
| Vercel | Hobby | **$0** |
| AWS S3 | 5GB | **$0.15** |
| OpenAI API | Pay-as-you-go | **~$100** |
| Grok API | Pay-as-you-go | **~$500** |
| **총 MVP 비용** | - | **~$600/월** |

**프로덕션 확장 시**:
- PostgreSQL: $15-50/월
- MongoDB: $57/월 (M10)
- Redis: $10/월
- 총: ~$700-800/월

---

## 16. 트러블슈팅

### MongoDB 연결 실패
```bash
# 방화벽 확인
# Network Access에서 IP 허용 확인

# Connection String 확인
# <password> 부분을 실제 비밀번호로 교체
```

### PostgreSQL 연결 실패
```bash
# Docker 재시작
docker-compose restart postgres

# 포트 충돌 확인
lsof -ti:5432 | xargs kill -9
```

### Prisma 에러
```bash
# Client 재생성
npm run prisma:generate

# 마이그레이션 리셋 (주의!)
npm run prisma:migrate reset
```

---

## ✅ 설정 완료 확인

모든 설정이 완료되면:

```bash
npm run dev
```

**확인 사항**:
- ✅ PWA 로드 (http://localhost:3000)
- ✅ API 응답 (http://localhost:4000/api/health)
- ✅ MongoDB 연결 성공 로그
- ✅ PostgreSQL 연결 성공 로그
- ✅ Redis 연결 성공 로그

**축하합니다! 개발 환경 구축 완료!** 🎉

---

*문의: 설정 중 문제가 생기면 `.agent.md` 참고*
