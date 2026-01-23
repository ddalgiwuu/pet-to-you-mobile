# Pet-to-You UX Flow 구조

**기준 디자인**: Figma - Pet-to-you (Q7QGfNh1DeuoAe7xlHfS5S)
**화면 크기**: 390x844px (모바일 표준)
**디자인 언어**: Toss 스타일 미니멀리즘

---

## 📱 전체 화면 목록

1. **홈 화면** (5개 변형)
2. **병원 검색**
3. **병원 상세**
4. **예약**
5. **내 반려동물**
6. **프로필**

---

## 🏠 1. 홈 화면

### 레이아웃 구조
```
┌─────────────────────────────────┐
│  상단바 (56-60px)                │  ← 타이틀 + 알림
├─────────────────────────────────┤
│                                  │
│  메인 콘텐츠 (스크롤 영역)       │
│  ├─ 인사말 헤더                  │  ← "안녕하세요, OOO님"
│  ├─ AI Health Tip 배너          │  ← 그라디언트 블루
│  ├─ 빠른 서비스 (2x2 그리드)    │  ← 병원/예약/반려동물/마이
│  ├─ 최근 활동 리스트            │  ← 병원/살롱/쇼핑 내역
│  └─ 보험 배너                   │  ← 보험료 조회
│                                  │
├─────────────────────────────────┤
│  하단 네비게이션 (73px)         │  ← 5개 탭
└─────────────────────────────────┘
```

### 컴포넌트 상세

#### 1.1 상단바
- **높이**: 56-60px
- **구성**:
  - 좌측: "Pet to You" (폰트: BM JUA, 16px)
  - 우측: 알림 아이콘 (24x24px)
- **배경**: 흰색 (#FFFFFF)
- **간격**: 좌우 16px, 상하 10px

#### 1.2 인사말 헤더
- **상단 간격**: 32px
- **구조**:
  ```
  안녕하세요,           ← 20px, font-medium, #6b7280
  [사용자명]님         ← 28px, font-extrabold, #111827
  ```
- **우측**: 알림 벨 (흰색 원형 버튼, 40x40px, 빨간 점 배지)

#### 1.3 AI Health Tip 배너
- **크기**: 전체 너비 (좌우 16px 마진), 높이 160px
- **배경**: 3색 그라디언트
  - #3182F6 (밝은 파랑)
  - #2264E6 (중간 파랑)
  - #0B46C3 (진한 파랑)
- **모서리**: 26px 라운드
- **내부 패딩**: 28px (7 * 4)
- **그림자**: 0 15px 40px -12px rgba(0,100,255,0.5)

**내부 구조**:
```
┌────────────────────────────────┐
│ [⚡ 오늘의 펫 닥터 AI]  [🔄]   │ ← Glass badge + Refresh 버튼
│                                 │
│ "반려동물과 매일 산책하면..."   │ ← 22px, bold, white
│                                 │
└────────────────────────────────┘
```

**특수 효과**:
- 데코레이션 블롭 2개 (반투명 원, 흐린 효과)
- 노이즈 텍스처 (SVG, 3% 투명도)
- 하단 라인 (그라디언트)

#### 1.4 빠른 서비스 그리드
- **제목**: "빠른 서비스" (20px, bold)
- **레이아웃**: 2x2 그리드, 16px 간격
- **각 카드**:
  - 크기: 47% 너비 (gap 고려)
  - 배경: 흰색
  - 패딩: 24px
  - 모서리: 24px
  - 그림자: shadow-toss-sm

**내부 구조**:
```
┌──────────────┐
│   [아이콘]   │ ← 56x56px 원형, 색상 배경
│   병원 찾기  │ ← 16px, bold
│ 내 주변 동물병원 │ ← 13px, medium, gray
└──────────────┘
```

**서비스 목록**:
1. 병원 찾기 (초록: #d1fae5/#10b981)
2. 예약 내역 (파랑: #dbeafe/#3b82f6)
3. 내 반려동물 (주황: #fed7aa/#f59e0b)
4. 마이페이지 (보라: #e9d5ff/#8b5cf6)

#### 1.5 최근 활동 리스트
- **제목**: "최근 활동" + "전체보기 ›" (우측)
- **카드**: 흰색 배경, 24px 라운드, 24px 패딩
- **각 아이템**:
  ```
  [아이콘] 서울 동물 메디컬 센터        55,000원
  40x40   10월 24일 14:00 · 결제완료
  ```
- **구분선**: 연한 회색 (#f9fafb)
- **더보기 버튼**: 회색 배경 (#f9fafb), 12px 라운드

#### 1.6 보험 배너
- **배경**: 흰색 카드
- **레이아웃**: 좌측 텍스트 + 우측 이미지
- **내용**:
  ```
  보험료 조회 ← 12px, bold, 파랑
  우리집 강아지 보험료
  얼마나 나올까요? ← 18px, bold
  ```
- **우측**: 64x64px 원형, 회색 배경, 아이콘

#### 1.7 하단 네비게이션
- **높이**: 73px
- **모서리**: 상단 30px 라운드
- **그림자**: 상단 방향 (0px -2px 8px rgba(99,99,99,0.15))
- **간격**: 탭 간 30px

**탭 구조**:
```
[아이콘]     ← 16-18px
  홈         ← 12px, BM JUA
```

**탭 목록**:
1. 홈 (Home)
2. 병원 (Hospital)
3. 보험 (Insurance)
4. 예약 (Reservation)
5. 프로필 (Profile)

---

## 🔍 2. 병원 검색 화면

### 레이아웃 구조
```
┌─────────────────────────────────┐
│  상단바                          │
├─────────────────────────────────┤
│  검색박스 (358x48px)             │ ← 검색 아이콘
│                                  │
│  예약탭 (응급실 / 동물 병원)    │ ← 146x36px
│                                  │
│  병원 카드 리스트                │
│  ├─ 이미지 (115x95px)           │
│  └─ 정보 영역 (225x95px)        │
│     ├─ 병원명 + 거리             │
│     ├─ 평점 + 리뷰수             │
│     └─ 태그 (#개, #고양이...)    │
│                                  │
├─────────────────────────────────┤
│  하단 네비게이션                 │
└─────────────────────────────────┘
```

### 컴포넌트 상세

#### 2.1 검색박스
- **크기**: 358x48px
- **마진**: 16px
- **내부**:
  - 텍스트: "내 반려동물의 적당 수면량은 얼마일까?" (14px)
  - 우측 아이콘: 검색 (24x24px)

#### 2.2 병원 카드
- **크기**: 358x95px
- **구조**:
  ```
  ┌─────────┬─────────────────────┐
  │         │ 병원명 (16px, bold) │
  │  이미지 │ ⭐ 4.8 (리뷰 123)   │
  │ 115x95  │ #개 #고양이 #파충류 │
  └─────────┴─────────────────────┘
  ```
- **간격**: 이미지-정보 17px

---

## 🎨 디자인 시스템

### 색상 팔레트
```yaml
Primary:
  - Toss Blue: #3182F6
  - Toss Blue Mid: #2264E6
  - Toss Blue Deep: #0B46C3

Background:
  - App BG: #F2F4F6
  - Card: #FFFFFF
  - Gray 50: #f9fafb
  - Gray 100: #f3f4f6

Text:
  - Primary: #111827 (검은색에 가까움)
  - Secondary: #6b7280 (중간 회색)
  - Tertiary: #9ca3af (연한 회색)

Service Icons:
  - 병원: bg #d1fae5, icon #10b981
  - 예약: bg #dbeafe, icon #3b82f6
  - 반려동물: bg #fed7aa, icon #f59e0b
  - 프로필: bg #e9d5ff, icon #8b5cf6
```

### 타이포그래피
```yaml
폰트: BM JUA (Figma) / Noto Sans KR (레퍼런스)

Heading 1:
  - Size: 28px
  - Weight: 800 (Extrabold)
  - Letter Spacing: -0.5px

Heading 2:
  - Size: 20px
  - Weight: 700 (Bold)

Body:
  - Size: 16px
  - Weight: 600 (Semibold)

Caption:
  - Size: 12-13px
  - Weight: 500-700
```

### 간격 시스템
```yaml
주요 간격:
  - 3px: 아이콘-텍스트
  - 12px: xs
  - 16px: sm (기본 마진)
  - 20px: md
  - 24px: lg (카드 패딩, 섹션)
  - 32px: xl (섹션 간)

Border Radius:
  - 12px: sm (버튼)
  - 16px: md (배지)
  - 20px: lg (카드)
  - 24px: xl (메인 카드)
  - 26px: 2xl (AI 배너)
  - 30px: 3xl (하단바)
```

### 그림자
```yaml
Subtle (카드):
  - offset: [0, 2]
  - opacity: 0.05
  - radius: 8
  - elevation: 2

Medium (버튼):
  - offset: [0, 4]
  - opacity: 0.1
  - radius: 12
  - elevation: 4

Strong (AI 배너):
  - offset: [0, 15]
  - color: rgba(0,100,255,0.5)
  - radius: 40
  - elevation: 8
```

---

## 🎬 애니메이션 & 인터랙션

### 진입 애니메이션
```yaml
Staggered Fade-in:
  - Header: 100ms delay
  - AI Banner: 150ms delay
  - Services: 250ms + 50ms each
  - Activity: 400ms delay
  - Insurance: 500ms delay

Type: FadeInDown/FadeInUp + springify()
```

### 터치 인터랙션
```yaml
카드 터치:
  - Press: scale(0.97)
  - Release: scale(1.0)
  - Duration: 300ms
  - Easing: Spring (damping: 12-15)

버튼 터치:
  - Press: scale(0.95)
  - Release: scale(1.0)
  - Background: opacity change
```

### 리프레시 버튼
```yaml
Idle: rotate(0deg)
Refreshing: rotate(180deg) + spin
Transition: Spring animation
```

---

## 📊 컴포넌트 인벤토리

### 재사용 컴포넌트

#### Card
- **변형**: Default, Gradient, Glass
- **크기**: Flexible
- **속성**: onPress, variant, style

#### Button
- **변형**: Primary, Secondary, Kakao, Naver, Apple
- **상태**: Normal, Loading, Disabled
- **속성**: title, onPress, variant, icon, loading

#### Badge
- **타입**: Glass (blur), Solid
- **크기**: Auto (패딩 기반)
- **속성**: label, icon

#### IconCircle
- **크기**: 40px, 56px, 64px
- **배경**: 서비스별 색상
- **사용처**: Service Card, Activity Item

### 화면별 컴포넌트

#### HomeScreen
- Header (인사말 + 알림)
- AiHealthTip (AI 배너)
- ServiceCard (서비스 그리드 아이템)
- ActivityItem (활동 리스트 아이템)
- InsuranceBanner (보험 배너)

#### HospitalSearch
- SearchBox
- FilterTabs
- HospitalCard

---

## 🔄 화면 전환 플로우

```
홈
├─→ 병원 찾기 → 병원 검색
│              └─→ 병원 상세 → 예약
├─→ 예약 내역 → 예약 목록
├─→ 내 반려동물 → 반려동물 프로필
└─→ 마이페이지 → 프로필 설정

하단 네비게이션:
├─ 홈
├─ 병원
├─ 보험
├─ 예약
└─ 프로필
```

---

## ✅ UX 원칙

### Toss 스타일 특징
1. **미니멀리즘**: 불필요한 요소 제거, 핵심 정보에 집중
2. **일관성**: 모든 카드 24px 라운드, 동일한 간격 시스템
3. **부드러움**: 모든 인터랙션에 Spring 애니메이션
4. **계층**: 명확한 시각적 계층 (색상, 크기, 간격)
5. **접근성**: 충분한 터치 영역 (최소 44px), 명확한 대비

### 모바일 최적화
1. **터치 영역**: 최소 44x44px (Apple HIG)
2. **스크롤**: 부드러운 스크롤, 고무줄 효과
3. **안전 영역**: 노치/홈 인디케이터 대응
4. **성능**: 60fps 유지, 최소 리렌더링

---

## 📋 구현 체크리스트

### 화면 구현 상태
- [x] 홈 화면 (기본 구조 완료)
- [ ] 병원 검색
- [ ] 병원 상세
- [ ] 예약
- [ ] 내 반려동물
- [ ] 프로필

### 컴포넌트 구현 상태
- [x] Card (기본)
- [x] Button (기본)
- [ ] AiHealthTip (고도화 필요)
- [ ] SearchBox
- [ ] HospitalCard
- [ ] Badge
- [ ] IconCircle (표준화 필요)

### 디자인 시스템
- [ ] Tailwind Config (Toss 토큰)
- [ ] 디자인 토큰 상수
- [ ] 애니메이션 프리셋
- [ ] 컴포넌트 스토리북

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-12-31
**작성자**: Claude (SuperClaude Framework)
