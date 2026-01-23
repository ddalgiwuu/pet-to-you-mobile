# 🚀 Pet to You - 앱 시작 가이드

## ✅ 설정 완료 확인

### 1. 카카오 맵 API 키 ✅
- **API 키**: `4b75a4c8c63df038e1a6e673ab97531b`
- **설정 위치**: `app.json` → `extra.kakaoMapsAppKey`
- **상태**: ✅ 설정 완료

### 2. 등록된 도메인 ✅
카카오 개발자 콘솔에 등록된 도메인:
- `http://localhost`
- `https://localhost`
- `https://u.expo.dev` (Expo Go)
- `http://localhost:8888`
- `http://localhost:8081` (Metro bundler)
- `http://127.0.0.1:8888`
- `http://127.0.0.1:8081`

### 3. 백엔드 API ✅
- **URL**: `http://localhost:3000/api/v1`
- **설정 위치**: `app.json` → `extra.apiBaseUrl`
- **모듈**: 병원, 입양, 유치원, 펫, 예약, 커뮤니티 모두 구현됨

---

## 🎯 앱 실행 3단계

### Step 1: 백엔드 서버 실행

```bash
# 새 터미널 열기
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-api

# 서버 시작
npm run start:dev

# ✅ 확인: http://localhost:3000 접속 시 API 응답
```

### Step 2: 모바일 앱 실행

```bash
# 현재 디렉토리에서
npm start

# 또는 특정 플랫폼
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
```

### Step 3: 테스트

**Expo Go 앱 사용**:
1. App Store/Play Store에서 "Expo Go" 다운로드
2. 터미널에 표시된 QR 코드 스캔
3. 앱 실행

**시뮬레이터 사용**:
1. `npm run ios` 또는 `npm run android`
2. 자동으로 시뮬레이터에서 앱 실행

---

## 🧪 첫 실행 테스트 시나리오

### 1단계: 홈 화면 확인
```
✓ 앱 시작
✓ 홈 화면 표시 확인
✓ 탭 네비게이션 확인 (7개 탭)
```

### 2단계: 병원 기능 테스트
```
✓ "병원" 탭 클릭
✓ 위치 권한 요청 → "허용" 선택
✓ 병원 리스트 로딩 확인
✓ "리스트 | 지도" 토글 클릭
✓ 지도 표시 확인 (서울 시청 주변)
✓ 다시 리스트로 전환
```

### 3단계: 펫 등록 테스트
```
✓ "병원" 탭 → 병원 선택 → "예약하기"
✓ "새 반려동물 등록" 버튼
✓ 이름: "멍멍이"
✓ 종류: "강아지" 선택
✓ "다음" → 건강 정보
✓ 중성화: "완료" 선택
✓ "다음" → 사진 등록
✓ 갤러리 권한 허용
✓ 대표 사진 선택
✓ "다음" → 확인
✓ "등록 완료"
```

### 4단계: 입양 탭 테스트
```
✓ "입양" 탭 클릭
✓ 입양 가능 펫 리스트 확인
✓ 리스트 ↔ 지도 전환
✓ 펫 선택 → 상세 화면
✓ "입양 신청하기" 확인
```

### 5단계: 커뮤니티 테스트
```
✓ "커뮤니티" 탭 클릭
✓ 게시물 피드 확인
✓ "글쓰기" FAB 버튼 (우측 하단)
✓ 게시물 작성 화면 확인
```

---

## 🔧 문제 해결

### 지도가 빈 화면으로 나올 때

**원인**: API 키 또는 도메인 설정 문제

**해결**:
1. `app.json`에서 API 키 확인:
   ```json
   "kakaoMapsAppKey": "4b75a4c8c63df038e1a6e673ab97531b"
   ```

2. 앱 재시작:
   ```bash
   # Metro bundler 종료 (Ctrl+C)
   npm start -- --clear
   ```

3. 카카오 개발자 콘솔에서 도메인 재확인

### API 호출 실패 시

**원인**: 백엔드 서버 미실행 또는 URL 불일치

**해결**:
1. 백엔드 실행 확인:
   ```bash
   cd ../pet-to-you-api
   npm run start:dev
   ```

2. 브라우저에서 확인:
   ```
   http://localhost:3000/api/v1/hospitals
   ```

3. 네트워크 상태 확인 (WiFi 연결)

### 위치 권한 오류

**iOS**:
- 설정 → 개인정보 보호 → 위치 서비스 → Expo Go → "앱 사용 중"

**Android**:
- 설정 → 앱 → Expo → 권한 → 위치 → "앱 사용 중에만"

---

## 📱 개발 환경별 실행 방법

### Expo Go (권장 - 빠른 테스트)
```bash
npm start

# QR 코드 스캔 (iOS: 카메라, Android: Expo Go 앱)
```

### iOS 시뮬레이터
```bash
npm run ios

# Xcode 필요
# 첫 실행 시 시간이 걸릴 수 있음
```

### Android 에뮬레이터
```bash
npm run android

# Android Studio 필요
# 에뮬레이터가 실행 중이어야 함
```

### Web (개발 전용)
```bash
npm run web

# http://localhost:19006 자동 열림
# 일부 네이티브 기능은 작동하지 않음
```

---

## 🎨 기능별 색상 확인

앱 실행 시 다음 색상으로 구분됩니다:

- **병원**: 파란색 (#42A5F5)
- **입양**: 분홍색 (#FF6B9D)
- **유치원**: 초록색 (#66BB6A)
- **커뮤니티**: 파란색 (#42A5F5)

---

## 🔥 빠른 시작 (Quick Start)

### 한 번에 모두 실행

**터미널 1 - 백엔드**:
```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-api && npm run start:dev
```

**터미널 2 - 모바일**:
```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile && npm start
```

**스마트폰**:
- Expo Go 앱에서 QR 코드 스캔

**5분 안에 앱 실행 가능!** ⚡

---

## 📊 구현된 화면 목록

### 메인 탭 (7개)
1. ✅ 홈 - 대시보드
2. ✅ 병원 - 검색 (리스트/지도)
3. ✅ 입양 - 검색 (리스트/지도)
4. ✅ 유치원 - 검색 (리스트/지도)
5. ✅ 예약 - 관리 (예정/완료/취소)
6. ✅ 커뮤니티 - 게시판
7. ✅ 프로필 - 설정

### 상세/액션 화면 (11개)
1. ✅ 병원 상세 + 리뷰
2. ✅ 병원 예약 (5단계)
3. ✅ 입양 펫 상세
4. ✅ 입양 신청서
5. ✅ 유치원 상세
6. ✅ 유치원 예약
7. ✅ 펫 등록 (4단계)
8. ✅ 펫 상세
9. ✅ 게시물 작성
10. ✅ 게시물 상세 + 댓글

---

## 💡 개발 팁

### Hot Reload
- 파일 저장 시 자동 새로고침
- `Cmd+D` (iOS) 또는 흔들기 (Android) → Developer Menu
- "Fast Refresh" 활성화 확인

### 디버깅
```javascript
// React Query Devtools (개발 중)
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
console.log(queryClient.getQueryData(['hospitals']));
```

### 로그 확인
```bash
# Metro bundler 로그
# 자동으로 터미널에 표시됨

# React Native 로그
npx react-native log-ios     # iOS
npx react-native log-android # Android
```

---

## 🎉 완성!

**모든 설정 완료**:
- ✅ 카카오 맵 API 키 설정
- ✅ 도메인 등록 확인
- ✅ 백엔드 API 준비
- ✅ 모든 기능 구현

**지금 바로 실행 가능!**

```bash
# 백엔드 실행 (터미널 1)
cd ../pet-to-you-api && npm run start:dev

# 모바일 실행 (터미널 2)
npm start
```

**QR 코드 스캔하면 앱이 시작됩니다!** 📱✨

---

**구현 완료**: 2026-01-20  
**카카오 맵**: ✅ 설정 완료  
**백엔드**: ✅ 준비 완료  
**프론트엔드**: ✅ 100% 완성
