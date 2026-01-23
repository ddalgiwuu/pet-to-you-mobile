# 🐾 Pet to You - Mobile App

**반려동물 종합 케어 플랫폼**

> 병원, 입양, 유치원, 커뮤니티까지 - 하나의 앱에서!

---

## 🌟 주요 기능

### 🏥 병원
- 리스트/지도 뷰로 근처 동물병원 검색
- 24시간, 야간진료, 주차, 응급 필터
- 병원 상세 정보 및 리뷰
- 5단계 예약 플로우 (펫 → 진료유형 → 날짜/시간 → 증상 → 확인)

### 💕 입양
- 입양 가능한 반려동물 검색
- 종, 나이, 크기, 성별 필터
- 보호소 정보 및 펫 스토리
- 입양 신청서 제출

### 🏫 유치원
- 근처 반려동물 유치원 검색
- 서비스, 가격, 시설 정보
- 유치원 예약

### 📅 예약 관리
- 예정/완료/취소 탭
- 예약 취소 및 변경

### 💬 커뮤니티
- Q&A, 후기, 일상 게시판
- 게시물 작성, 댓글, 좋아요
- 무한 스크롤

### 🐶 펫 관리
- 반려동물 등록 (기본 정보, 건강 정보, 사진)
- 펫 프로필 관리

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 카카오 맵 API 키 설정

**`app.json` 수정**:
```json
{
  "expo": {
    "extra": {
      "kakaoMapsAppKey": "YOUR_KAKAO_MAPS_APP_KEY",
      "apiBaseUrl": "http://localhost:3000/api/v1"
    }
  }
}
```

**카카오 맵 API 키 발급**:
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. "JavaScript 키" 복사
4. `app.json`에 입력

### 3. 백엔드 서버 실행

```bash
cd ../pet-to-you-api
npm install
npm run start:dev
```

### 4. 모바일 앱 실행

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# Web (개발용)
npm run web
```

---

## 🏗️ 기술 스택

### Core
- **Framework**: React Native + Expo (SDK 54)
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript

### State Management
- **Server State**: React Query (@tanstack/react-query)
- **Client State**: Zustand + AsyncStorage

### UI/UX
- **Animation**: Reanimated 3
- **Lists**: FlashList (@shopify/flash-list)
- **Bottom Sheets**: @gorhom/bottom-sheet
- **Icons**: Ionicons (@expo/vector-icons)
- **Haptics**: Expo Haptics

### Features
- **Maps**: Kakao Maps (WebView)
- **Images**: Expo Image + Expo Image Picker
- **Location**: Expo Location
- **Networking**: Axios

---

## 📁 프로젝트 구조

```
├── app/                    # 화면 (Expo Router)
│   ├── (auth)/            # 인증 화면
│   ├── (tabs)/            # 탭 네비게이션
│   ├── hospital/          # 병원 상세
│   ├── adoption/          # 입양 상세/신청
│   ├── daycare/           # 유치원 상세/예약
│   ├── pets/              # 펫 등록
│   ├── booking/           # 병원 예약
│   └── community/         # 커뮤니티
├── components/            # 재사용 컴포넌트
│   ├── shared/           # 공통 (지도, 검색, 필터)
│   ├── hospital/         # 병원 전용
│   ├── booking/          # 예약 전용
│   ├── pets/             # 펫 전용
│   └── ui/               # 기본 UI
├── hooks/                 # Custom hooks
├── services/              # API 클라이언트
├── store/                 # Zustand stores
├── constants/             # 상수 (테마, 설정)
└── assets/                # 정적 파일
```

---

## 🗺️ 카카오 맵 사용법

### WebView 기반 통합

Pet to You는 Kakao Maps JavaScript SDK를 WebView로 통합하여 사용합니다.

**장점**:
- 한국 POI 데이터 정확도
- 주소 검색 최적화
- 마커 클러스터링 지원
- 실시간 지도 업데이트

**사용 예시**:
```tsx
import { KakaoMapView, MapMarker } from '@/components/shared';
import config from '@/constants/config';

function MyScreen() {
  const markers: MapMarker[] = [
    {
      id: '1',
      lat: 37.5665,
      lng: 126.9780,
      title: '서울 시청',
      type: 'hospital',
    },
  ];

  return (
    <KakaoMapView
      markers={markers}
      center={{ lat: 37.5665, lng: 126.9780, level: 3 }}
      onMarkerPress={(marker) => console.log(marker)}
      kakaoAppKey={config.kakaoMapsAppKey}
    />
  );
}
```

---

## 🔑 환경 변수

### app.json
```json
{
  "expo": {
    "extra": {
      "kakaoMapsAppKey": "YOUR_KAKAO_KEY",
      "apiBaseUrl": "http://localhost:3000/api/v1"
    }
  }
}
```

### 접근 방법
```tsx
import Constants from 'expo-constants';

const kakaoKey = Constants.expoConfig?.extra?.kakaoMapsAppKey;
const apiUrl = Constants.expoConfig?.extra?.apiBaseUrl;
```

---

## 📱 화면 목록

### 메인 탭 (7개)
1. **홈** - 대시보드, 빠른 액세스
2. **병원** - 병원 검색 (리스트/지도)
3. **입양** - 입양 펫 검색 (리스트/지도)
4. **유치원** - 유치원 검색 (리스트/지도)
5. **예약** - 예약 관리 (예정/완료/취소)
6. **커뮤니티** - 게시판 (Q&A/후기/일상)
7. **프로필** - 사용자 설정

### 상세/액션 화면 (11개)
- `/hospital/[id]` - 병원 상세 (정보/리뷰)
- `/booking/[hospitalId]` - 병원 예약 (5단계)
- `/adoption/[id]` - 입양 펫 상세
- `/adoption/apply` - 입양 신청서
- `/daycare/[id]` - 유치원 상세
- `/daycare/reserve` - 유치원 예약
- `/pets/register` - 펫 등록 (4단계)
- `/community/create` - 게시물 작성
- `/community/[postId]` - 게시물 상세 + 댓글

---

## 🧪 테스트

### 병원 기능 테스트
```
✓ 병원 탭 진입
✓ 검색어 입력
✓ 필터 적용 (24시간, 야간진료)
✓ 리스트 ↔ 지도 전환
✓ 병원 선택 → 상세
✓ 예약하기 → 5단계 플로우
✓ 예약 완료
```

### 펫 등록 테스트
```
✓ "새 펫 등록" 버튼
✓ 기본 정보 입력
✓ 건강 정보 입력
✓ 사진 업로드
✓ 확인 → 등록 완료
```

### 입양 기능 테스트
```
✓ 입양 탭 진입
✓ 펫 목록 표시
✓ 필터 적용
✓ 펫 선택 → 상세
✓ 입양 신청 → 완료
```

---

## 🔗 관련 문서

- [전체 구현 계획](./PET_TO_YOU_IMPLEMENTATION_COMPLETE.md)
- [컴포넌트 라이브러리](./COMPONENT_LIBRARY.md)
- [최적화 가이드](./OPTIMIZATION-GUIDE.md)
- [테스트 가이드](./TESTING_GUIDE.md)

---

## 💡 도움말

### 자주 묻는 질문

**Q: 지도가 안 보여요**
- `app.json`에 카카오 맵 API 키가 올바르게 설정되었는지 확인
- WebView가 제대로 로드되는지 개발자 도구 확인

**Q: API 호출이 실패해요**
- 백엔드 서버가 실행 중인지 확인 (`http://localhost:3000`)
- `app.json`의 `apiBaseUrl`이 올바른지 확인
- 네트워크 연결 상태 확인

**Q: 사진 업로드가 안돼요**
- 갤러리 권한 허용 확인
- 백엔드 multer 설정 확인
- 파일 크기 제한 확인

---

## 👥 기여

프로젝트 개선 아이디어나 버그 리포트는 이슈로 등록해주세요!

---

## 📄 라이선스

MIT License

---

**만든이**: Claude Code + SuperClaude Framework  
**완성일**: 2026-01-20
