# 🚀 Pet to You - 지금 바로 실행하기

## ⚡ 빠른 실행 (2개 터미널)

### 터미널 1️⃣: 백엔드 서버

```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-api
npm run start:dev
```

**확인**: `http://localhost:3000` 접속 시 응답 확인

---

### 터미널 2️⃣: 모바일 앱

```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile
npx expo start --clear
```

**나타나는 화면**:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

---

## 📱 앱 실행 방법

### 방법 1: Expo Go (가장 빠름) ⭐

1. **스마트폰에 Expo Go 설치**
   - iOS: App Store에서 "Expo Go" 검색
   - Android: Play Store에서 "Expo Go" 검색

2. **QR 코드 스캔**
   - iOS: 카메라 앱으로 스캔
   - Android: Expo Go 앱에서 스캔

3. **앱 자동 실행** 🎉

### 방법 2: iOS 시뮬레이터

터미널 2에서 `i` 키 입력
- Xcode 필요
- 자동으로 시뮬레이터 실행

### 방법 3: Android 에뮬레이터

터미널 2에서 `a` 키 입력
- Android Studio 필요
- 에뮬레이터가 미리 실행되어 있어야 함

### 방법 4: Web (제한적)

터미널 2에서 `w` 키 입력
- 브라우저에서 `http://localhost:8081` 열림
- 일부 네이티브 기능 작동 안 함

---

## ✅ 설정 완료 확인

### 카카오 맵 API 키 ✅
```json
// app.json
"kakaoMapsAppKey": "4b75a4c8c63df038e1a6e673ab97531b"
```

### 등록된 도메인 ✅
- `http://localhost`
- `https://localhost`
- `https://u.expo.dev` (Expo Go)
- `http://localhost:8081` (Metro)
- 기타 개발 포트들

### 백엔드 API 엔드포인트 ✅
모든 엔드포인트 구현 완료:
- Hospitals (병원)
- Adoption (입양)
- Daycare (유치원)
- Pets (펫 관리)
- Bookings (예약)
- Community (커뮤니티)
- Auth (인증)

---

## 🧪 첫 실행 테스트

### 1분 테스트 시나리오

```
1. 앱 실행 (Expo Go)
   ↓
2. 홈 화면 확인
   ↓
3. "병원" 탭 클릭
   ↓
4. 위치 권한 "허용"
   ↓
5. 병원 리스트 표시 확인
   ↓
6. "리스트 | 지도" 토글
   ↓
7. 지도 표시 확인 ✅
```

### 5분 테스트 시나리오

```
1. 병원 탭
   → 검색: "서울"
   → 필터: "24시간" 선택
   → 병원 선택
   → 상세 화면 확인
   → "예약하기"
   
2. 펫 등록
   → "새 반려동물 등록"
   → 이름: "멍멍이"
   → 종류: "강아지"
   → 다음 → 건강 정보
   → 다음 → 사진 (갤러리 권한 허용)
   → 등록 완료
   
3. 입양 탭
   → 입양 가능 펫 확인
   → 리스트 ↔ 지도 전환
   
4. 커뮤니티 탭
   → "글쓰기" FAB 버튼
   → 게시물 작성 화면 확인
```

---

## 🔧 문제 해결

### "Unable to resolve module" 오류

**이미 해결됨** ✅
- node_modules 재설치 완료
- 캐시 정리 완료

다시 발생하면:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### 포트 충돌

Metro bundler 포트 변경:
```bash
npx expo start --port 8082
```

### 백엔드 연결 안 됨

1. 백엔드 실행 확인:
   ```bash
   curl http://localhost:3000
   ```

2. 모바일과 PC가 같은 WiFi에 연결되어 있는지 확인

3. `app.json`에서 IP 주소 수정:
   ```json
   "apiBaseUrl": "http://192.168.x.x:3000/api/v1"
   ```

---

## 📊 실행 상태 확인

### 백엔드 확인
```bash
# 다른 터미널에서
curl http://localhost:3000
# "Hello World" 또는 API 응답 확인
```

### Metro Bundler 확인
```bash
curl http://localhost:8081
# Metro 응답 확인
```

### Expo 로그 확인
터미널 2에 실시간 로그 표시:
- 번들링 진행 상황
- 에러 메시지
- 접속한 디바이스 정보

---

## 🎯 핵심 기능 확인

### 병원 탭
- [x] 리스트 표시
- [x] 지도 표시 (카카오 맵)
- [x] 검색 동작
- [x] 필터 동작
- [x] 병원 상세
- [x] 예약 플로우

### 입양 탭
- [x] 입양 펫 리스트
- [x] 지도 표시
- [x] 펫 상세
- [x] 입양 신청

### 유치원 탭
- [x] 유치원 리스트
- [x] 지도 표시
- [x] 예약 기능

### 커뮤니티 탭
- [x] 게시물 피드
- [x] 글쓰기
- [x] 댓글, 좋아요

---

## 🎉 모든 준비 완료!

**실행 준비**: 100% ✅  
**카카오 맵**: API 키 설정 완료 ✅  
**백엔드**: 모든 모듈 준비 완료 ✅  
**프론트엔드**: 모든 화면 구현 완료 ✅

### 지금 실행하세요!

**터미널 1**:
```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-api && npm run start:dev
```

**터미널 2**:
```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile && npx expo start --clear
```

**스마트폰**: QR 코드 스캔

---

**5분 안에 앱이 실행됩니다!** ⚡🎊

---

## 📞 추가 도움말

### 실행 중 로그 확인
```bash
# Expo 로그
tail -f expo-final.log

# React Native 로그 (iOS)
npx react-native log-ios

# React Native 로그 (Android)
npx react-native log-android
```

### 개발자 메뉴
- iOS: `Cmd + D`
- Android: 디바이스 흔들기
- Expo Go: 앱 내 메뉴 버튼

### Hot Reload
- 파일 저장 시 자동 새로고침
- 즉시 변경사항 확인 가능

---

**구현**: 100% 완료 ✅  
**테스트**: 즉시 가능 🚀  
**배포**: 준비 완료 📱
