# Pet_to_You 필수 토큰 & 설정 가이드

## 📋 개요

프로젝트 실행 및 배포를 위해 필요한 모든 환경 변수, API 토큰, 계정 설정을 정리합니다.

---

## 1️⃣ 데이터베이스 & 인프라

### MongoDB Atlas (무료 시작 가능)
**목적**: 검색 최적화 (병원/반려동물 위치 기반 검색)

**설정 방법**:
1. https://www.mongodb.com/cloud/atlas 접속
2. "Try Free" → 무료 M0 Cluster 생성
3. Network Access → IP Whitelist: `0.0.0.0/0` (개발용) 또는 특정 IP
4. Database Access → 사용자 생성 (예: `pettoyou_user`)
5. Cluster → Connect → "Connect your application" → Connection String 복사

**환경 변수**:
```bash
# pet-to-you-api/.env
MONGODB_URI=mongodb+srv://pettoyou_user:PASSWORD@cluster0.xxxxx.mongodb.net/pettoyou?retryWrites=true&w=majority
```

**예상 비용**: 무료 (512MB) → 월 $57 (2GB 이후)

---

### fly.io (PostgreSQL + API 호스팅)
**목적**: 메인 PostgreSQL DB + NestJS API 배포

**설정 방법**:
```bash
# 1. fly.io 계정 생성 및 CLI 설치
brew install flyctl
flyctl auth signup  # 또는 flyctl auth login

# 2. PostgreSQL 생성 (Seoul 리전)
flyctl postgres create --name pettoyou-db --region icn --vm-size shared-cpu-1x

# 3. 연결 정보 확인
flyctl postgres db list -a pettoyou-db
flyctl postgres connect -a pettoyou-db
```

**환경 변수**:
```bash
# pet-to-you-api/.env
DB_HOST=pettoyou-db.internal
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<flyctl에서 제공된 비밀번호>
DB_NAME=pettoyou
DATABASE_URL=postgres://postgres:PASSWORD@pettoyou-db.internal:5432/pettoyou
```

**예상 비용**: 월 $0 (무료 티어) → 월 $1.94 (Shared CPU)

---

### Redis (Upstash 권장)
**목적**: 세션 캐싱, 토큰 저장, Rate Limiting

**설정 방법**:
1. https://upstash.com 접속 → 무료 가입
2. "Create Database" → Region: `ap-northeast-2` (서울)
3. TLS 활성화 확인
4. "REST API" 탭 → Connection String 복사

**환경 변수**:
```bash
# pet-to-you-api/.env
REDIS_URL=rediss://default:PASSWORD@ap-northeast-2-xxxxx.upstash.io:6379
```

**예상 비용**: 무료 (10,000 commands/day) → 월 $0.2/100K (이후)

---

## 2️⃣ 인증 & OAuth

### JWT 시크릿 (자체 생성)
**목적**: JWT 토큰 서명

**생성 방법**:
```bash
# 안전한 랜덤 시크릿 생성
openssl rand -base64 64

# 또는 Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**환경 변수**:
```bash
# pet-to-you-api/.env
JWT_SECRET=<생성된 64자 이상 랜덤 문자열>
JWT_EXPIRY=1h
JWT_REFRESH_SECRET=<다른 랜덤 문자열>
JWT_REFRESH_EXPIRY=7d
```

**비용**: 무료

---

### Kakao OAuth (카카오톡 로그인)
**목적**: 소셜 로그인

**설정 방법**:
1. https://developers.kakao.com 접속
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름: "Pet to You", 사업자명: (회사명)
4. "제품 설정" → "카카오 로그인" → 활성화
5. Redirect URI 추가:
   - `http://localhost:8081/auth/kakao/callback` (개발)
   - `https://api.pettoyou.com/auth/kakao/callback` (운영)
6. "앱 키" 탭 → REST API 키 복사

**환경 변수**:
```bash
# pet-to-you-api/.env
KAKAO_CLIENT_ID=<REST API 키>
KAKAO_CLIENT_SECRET=<Admin 키 - 보안 탭에서 생성>
KAKAO_CALLBACK_URL=http://localhost:8081/auth/kakao/callback

# pet-to-you-mobile/.env
EXPO_PUBLIC_KAKAO_APP_KEY=<JavaScript 키>
```

**비용**: 무료 (월 10,000 사용자까지)

---

### Naver OAuth (네이버 로그인)
**목적**: 소셜 로그인

**설정 방법**:
1. https://developers.naver.com/apps 접속
2. "애플리케이션 등록" → 애플리케이션 이름: "Pet to You"
3. 사용 API: "네이버 로그인" 선택
4. 제공 정보: 이메일, 닉네임, 프로필 사진
5. 환경 추가: PC 웹, 모바일 웹
6. 서비스 URL: `https://pettoyou.com`
7. Callback URL: `https://api.pettoyou.com/auth/naver/callback`

**환경 변수**:
```bash
# pet-to-you-api/.env
NAVER_CLIENT_ID=<Client ID>
NAVER_CLIENT_SECRET=<Client Secret>
NAVER_CALLBACK_URL=http://localhost:8081/auth/naver/callback
```

**비용**: 무료

---

### Apple Sign In (애플 로그인)
**목적**: iOS 필수 소셜 로그인

**설정 방법**:
1. Apple Developer Program 가입 ($99/년)
2. https://developer.apple.com/account 접속
3. "Certificates, Identifiers & Profiles"
4. Identifiers → App IDs → "+" 버튼
5. Bundle ID: `com.pettoyou.mobile`
6. Sign in with Apple 활성화
7. Keys → "+" → Sign in with Apple 선택
8. Private Key 다운로드 (`.p8` 파일)

**환경 변수**:
```bash
# pet-to-you-api/.env
APPLE_CLIENT_ID=com.pettoyou.mobile
APPLE_TEAM_ID=<Team ID (10자)>
APPLE_KEY_ID=<Key ID>
APPLE_PRIVATE_KEY=<.p8 파일 내용>
```

**비용**: 연 ₩132,000 ($99 Apple Developer Program)

---

## 3️⃣ 결제 시스템

### Toss Payments (토스페이먼츠)
**목적**: 병원 예약 결제, 보험료 결제

**설정 방법**:
1. https://www.tosspayments.com 접속
2. "개발자센터" → 회원가입
3. "내 개발 정보" → API 키 발급
   - 테스트 모드: 즉시 사용 가능
   - 운영 모드: 사업자등록증 제출 필요
4. Webhook URL 설정: `https://api.pettoyou.com/payments/webhook`

**환경 변수**:
```bash
# pet-to-you-api/.env
TOSS_PAYMENTS_CLIENT_KEY=test_ck_<테스트키>  # 프론트엔드용
TOSS_PAYMENTS_SECRET_KEY=test_sk_<시크릿키>  # 백엔드용

# 운영 환경
TOSS_PAYMENTS_CLIENT_KEY=live_ck_<운영키>
TOSS_PAYMENTS_SECRET_KEY=live_sk_<운영시크릿>

# pet-to-you-mobile/.env
EXPO_PUBLIC_TOSS_CLIENT_KEY=test_ck_<테스트키>
```

**수수료**:
- 카드 결제: 3.0%
- 간편결제: 2.8%
- 계좌이체: 0.9%

**예상 비용**: 거래액의 3% (월 ₩1,000만원 거래 시 → ₩30만원)

---

## 4️⃣ 지도 & 위치 서비스

### Naver Maps API (필수 - 한국 지도)
**목적**: 병원/유치원 위치 검색 및 지도 표시

**설정 방법**:
1. https://www.ncloud.com/product/applicationService/maps 접속
2. 네이버 클라우드 플랫폼 가입
3. "Application" → "등록" → 앱 이름: "Pet to You"
4. Web Dynamic Map, Geocoding 선택
5. 사용량 제한: 1일 100,000건 (무료)

**환경 변수**:
```bash
# pet-to-you-api/.env
NAVER_MAPS_CLIENT_ID=<Client ID>
NAVER_MAPS_CLIENT_SECRET=<Client Secret>

# pet-to-you-mobile/.env
EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID=<Client ID>
```

**비용**: 무료 (월 100,000건) → 초과 시 1,000건당 ₩20

---

### Kakao Local API (선택 - 주소 검색)
**목적**: 주소 → 좌표 변환 (Geocoding)

**설정 방법**:
1. Kakao Developers 콘솔 (위 OAuth와 동일 앱)
2. "플랫폼" → Android/iOS 패키지명 추가
3. "제품 설정" → "Kakao 지도" 활성화

**환경 변수**:
```bash
# pet-to-you-api/.env
KAKAO_LOCAL_API_KEY=<REST API 키>
```

**비용**: 무료 (월 300,000건)

---

## 5️⃣ 알림 서비스

### Expo Push Notifications (무료)
**목적**: 모바일 푸시 알림

**설정 방법**:
```bash
# Expo 계정 생성
expo register

# 프로젝트 설정
cd pet-to-you-mobile
expo login
```

**환경 변수**:
```bash
# app.json에 자동 생성됨
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "<Expo 프로젝트 ID>"
      }
    }
  }
}
```

**비용**: 무료 (무제한)

---

### SMS 발송 (CoolSMS 또는 Aligo)
**목적**: 예약 확인 SMS, 인증번호

**CoolSMS 설정**:
1. https://www.coolsms.co.kr 접속
2. 회원가입 → API Key 발급
3. 발신번호 등록 (본인 인증 필요)

**환경 변수**:
```bash
# pet-to-you-api/.env
COOLSMS_API_KEY=<API Key>
COOLSMS_API_SECRET=<API Secret>
COOLSMS_FROM_NUMBER=<발신번호>
```

**비용**: 건당 ₩8~₩20 (예상 월 ₩50,000)

---

### 이메일 발송 (SendGrid 또는 AWS SES)
**목적**: 예약 확인 이메일, 영수증

**SendGrid 설정**:
1. https://sendgrid.com 접속
2. 무료 계정 생성 (월 100통)
3. Settings → API Keys → Create API Key

**환경 변수**:
```bash
# pet-to-you-api/.env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@pettoyou.com
SENDGRID_FROM_NAME=Pet to You
```

**비용**: 무료 (월 100통) → 월 $19.95 (월 50,000통)

---

## 6️⃣ 모니터링 & 에러 추적

### Sentry (에러 추적)
**목적**: 실시간 에러 모니터링

**설정 방법**:
1. https://sentry.io 접속
2. 무료 계정 생성
3. Create Project → React Native / NestJS 선택
4. DSN 복사

**환경 변수**:
```bash
# pet-to-you-api/.env
SENTRY_DSN=https://xxxxxxxxx@o123456.ingest.sentry.io/789012

# pet-to-you-mobile/.env
EXPO_PUBLIC_SENTRY_DSN=https://xxxxxxxxx@o123456.ingest.sentry.io/789013

# pet-to-you-web/.env (각 앱)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxx@o123456.ingest.sentry.io/789014
```

**비용**: 무료 (월 5,000 에러) → 월 $26 (월 50,000 이벤트)

---

## 7️⃣ 프론트엔드 배포

### Vercel (Next.js 대시보드)
**목적**: Hospital Dashboard + Admin Dashboard 호스팅

**설정 방법**:
1. https://vercel.com 접속
2. GitHub 연동
3. Import Repository: `pet-to-you-web`
4. Framework Preset: Next.js
5. Root Directory: `apps/hospital-dashboard` (또는 `apps/admin-dashboard`)

**환경 변수** (Vercel Dashboard에서 설정):
```bash
NEXT_PUBLIC_API_URL=https://api.pettoyou.com
NEXTAUTH_URL=https://hospital.pettoyou.com
NEXTAUTH_SECRET=<openssl rand -base64 32 생성>
```

**비용**: 무료 (Hobby) → 월 $20 (Pro, 팀 협업 필요 시)

---

### Expo EAS (Mobile App 빌드)
**목적**: iOS/Android 앱 빌드 및 배포

**설정 방법**:
```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 계정 설정
cd pet-to-you-mobile
eas login
eas build:configure

# 개발 빌드 (Simulator용)
eas build --platform ios --profile development

# 프로덕션 빌드 (App Store/Play Store)
eas build --platform all --profile production
```

**환경 변수** (`eas.json`에서 관리):
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.pettoyou.com"
      }
    },
    "development": {
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**비용**: 무료 (월 30 빌드) → 월 $99 (무제한 빌드)

---

## 8️⃣ 파일 저장소 (이미지/문서)

### Cloudflare R2 (권장) 또는 AWS S3
**목적**: 반려동물 사진, 의료 기록 파일

**Cloudflare R2 설정**:
1. https://dash.cloudflare.com 접속
2. R2 → Create Bucket: `pettoyou-files`
3. API Tokens → Create Token (R2 Edit)

**환경 변수**:
```bash
# pet-to-you-api/.env
R2_ACCOUNT_ID=<Account ID>
R2_ACCESS_KEY_ID=<Access Key>
R2_SECRET_ACCESS_KEY=<Secret Key>
R2_BUCKET_NAME=pettoyou-files
R2_PUBLIC_URL=https://files.pettoyou.com

# 또는 AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=<IAM Access Key>
AWS_SECRET_ACCESS_KEY=<IAM Secret>
AWS_S3_BUCKET=pettoyou-files
```

**비용** (Cloudflare R2):
- 저장: $0.015/GB/월
- Egress: 무료 (S3는 유료!)
- 예상: 월 $5~$20

---

## 9️⃣ 보안 & 컴플라이언스

### KMS (Key Management Service)
**목적**: 의료 기록 암호화 키 관리

**옵션**:
- **fly.io Secrets** (간단): `flyctl secrets set ENCRYPTION_MASTER_KEY=<key>`
- **AWS KMS** (엔터프라이즈): 키 로테이션, 감사 로그

**환경 변수**:
```bash
# pet-to-you-api/.env
ENCRYPTION_MASTER_KEY=<openssl rand -base64 32>
KMS_KEY_ID=<AWS KMS Key ARN (선택)>
```

**비용**: fly.io Secrets (무료) / AWS KMS (월 $1/키)

---

### Wazuh SIEM (보안 모니터링)
**목적**: 실시간 보안 이벤트 감지 (의료법 요구사항)

**설정 방법**:
```bash
# Docker로 Wazuh 설치
docker-compose -f infrastructure/monitoring/docker-compose.wazuh.yml up -d
```

**환경 변수**:
```bash
# pet-to-you-api/.env
WAZUH_API_URL=https://wazuh.pettoyou.com
WAZUH_API_KEY=<Wazuh API Token>
```

**비용**: 오픈소스 (무료) + 호스팅 비용 (월 $10~$50)

---

## 🔟 외부 API 통합

### 동물병원 정보 API (공공데이터)
**목적**: 병원 정보 자동 수집

**설정 방법**:
1. https://www.data.go.kr 접속
2. "동물병원 인허가 정보" 검색
3. 활용 신청 → 승인 후 인증키 발급

**환경 변수**:
```bash
# pet-to-you-api/.env
OPEN_API_SERVICE_KEY=<인증키>
```

**비용**: 무료

---

### OCR API (선택 - 증명서 인증)
**목적**: 동물등록증, 사업자등록증 자동 인식

**옵션**:
- **Naver Clova OCR**: https://www.ncloud.com/product/aiService/ocr
- **Google Vision API**: https://cloud.google.com/vision

**환경 변수**:
```bash
# pet-to-you-api/.env
NAVER_OCR_API_URL=https://xxxxx.apigw.ntruss.com/custom/v1/
NAVER_OCR_SECRET_KEY=<Secret Key>
```

**비용**: 무료 (월 1,000건) → 1,000건당 ₩1,000

---

## 📊 비용 요약

### 개발/테스트 단계 (무료 티어 활용)
| 서비스 | 월 비용 | 비고 |
|--------|---------|------|
| MongoDB Atlas | ₩0 | 무료 512MB |
| fly.io (PostgreSQL + API) | ₩0 | 무료 티어 |
| Redis (Upstash) | ₩0 | 무료 10K commands/day |
| Vercel | ₩0 | Hobby 플랜 |
| Expo EAS | ₩0 | 월 30 빌드 |
| Sentry | ₩0 | 월 5,000 에러 |
| OAuth (Kakao, Naver) | ₩0 | 무료 |
| Apple Developer | ₩11,000/월 | 연 ₩132,000 |
| **합계** | **~₩11,000/월** | **연 ~₩132,000** |

### 운영 단계 (월 10,000 사용자 가정)
| 서비스 | 월 비용 | 비고 |
|--------|---------|------|
| MongoDB Atlas | ₩76,000 | M10 Cluster |
| fly.io PostgreSQL | ₩26,000 | Dedicated CPU |
| fly.io API (2 instances) | ₩52,000 | High availability |
| Redis (Upstash) | ₩3,000 | 1M commands |
| Cloudflare R2 | ₩20,000 | 100GB 저장 |
| Vercel Pro | ₩27,000 | 팀 협업 |
| Expo EAS | ₩133,000 | 무제한 빌드 |
| Sentry | ₩35,000 | 50K events |
| SMS (CoolSMS) | ₩50,000 | 월 5,000건 |
| SendGrid | ₩27,000 | 월 50,000통 |
| Toss Payments 수수료 | ₩300,000 | 거래액 ₩1,000만 × 3% |
| Apple Developer | ₩11,000 | 연 ₩132,000 ÷ 12 |
| **합계** | **~₩760,000/월** | **연 ~₩9,120,000** |

---

## ⚙️ 환경별 설정 파일

### `/pet-to-you-api/.env.development`
```bash
NODE_ENV=development
PORT=3000

# Database (Local Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pettoyou_dev

MONGODB_URI=mongodb://localhost:27017/pettoyou_dev
REDIS_URL=redis://localhost:6379

# JWT (개발용 - 실제 사용 금지!)
JWT_SECRET=dev_secret_DO_NOT_USE_IN_PRODUCTION
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=dev_refresh_secret
JWT_REFRESH_EXPIRY=30d

# OAuth (테스트 키)
KAKAO_CLIENT_ID=<개발용 키>
NAVER_CLIENT_ID=<개발용 키>

# Payments (테스트 모드)
TOSS_PAYMENTS_CLIENT_KEY=test_ck_...
TOSS_PAYMENTS_SECRET_KEY=test_sk_...

# Logging
LOG_LEVEL=debug
```

### `/pet-to-you-api/.env.production`
```bash
NODE_ENV=production
PORT=3000

# Database (fly.io)
DB_HOST=pettoyou-db.internal
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<fly.io에서 제공>
DB_NAME=pettoyou

MONGODB_URI=mongodb+srv://...
REDIS_URL=rediss://...

# JWT (강력한 시크릿)
JWT_SECRET=<openssl rand -base64 64 생성>
JWT_EXPIRY=1h
JWT_REFRESH_SECRET=<openssl rand -base64 64 생성>
JWT_REFRESH_EXPIRY=7d

# OAuth (운영 키)
KAKAO_CLIENT_ID=<운영 키>
KAKAO_CLIENT_SECRET=<Admin 키>
NAVER_CLIENT_ID=<운영 키>
NAVER_CLIENT_SECRET=<운영 시크릿>
APPLE_CLIENT_ID=com.pettoyou.mobile
APPLE_TEAM_ID=<Team ID>
APPLE_KEY_ID=<Key ID>

# Payments (운영 모드)
TOSS_PAYMENTS_CLIENT_KEY=live_ck_...
TOSS_PAYMENTS_SECRET_KEY=live_sk_...

# Security
ENCRYPTION_MASTER_KEY=<KMS 또는 강력한 키>
CORS_ORIGIN=https://hospital.pettoyou.com,https://admin.pettoyou.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info

# Compliance
MOHW_API_KEY=<보건복지부 API>
PIPC_API_KEY=<개인정보보호위원회 API>
```

---

## 🚀 빠른 시작 가이드

### 1단계: 필수 무료 서비스 설정 (30분)
```bash
# MongoDB Atlas
1. 무료 계정 생성 → M0 Cluster (서울)
2. 연결 문자열 복사 → .env

# fly.io
3. flyctl auth signup
4. flyctl postgres create --region icn
5. 연결 정보 → .env

# Redis (Upstash)
6. 무료 계정 생성 → 서울 리전
7. Redis URL 복사 → .env
```

### 2단계: OAuth 설정 (1시간)
```bash
# Kakao
1. developers.kakao.com → 앱 생성
2. REST API 키 → .env

# Naver
3. developers.naver.com → 앱 등록
4. Client ID/Secret → .env
```

### 3단계: 결제 설정 (30분)
```bash
# Toss Payments
1. tosspayments.com → 개발자센터
2. 테스트 키 발급 → .env
```

### 4단계: 앱 실행 (5분)
```bash
# Backend
cd pet-to-you-api
cp .env.example .env  # 위에서 받은 토큰들 입력
docker-compose up -d
pnpm install
pnpm migration:run
pnpm dev

# Mobile
cd pet-to-you-mobile
cp .env.example .env
pnpm install
pnpm start

# iOS 시뮬레이터에서 'i' 누르기
```

---

## 🔐 보안 체크리스트

**절대 공개하면 안 되는 값**:
- ❌ JWT_SECRET, JWT_REFRESH_SECRET
- ❌ DB_PASSWORD, MONGODB_URI (비밀번호 포함)
- ❌ TOSS_PAYMENTS_SECRET_KEY
- ❌ ENCRYPTION_MASTER_KEY
- ❌ KMS Private Keys
- ❌ OAuth Client Secrets
- ❌ API Secret Keys

**Git에 커밋하지 말 것**:
- `.env`, `.env.production`, `.env.local`
- `eas.json` (credentials 포함 시)
- `google-services.json`, `GoogleService-Info.plist`

**안전한 관리 방법**:
- `.env.example` 파일만 커밋 (실제 값 없이)
- 1Password, Bitwarden 등 비밀번호 관리자 사용
- fly.io secrets: `flyctl secrets set KEY=value`
- Vercel 환경 변수: Dashboard에서 직접 입력

---

## 📞 도움말

**MongoDB 연결 안 됨**:
```bash
# IP Whitelist 확인
MongoDB Atlas → Network Access → 0.0.0.0/0 추가
```

**fly.io PostgreSQL 연결 안 됨**:
```bash
# Internal DNS 사용 확인
DB_HOST=pettoyou-db.internal  # .fly.dev 아님!
```

**OAuth 콜백 에러**:
```bash
# Redirect URI 정확히 일치하는지 확인
Kakao: http://localhost:8081/auth/kakao/callback
Naver: http://localhost:8081/auth/naver/callback
```

**Expo 빌드 실패**:
```bash
# EAS 로그인 확인
eas whoami
eas build:configure --platform all
```

---

**끝! 질문 있으면 언제든 물어보세요!** 🚀
