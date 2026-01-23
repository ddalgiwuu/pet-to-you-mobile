# Pet to You - 보안 가이드

> OWASP Top 10 2025 완전 준수 및 개인정보보호법 compliance

**버전**: v2.1
**작성일**: 2025-12-29
**보안 등급**: Enterprise-grade

---

## 목차

1. [보안 원칙](#1-보안-원칙)
2. [OWASP Top 10 2025 대응](#2-owasp-top-10-2025-대응)
3. [암호화 전략](#3-암호화-전략)
4. [인증 & 인가](#4-인증--인가)
5. [개인정보 보호](#5-개인정보-보호)
6. [보안 체크리스트](#6-보안-체크리스트)
7. [사고 대응](#7-사고-대응)

---

## 1. 보안 원칙

### 심층 방어 (Defense in Depth)
```
[계층 1] Frontend: XSS, CSRF 방어
[계층 2] API Gateway: Rate Limiting, DDoS 방어
[계층 3] Authentication: JWT, OAuth 2.0
[계층 4] Authorization: RBAC, Guards
[계층 5] Application: Input Validation
[계층 6] Database: Encryption, Audit Log
[계층 7] Infrastructure: VPC, Security Group
```

### 최소 권한 원칙 (Least Privilege)
- 사용자: 자신의 데이터만
- 사장님: 자기 시설만
- 관리자: 전체 (최소한으로 제한)

### Fail Secure
- 에러 발생 시 접근 거부
- 권한 불명확 시 거부

---

## 2. OWASP Top 10 2025 대응

### A01: Broken Access Control ⚠️ 최우선

**위협**: 사용자가 권한 없는 리소스에 접근

**대응책**:
```typescript
// 1. JWT Guards (NestJS)
@UseGuards(JwtAuthGuard)
@Get('appointments/:id')
async getAppointment(@Param('id') id: string, @User() user) {
  // 2. 소유권 검증
  const appointment = await this.appointmentService.findOne(id);
  if (appointment.userId !== user.id) {
    throw new ForbiddenException();
  }
  return appointment;
}

// 3. Row-Level Security (PostgreSQL)
CREATE POLICY user_appointments_policy ON appointments
  FOR SELECT
  USING (user_id = current_user_id());
```

**테스트**:
- ✅ 다른 사용자 예약 접근 거부
- ✅ 관리자만 전체 접근
- ✅ JWT 없이 보호된 API 접근 거부

---

### A02: Security Misconfiguration

**위협**: 잘못된 설정으로 인한 취약점

**대응책**:
```typescript
// 1. Helmet.js (보안 헤더)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS 화이트리스트
app.enableCors({
  origin: [
    'https://pet-to-you.com',
    'https://www.pet-to-you.com',
    'https://admin.pet-to-you.com'
  ],
  credentials: true
});

// 3. 프로덕션 설정
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));  // 상세 로깅
  app.disable('x-powered-by');  // 기술 스택 숨김
}
```

---

### A03: Software Supply Chain Failures ⭐ 신규

**위협**: 의존성 패키지의 취약점

**대응책**:
```bash
# 1. npm audit (CI/CD 필수)
npm audit

# 2. 자동 수정
npm audit fix

# 3. Dependabot 설정 (.github/dependabot.yml)
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

# 4. Lock 파일 커밋
git add package-lock.json
```

**정기 점검**:
- 주간: npm audit
- 월간: 의존성 업데이트 검토
- 분기: 취약점 패치

---

### A05: Injection

**위협**: SQL Injection, NoSQL Injection

**대응책**:
```typescript
// ✅ Prisma ORM 사용 (Parameterized Queries)
const users = await prisma.user.findMany({
  where: { email: userInput }  // Safe, Prisma가 자동 escape
});

// ❌ Raw Query는 피하기
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}  // Vulnerable!
`;

// ✅ Raw Query 불가피 시 Prepared Statement
const users = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM users WHERE email = ${userInput}`
);

// ✅ Input Validation (class-validator)
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/)  // 영문+숫자
  password: string;
}
```

---

### A06: Cryptographic Failures

**위협**: 암호화 없이 민감 정보 저장/전송

**대응책**:

**1. 전송 중 암호화** (TLS 1.3):
```nginx
# nginx.conf
server {
  listen 443 ssl http2;
  ssl_protocols TLSv1.3;
  ssl_ciphers 'ECDHE+AESGCM:ECDHE+CHACHA20';
  ssl_prefer_server_ciphers on;

  # HSTS
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

**2. 저장 시 암호화** (PostgreSQL):
```sql
-- pgcrypto 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 개인정보 암호화
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email BYTEA NOT NULL,  -- 암호화됨
  phone BYTEA,           -- 암호화됨
  password_hash VARCHAR(255) NOT NULL  -- bcrypt
);

-- 암호화 함수
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(plaintext, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

**3. 비밀번호 해싱** (bcrypt):
```typescript
import * as bcrypt from 'bcrypt';

// 회원가입
const saltRounds = 12;  // 2^12 = 4096 반복
const hashedPassword = await bcrypt.hash(password, saltRounds);

await prisma.user.create({
  data: {
    email: encrypt(email),
    passwordHash: hashedPassword
  }
});

// 로그인
const user = await prisma.user.findUnique({ where: { email } });
const isValid = await bcrypt.compare(password, user.passwordHash);
```

---

## 3. 암호화 전략

### 암호화 대상 데이터

| 데이터 | 암호화 방식 | 키 관리 |
|--------|-----------|--------|
| 비밀번호 | bcrypt (cost 12) | N/A (해시) |
| 이메일 | pgcrypto (AES-256) | AWS Secrets Manager |
| 전화번호 | pgcrypto (AES-256) | AWS Secrets Manager |
| 주소 | pgcrypto (AES-256) | AWS Secrets Manager |
| JWT Secret | N/A | 환경 변수 (256bit) |
| 결제 정보 | PG사 위임 | N/A |
| S3 파일 | S3 SSE (AES-256) | AWS KMS |

### 키 관리 (AWS Secrets Manager)
```typescript
// apps/api/src/config/secrets.service.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class SecretsService {
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({ region: 'ap-northeast-2' });
  }

  async getEncryptionKey(): Promise<string> {
    const command = new GetSecretValueCommand({
      SecretId: 'pet-to-you/encryption-key'
    });
    const response = await this.client.send(command);
    return response.SecretString;
  }
}
```

---

## 4. 인증 & 인가

### JWT 전략

**토큰 구조**:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "USER",
    "iat": 1735516800,
    "exp": 1735520400
  },
  "signature": "..."
}
```

**구현**:
```typescript
// JWT 발급
const payload: JwtPayload = {
  sub: user.id,
  email: user.email,
  role: user.isAdmin ? 'ADMIN' : 'USER'
};

const accessToken = this.jwtService.sign(payload, {
  secret: process.env.JWT_ACCESS_SECRET,
  expiresIn: '1h'
});

const refreshToken = this.jwtService.sign(payload, {
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: '7d'
});

// httpOnly cookie에 저장 (XSS 방어)
response.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,  // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7일
});
```

### RBAC (역할 기반 접근 제어)

**역할 정의**:
```typescript
enum Role {
  USER = 'USER',                    // 일반 사용자
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN', // 병원 사장
  DAYCARE_ADMIN = 'DAYCARE_ADMIN',   // 유치원 사장
  SHELTER_ADMIN = 'SHELTER_ADMIN',   // 보호소 관리자
  SUPER_ADMIN = 'SUPER_ADMIN'        // 플랫폼 관리자
}
```

**Guards 구현**:
```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// 사용
@Roles(Role.HOSPITAL_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin/dashboard')
async getDashboard() {}
```

---

## 5. 개인정보 보호

### 개인정보보호법 준수

**수집 최소화**:
- 필수: 이름, 이메일, 전화번호
- 선택: 주소 (입양 신청 시)

**동의 관리**:
```typescript
interface UserConsent {
  termsOfService: boolean;      // 필수
  privacyPolicy: boolean;       // 필수
  marketingEmail: boolean;      // 선택
  marketingSms: boolean;        // 선택
  consentedAt: Date;
}
```

**삭제 요청 처리** (30일 이내):
```typescript
async deleteUserData(userId: string) {
  await prisma.$transaction(async (tx) => {
    // Soft delete (법적 보관 기간 고려)
    await tx.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        // 개인정보 마스킹
        email: encrypt('deleted@user.com'),
        phone: encrypt('000-0000-0000'),
        name: '삭제된 사용자'
      }
    });

    // 관련 데이터 익명화
    await tx.appointment.updateMany({
      where: { userId },
      data: { specialNotes: '[삭제됨]' }
    });
  });
}
```

**유출 신고** (24시간 이내):
- 한국인터넷진흥원 (KISA) 신고
- 사용자 통지
- 사고 조사 및 보고서

---

## 6. 보안 체크리스트

### 개발 단계
- [ ] 모든 API에 인증 적용 (Public 제외)
- [ ] Input Validation (모든 DTO)
- [ ] SQL Injection 방어 (Prisma 사용)
- [ ] XSS 방어 (Sanitization)
- [ ] CSRF 방어 (토큰)
- [ ] 민감 정보 로깅 금지
- [ ] 에러 메시지에 스택 노출 금지

### 배포 전
- [ ] npm audit (취약점 0개)
- [ ] HTTPS 강제
- [ ] 환경 변수 검증
- [ ] CORS 화이트리스트 설정
- [ ] Rate Limiting 활성화
- [ ] pg_audit 활성화
- [ ] 백업 자동화 설정

### 정기 점검
- 주간: npm audit
- 월간: 침투 테스트
- 분기: 보안 감사
- 연간: SOC 2 인증

---

## 7. 사고 대응

### 보안 사고 대응 절차

**Phase 1: 탐지 (Detection)**
```
1. 모니터링 알람 수신
   ├─ CloudWatch 알람
   ├─ pg_audit 이상 패턴
   └─ 사용자 신고
   ↓
2. 사고 확인
   ├─ 로그 분석
   └─ 영향 범위 파악
```

**Phase 2: 격리 (Containment)**
```
1. 즉시 조치
   ├─ 해당 계정 차단
   ├─ IP 차단 (필요 시)
   └─ 영향받은 API 비활성화
   ↓
2. 증거 보전
   ├─ 로그 백업
   └─ 스냅샷 생성
```

**Phase 3: 복구 (Recovery)**
```
1. 원인 분석
2. 패치 적용
3. 서비스 복구
4. 모니터링 강화
```

**Phase 4: 보고 (Reporting)**
```
1. 사고 보고서 작성
2. KISA 신고 (24시간 이내)
3. 사용자 통지
4. 재발 방지 대책
```

---

## 참고 자료

**OWASP**:
- [OWASP Top 10 2025](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

**NestJS 보안**:
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [NestJS 보안 가이드](https://dev.to/drbenzene/best-security-implementation-practices-in-nestjs-a-comprehensive-guide-2p88)

**PostgreSQL**:
- [PostgreSQL GDPR 준수](https://www.enterprisedb.com/postgresql-compliance-gdpr-soc-2-data-privacy-security)
- [pg_audit Documentation](https://github.com/pgaudit/pgaudit)

**한국 법률**:
- [개인정보보호법](https://www.law.go.kr/)
- [정보통신망법](https://www.law.go.kr/)

---

*보안은 한 번에 끝나지 않습니다. 지속적인 모니터링과 개선이 필요합니다.*
