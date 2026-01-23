# Pet to You - 디자인 시스템

> 일관성 있는 사용자 경험을 위한 디자인 가이드라인

**버전**: v1.0.0
**최종 업데이트**: 2025-12-29

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [색상 시스템](#2-색상-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [스페이싱 & 레이아웃](#4-스페이싱--레이아웃)
5. [컴포넌트](#5-컴포넌트)
6. [아이콘](#6-아이콘)
7. [애니메이션](#7-애니메이션)

---

## 1. 디자인 원칙

### 1.1 핵심 원칙

1. **명확성 (Clarity)**
   - 사용자가 무엇을 해야 하는지 명확하게 전달
   - 복잡한 절차를 단순화
   - 명확한 피드백 제공

2. **일관성 (Consistency)**
   - 모든 화면에서 동일한 패턴 사용
   - 예측 가능한 사용자 경험
   - 통일된 시각적 언어

3. **접근성 (Accessibility)**
   - 큰 터치 영역 (최소 44x44px)
   - 충분한 색상 대비 (WCAG AA 기준)
   - 명확한 라벨 및 아이콘

4. **효율성 (Efficiency)**
   - 최소 탭으로 목표 달성
   - 빠른 로딩 및 응답
   - 스마트 기본값 제공

---

## 2. 색상 시스템

### 2.1 Primary Colors

**브랜드 컬러**:
```css
--primary-yellow: #F8E318;    /* 메인 브랜드 컬러 */
--primary-black: #1C1B1F;     /* 텍스트, 아이콘 */
--primary-white: #FFFFFF;     /* 배경 */
```

**사용 가이드**:
- `primary-yellow`: CTA 버튼, 활성 상태, 브랜드 요소
- `primary-black`: 본문 텍스트, 아이콘, 테두리
- `primary-white`: 배경, 카드

---

### 2.2 Secondary Colors

**소셜 로그인 컬러**:
```css
--kakao-yellow: #F8E318;      /* 카카오톡 */
--naver-green: #1DC800;       /* 네이버 */
--apple-black: #000000;       /* Apple */
```

---

### 2.3 Neutral Colors

**회색 팔레트**:
```css
--gray-50: #F9FAFB;    /* 배경 (밝음) */
--gray-100: #F3F4F6;   /* 배경 (중간) */
--gray-300: #D1D5DB;   /* 테두리 */
--gray-400: #9CA3AF;   /* Placeholder, 비활성 텍스트 */
--gray-600: #4B5563;   /* 보조 텍스트 */
--gray-900: #111827;   /* 진한 텍스트 */
```

---

### 2.4 Semantic Colors

**상태 컬러**:
```css
--success: #10B981;    /* 성공, 완료 */
--error: #EF4444;      /* 에러, 취소, 경고 */
--warning: #F59E0B;    /* 주의 */
--info: #3B82F6;       /* 정보 */
```

**사용 예시**:
- 성공: 예약 완료, 저장 완료
- 에러: 로그인 실패, 예약 취소
- 경고: 노쇼 경고, 취소 제한
- 정보: 안내 메시지, 툴팁

---

### 2.5 색상 접근성

**대비율 (Contrast Ratio)**:
- AA 기준 (WCAG 2.1): 4.5:1 이상
- AAA 기준: 7:1 이상

**검증**:
| 조합 | 대비율 | 기준 | 통과 |
|------|--------|------|------|
| Black on White | 21:1 | AAA | ✅ |
| Gray-600 on White | 7.3:1 | AAA | ✅ |
| Gray-400 on White | 4.6:1 | AA | ✅ |
| Yellow on White | 1.9:1 | - | ❌ (텍스트 불가) |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

**Primary Font**: BM JUA TTF (배달의민족 주아체)
- 한글 전용 폰트
- 친근하고 부드러운 느낌
- 브랜드 정체성 강화

**Fallback**:
```css
font-family: 'BM_JUA_TTF', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

---

### 3.2 폰트 스케일

| 스타일 | 크기 | Line Height | Weight | 사용처 |
|--------|------|-------------|--------|--------|
| H1 | 24px | 29px (1.2) | 400 | 화면 제목 |
| H2 | 20px | 24px (1.2) | 400 | 섹션 제목 |
| H3 | 18px | 22px (1.2) | 400 | 서브 제목 |
| Body | 16px | 24px (1.5) | 400 | 본문 텍스트 |
| Caption | 14px | 20px (1.4) | 400 | 설명 텍스트 |
| Small | 12px | 17px (1.4) | 400 | 라벨, 메타 정보 |

---

### 3.3 텍스트 스타일

**코드 예시**:
```jsx
// H1 - 화면 제목
<Text style={{fontSize: 24, lineHeight: 29, color: '#1C1B1F'}}>
  Pet to You
</Text>

// Body - 본문
<Text style={{fontSize: 16, lineHeight: 24, color: '#1C1B1F'}}>
  예약이 완료되었습니다
</Text>

// Caption - 설명
<Text style={{fontSize: 14, lineHeight: 20, color: '#4B5563'}}>
  예약 시간 10분 전에 도착해주세요
</Text>
```

---

## 4. 스페이싱 & 레이아웃

### 4.1 스페이싱 시스템 (4px 기반)

```css
--spacing-xs: 4px;     /* 작은 간격 */
--spacing-sm: 8px;     /* 요소 간 간격 */
--spacing-md: 16px;    /* 섹션 내부 간격 */
--spacing-lg: 24px;    /* 섹션 간 간격 */
--spacing-xl: 32px;    /* 화면 여백 */
--spacing-xxl: 48px;   /* 큰 여백 */
```

**사용 가이드**:
- `xs (4px)`: 아이콘-텍스트 간격
- `sm (8px)`: 라벨-입력 필드 간격
- `md (16px)`: 카드 내부 패딩
- `lg (24px)`: 섹션 간 마진
- `xl (32px)`: 화면 좌우 패딩
- `xxl (48px)`: 큰 섹션 구분

---

### 4.2 그리드 시스템

**화면 크기**: 390x844px (모바일 기준)

**안전 영역 (Safe Area)**:
- 상단: 47px (상태바)
- 하단: 34px (홈 인디케이터)
- 좌우: 16px (최소 마진)

**컨텐츠 영역**:
- 너비: 358px (390 - 16*2)
- 높이: 763px (844 - 47 - 34)

---

### 4.3 Border Radius

```css
--radius-sm: 8px;      /* 작은 카드 */
--radius-md: 16px;     /* 모달, 큰 카드 */
--radius-lg: 26px;     /* 버튼 */
--radius-full: 9999px; /* 원형 */
```

---

## 5. 컴포넌트

### 5.1 버튼 (Button)

#### Primary Button
```jsx
<Button variant="primary">
  예약하기
</Button>
```

**스타일**:
- 배경: `#F8E318` (primary-yellow)
- 텍스트: `#1C1B1F` (primary-black)
- 높이: `52px`
- 패딩: `16px 26px`
- Border Radius: `26px`
- Font Size: `16px`

**상태**:
- Default: 배경 `#F8E318`
- Pressed: 배경 `#E0D015` (10% darker)
- Disabled: 배경 `#F3F4F6`, 텍스트 `#9CA3AF`

---

#### Secondary Button
```jsx
<Button variant="secondary">
  Apple로 시작하기
</Button>
```

**스타일**:
- 배경: `#FFFFFF`
- 테두리: `1px solid #1C1B1F`
- 텍스트: `#1C1B1F`
- 높이: `52px`
- 패딩: `16px 26px`
- Border Radius: `26px`

---

#### Text Button
```jsx
<Button variant="text">
  로그인 없이 앱 둘러보기
</Button>
```

**스타일**:
- 배경: `transparent`
- 텍스트: `#9CA3AF` (gray-400)
- Underline: `1px solid #9CA3AF`
- Font Size: `16px`

---

### 5.2 입력 필드 (Input)

#### Text Input
```jsx
<TextInput
  placeholder="병원 이름을 입력하세요"
  value={value}
  onChangeText={setValue}
/>
```

**스타일**:
- 높이: `48px`
- 배경: `#FFFFFF`
- 테두리: `1px solid #D1D5DB`
- Border Radius: `24px`
- 패딩: `12px 16px`
- Font Size: `16px`

**상태**:
- Default: 테두리 `#D1D5DB`
- Focused: 테두리 `#F8E318`, 2px
- Error: 테두리 `#EF4444`
- Disabled: 배경 `#F3F4F6`

---

### 5.3 카드 (Card)

#### Hospital Card
```jsx
<HospitalCard hospital={hospitalData} />
```

**스타일**:
- 크기: `357x95px`
- 배경: `#FFFFFF`
- Border Radius: `8px`
- 그림자: `shadow-sm`
- 패딩: `12px`

**구성**:
- 이미지: `115x95px` (왼쪽)
- 정보: `225x95px` (오른쪽)
  - 병원명 (16px, bold)
  - 거리 (12px)
  - 평점 + 리뷰 수 (12px)
  - 영업시간 (12px)
  - 전문분야 (12px, 최대 3개)

---

### 5.4 모달 (Modal)

#### Bottom Sheet Modal
```jsx
<Modal type="bottomSheet">
  <Content />
</Modal>
```

**스타일**:
- 배경: `#FFFFFF`
- Border Radius: `16px 16px 0 0`
- 최대 높이: `80%`
- 드래그 핸들: 상단 중앙 표시

**애니메이션**:
- 열기: Slide Up (300ms)
- 닫기: Slide Down (200ms)

---

### 5.5 탭 (Tabs)

#### Bottom Navigation Tabs
```jsx
<BottomTabs activeTab="home" />
```

**스타일**:
- 높이: `73px`
- 배경: `#FFFFFF`
- 상단 테두리: `1px solid #E5E7EB`

**탭 아이템**:
- 아이콘: `24x24px`
- 라벨: `12px`
- 간격: `vertical 8px`

**상태**:
- Active: 아이콘 & 텍스트 `#F8E318`
- Inactive: 아이콘 & 텍스트 `#9CA3AF`

---

### 5.6 필터 칩 (Filter Chip)

```jsx
<FilterChip
  label="진료시간"
  isActive={true}
  count={2}
/>
```

**스타일**:
- 높이: `36px`
- 패딩: `8px 16px`
- Border Radius: `18px`
- Font Size: `14px`

**상태**:
- Active: 배경 `#F8E318`, 텍스트 `#1C1B1F`
- Inactive: 배경 `#FFFFFF`, 테두리 `#D1D5DB`, 텍스트 `#4B5563`

---

## 6. 아이콘

### 6.1 아이콘 크기

```css
--icon-sm: 16px;    /* Small icons */
--icon-md: 24px;    /* Default icons */
--icon-lg: 32px;    /* Large icons */
```

---

### 6.2 아이콘 세트

**탭 바 아이콘**:
- `home`: 홈 (집 모양)
- `calendar`: 예약 (달력)
- `hospital`: 병원 (십자가)
- `heart-pulse`: 건강수첩 (심전도)
- `person`: 마이페이지 (사람)

**기능 아이콘**:
- `search`: 검색 (돋보기)
- `notification`: 알림 (벨)
- `filter`: 필터 (깔때기)
- `location`: 위치 (핀)
- `time`: 시간 (시계)
- `star`: 별점 (별)
- `chevron-right`: 다음 (화살표)
- `close`: 닫기 (X)
- `check`: 확인 (체크)

---

### 6.3 아이콘 스타일

**Line Style**: 2px stroke
**Fill**: Outlined (기본), Filled (활성 상태)

**색상 가이드**:
- Active: `#F8E318`
- Inactive: `#9CA3AF`
- On Primary: `#1C1B1F`
- On White: `#1C1B1F`

---

## 7. 애니메이션

### 7.1 트랜지션 타이밍

```css
--timing-fast: 150ms;     /* 빠른 피드백 */
--timing-normal: 300ms;   /* 화면 전환 */
--timing-slow: 500ms;     /* 복잡한 애니메이션 */
```

**Easing Functions**:
- `ease-out`: 화면 진입 (cubic-bezier(0, 0, 0.2, 1))
- `ease-in`: 화면 퇴장 (cubic-bezier(0.4, 0, 1, 1))
- `ease-in-out`: 모달, 드로어 (cubic-bezier(0.4, 0, 0.2, 1))

---

### 7.2 애니메이션 패턴

**화면 전환**:
- 앞으로: Slide from Right (300ms, ease-out)
- 뒤로: Slide from Left (300ms, ease-out)

**모달**:
- 열기: Fade In + Scale (200ms, ease-out)
- 닫기: Fade Out (150ms, ease-in)

**버튼 피드백**:
- Press: Scale 0.95 (100ms)
- Release: Scale 1.0 (100ms)

**리스트 아이템**:
- 등장: Fade In (200ms, stagger 50ms)

---

### 7.3 로딩 애니메이션

**Spinner**:
- 크기: `32px`
- 색상: `#F8E318`
- 회전: `1000ms linear infinite`

**Skeleton UI**:
- 배경: `#F3F4F6`
- 애니메이션: Shimmer (1500ms)

---

## 8. 반응형 가이드

### 8.1 화면 크기

**기준 크기**:
- 디자인: `390x844px` (iPhone 12/13/14 기준)
- 최소 지원: `320px` (iPhone SE)
- 최대: `428px` (iPhone Pro Max)

**Breakpoints**:
```css
--screen-sm: 320px;   /* iPhone SE */
--screen-md: 390px;   /* iPhone 12/13/14 */
--screen-lg: 428px;   /* iPhone Pro Max */
```

---

### 8.2 터치 영역

**최소 터치 영역**: `44x44px` (Apple HIG 기준)

**권장 사이즈**:
- 버튼: `52px` 높이
- 아이콘 버튼: `44x44px`
- 리스트 아이템: `48px` 이상

---

## 9. 그림자 (Shadow)

### 9.1 그림자 스케일

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

**사용 가이드**:
- `shadow-sm`: 카드, 입력 필드
- `shadow-md`: 버튼 (pressed)
- `shadow-lg`: 모달
- `shadow-xl`: 드롭다운, 팝오버

---

## 10. 구현 가이드

### 10.1 React Native Paper 테마

```javascript
import { MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F8E318',
    secondary: '#1C1B1F',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    error: '#EF4444',
    onPrimary: '#1C1B1F',
    onSecondary: '#FFFFFF',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: {
      fontFamily: 'BM_JUA_TTF',
    },
  },
};
```

---

### 10.2 스타일 상수

```typescript
// /src/constants/colors.ts
export const Colors = {
  primary: {
    yellow: '#F8E318',
    black: '#1C1B1F',
    white: '#FFFFFF',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    300: '#D1D5DB',
    400: '#9CA3AF',
    600: '#4B5563',
    900: '#111827',
  },
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

// /src/constants/spacing.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// /src/constants/typography.ts
export const Typography = {
  h1: {
    fontSize: 24,
    lineHeight: 29,
  },
  h2: {
    fontSize: 20,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
  },
};
```

---

## 11. 접근성 (Accessibility)

### 11.1 색상 대비

**WCAG 2.1 AA 준수**:
- 본문 텍스트: 4.5:1 이상
- 큰 텍스트 (18px+): 3:1 이상
- UI 컴포넌트: 3:1 이상

---

### 11.2 터치 타겟

**최소 크기**: `44x44px`
**권장 간격**: `8px` 이상

---

### 11.3 Screen Reader 지원

**Accessibility Labels**:
```jsx
<Button
  accessibilityLabel="카카오톡으로 로그인"
  accessibilityHint="카카오톡 계정으로 빠르게 로그인합니다"
>
  카카오톡으로 시작하기
</Button>
```

---

*Last updated: 2025-12-29*
