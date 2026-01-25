# 병원 상세 페이지 - 최종 레이아웃 수정 완료

## ✅ 해결한 문제들 (2025-01-25)

### 1. **헤더 위 큰 공백**
**문제**: wrapper의 "정보/리뷰" 탭 때문에 paddingTop 120px
**해결**:
- wrapper 탭 완전 제거
- HospitalDetail이 전체 화면 사용
- 공백 사라짐

### 2. **Floating 버튼 정리**
**문제**: 영업중 배지와 공유 버튼이 Hero 위에 floating
**해결**:
- 영업중 배지: Hero floating → Header 병원명 옆 inline
- 공유 버튼: Hero floating → 하단 액션 아이콘
- 좋아요 버튼 제거 (저장, 공유만 유지)

### 3. **탭바 오른쪽 여백**
**문제**: 탭들이 왼쪽으로 몰려있고 오른쪽 여백 많음
**해결**:
- paddingHorizontal: 4px (8 → 4)
- tabButton padding: 20px (16 → 20)
- tabIndicator 위치: 20px (16 → 20)
- 더 균등한 분배

## 🎨 최종 레이아웃

```
┌─────────────────────────────┐
│  Hero Image (200px)         │  ← Clean, no floating buttons
│  + 이미지 카운터 (1/41)     │
├─────────────────────────────┤
│  병원명            [영업중] │  ← Inline badge
│  ★ 4.8 · 방문자 리뷰 23    │
│  [전화하기] [길찾기]        │
│  [  저장  |  공유  ]        │  ← 2개만, 균등 배치
├─────────────────────────────┤
│ [홈] [운영시간] [진료] [시설] [소개] │ ← Sticky
│  ━━                         │
├─────────────────────────────┤
│  📍 주소 ▼                  │
│  🚶 거리                    │
│  ⏰ 오늘 시간 ▼             │
│  📞 전화번호 [복사]         │
│  💊 진료과목...             │
│  ─────────────────────     │
│     정보 더보기 >          │
└─────────────────────────────┘
```

## 🔄 스크롤 동작 (네이버 스타일)

**Before**:
- Hero 고정 (스크롤 안 됨)
- 컨텐츠만 스크롤
- 공간 비효율

**After**:
- Hero 스크롤 가능 (아래로 내리면 사라짐)
- Header 스크롤 가능 (사라짐)
- Tabs만 상단 고정 (stickyHeaderIndices)
- 더 많은 컨텐츠 보임

## 🎯 주요 변경 사항

### app/hospital/[id].tsx
- ❌ "정보/리뷰" 탭 제거
- ❌ activeTab, reviewPage state 제거
- ❌ HospitalReviews 제거
- ❌ tabsContainer, tab styles 제거
- ✅ 단순 wrapper로 변경

### components/hospital/HospitalDetail.tsx
- ✅ 전체 ScrollView 구조
- ✅ stickyHeaderIndices={[2]} 적용
- ✅ 영업중 배지 → inline (병원명 옆)
- ✅ 공유 버튼 → 액션 아이콘 (저장 옆)
- ✅ 좋아요 제거 (저장, 공유만)
- ✅ 탭바 spacing 개선 (4px, 20px)

## 📊 개선 효과

**공간 효율**:
- 헤더 공백 120px → 0px
- Hero 위 floating 버튼 제거
- 더 많은 컨텐츠 영역

**UX 개선**:
- 자연스러운 스크롤
- 깔끔한 레이아웃
- 균등한 탭 배치
- 덜 혼란스러운 버튼 배치

**성능**:
- wrapper 탭 제거로 렌더링 감소
- 단순화된 구조

## 🧪 테스트 포인트

1. ✅ 헤더 위 공백 없음
2. ✅ 영업중 배지 병원명 옆에 inline
3. ✅ 공유 버튼 하단 액션 아이콘
4. ✅ 탭바 균등 spacing
5. ✅ 스크롤 시 Hero 사라짐
6. ✅ Tabs 상단 고정
7. ✅ 펼치기/접기 작동
8. ✅ 탭 전환 작동

## 🎨 차별화 (저작권 안전)

네이버와 다른 점:
- 색상: Pink (vs 파란색)
- 아이콘: 저장/공유 (vs 저장/거리뷰/공유)
- Typography: 다른 크기
- Spacing: 더 여유로운 padding
- 탭 구성: 홈 중심
