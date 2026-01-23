# Pet to You - 개발 환경 구축 가이드

> 로컬 개발 환경 설정부터 프로덕션 배포까지

**버전**: v2.1
**작성일**: 2025-12-29

---

## 목차

1. [시스템 요구사항](#1-시스템-요구사항)
2. [로컬 개발 환경 구축](#2-로컬-개발-환경-구축)
3. [데이터베이스 설정](#3-데이터베이스-설정)
4. [개발 서버 실행](#4-개발-서버-실행)
5. [Docker 환경](#5-docker-환경)
6. [프로덕션 배포](#6-프로덕션-배포)

---

## 1. 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: v20.x LTS 이상
- **npm**: v10.x 이상
- **PostgreSQL**: v16.x
- **Redis**: v7.x
- **Docker**: v24.x (선택)
- **Git**: v2.x

### 권장 개발 도구
- **IDE**: VS Code
- **Extensions**:
  - ESLint
  - Prettier
  - Prisma
  - TailwindCSS IntelliSense
  - TypeScript

---

## 2. 로컬 개발 환경 구축

### Step 1: 저장소 클론
```bash
git clone https://github.com/your-org/pet-to-you.git
cd pet-to-you
```

### Step 2: 의존성 설치
```bash
# 모든 워크스페이스 의존성 설치
npm install

# Turborepo가 자동으로 모든 앱/패키지 설치
```

### Step 3: 환경 변수 설정
```bash
# 루트에 .env 파일 생성
cp .env.example .env.local

# 각 앱에도 필요 시 생성
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
```

**.env.local 편집** (중요한 값들):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pet_to_you"
JWT_ACCESS_SECRET="your-secret-key-min-256-bits"
JWT_REFRESH_SECRET="your-refresh-secret-key"
# 나머지는 개발용 기본값 사용 가능
```

---

## 3. 데이터베이스 설정

### Option 1: Docker Compose (권장)

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pet-to-you-postgres
    environment:
      POSTGRES_DB: pet_to_you
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: pet-to-you-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**실행**:
```bash
# DB 서비스 시작
docker-compose up -d

# 확인
docker-compose ps

# 로그 확인
docker-compose logs -f postgres
```

### Option 2: 로컬 설치

**PostgreSQL 설치** (macOS):
```bash
brew install postgresql@16
brew services start postgresql@16

# DB 생성
createdb pet_to_you
```

**Redis 설치**:
```bash
brew install redis
brew services start redis
```

---

### Prisma 마이그레이션

```bash
# Prisma Client 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate

# Prisma Studio (DB GUI)
npm run prisma:studio
# http://localhost:5555
```

### 초기 데이터 Seed

**apps/api/prisma/seed.ts**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 테스트용 병원 생성
  await prisma.hospital.createMany({
    data: [
      {
        name: '도그마루 메디컬 센터',
        address: '서울시 강남구 논현동 123',
        location: '37.5172,127.0286', // PostGIS POINT
        phone: '02-1234-5678',
        is24Hours: false,
        openingHours: {
          mon: { open: '09:00', close: '21:00' },
          tue: { open: '09:00', close: '21:00' },
          // ...
        }
      },
      // ... 더 많은 병원
    ]
  });

  console.log('✅ Seed data inserted');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

**실행**:
```bash
npm run prisma:seed -w apps/api
```

---

## 4. 개발 서버 실행

### 전체 실행 (권장)
```bash
npm run dev
```

이 명령어는 동시에 실행:
- PWA (http://localhost:3000)
- 어드민 (http://localhost:3001)
- API (http://localhost:4000)

### 개별 실행
```bash
# PWA만
npm run dev:web

# 어드민만
npm run dev:admin

# API만
npm run dev:api
```

### API 문서 확인
- Swagger UI: http://localhost:4000/api/docs
- OpenAPI JSON: http://localhost:4000/api/docs-json

---

## 5. Docker 환경

### 전체 Docker Compose

**docker-compose.full.yml**:
```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pet_to_you
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Backend API
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/pet_to_you
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Frontend PWA
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    depends_on:
      - api

  # Admin Dashboard
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - api

volumes:
  postgres_data:
```

**실행**:
```bash
docker-compose -f docker-compose.full.yml up
```

---

## 6. 프로덕션 배포

### Frontend (Vercel)

**apps/web/vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.pet-to-you.com"
  }
}
```

**배포**:
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

---

### Backend (AWS ECS)

**Dockerfile**:
```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Source
COPY apps/api ./apps/api
COPY packages ./packages

# Build
RUN npm run build -w apps/api

# Prisma
RUN npm run prisma:generate -w apps/api

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
```

**배포** (GitHub Actions):
```yaml
# .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker Image
        run: |
          docker build -f apps/api/Dockerfile -t pet-to-you-api:latest .

      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin
          docker tag pet-to-you-api:latest $ECR_REGISTRY/pet-to-you-api:latest
          docker push $ECR_REGISTRY/pet-to-you-api:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster pet-to-you --service api --force-new-deployment
```

---

## 7. 트러블슈팅

### 자주 발생하는 문제

**문제 1: Prisma Client 타입 에러**
```bash
# 해결
npm run prisma:generate -w apps/api
```

**문제 2: Port 충돌**
```bash
# 3000 포트 사용 중인 프로세스 종료
lsof -ti:3000 | xargs kill -9
```

**문제 3: DB 연결 실패**
```bash
# PostgreSQL 서비스 확인
brew services list

# 재시작
brew services restart postgresql@16
```

**문제 4: npm install 실패**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 8. 유용한 명령어

```bash
# 전체 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint

# 린트 자동 수정
npm run lint:fix

# 테스트
npm test

# 테스트 (watch mode)
npm test -- --watch

# 캐시 클리어
npm run clean

# 의존성 업데이트
npm update

# 보안 취약점 검사
npm audit

# 취약점 자동 수정
npm audit fix
```

---

*개발 중 문제가 생기면 `.agent.md` 파일도 참고하세요.*
