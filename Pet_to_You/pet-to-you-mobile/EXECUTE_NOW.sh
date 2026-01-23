#!/bin/bash

# Pet to You - 앱 실행 스크립트
# 사용법: ./EXECUTE_NOW.sh

echo "🐾 Pet to You - 앱 시작 중..."
echo ""

# 1. 기존 프로세스 정리
echo "1️⃣ 기존 프로세스 정리 중..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
lsof -ti:8081,8082,19000,19001,19002 2>/dev/null | xargs kill -9 2>/dev/null
echo "✅ 정리 완료"
echo ""

# 2. 캐시 정리
echo "2️⃣ 캐시 정리 중..."
rm -rf .expo
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null
echo "✅ 캐시 정리 완료"
echo ""

# 3. 앱 시작
echo "3️⃣ Pet to You 앱 시작..."
echo ""
echo "🎯 다음 중 하나를 선택하세요:"
echo "   - QR 코드 스캔 (Expo Go 앱)"
echo "   - 'i' 키 입력 (iOS 시뮬레이터)"
echo "   - 'a' 키 입력 (Android 에뮬레이터)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx expo start --clear

echo ""
echo "✅ 앱이 종료되었습니다"
