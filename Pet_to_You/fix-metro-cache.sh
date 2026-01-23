#!/bin/bash

echo "🔄 Fixing Metro Cache Issue..."

# 1. Stop all Expo processes
echo "1/5 Stopping Expo processes..."
pkill -f "expo start"
sleep 2

# 2. Delete all caches
echo "2/5 Deleting caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/.expo

# 3. Uninstall app from simulator
echo "3/5 Uninstalling app from simulator..."
xcrun simctl uninstall booted host.exp.Exponent 2>/dev/null || true
xcrun simctl uninstall booted com.anonymous.pet-to-you-mobile 2>/dev/null || true

# 4. Clear Metro bundler cache
echo "4/5 Clearing Metro bundler..."
watchman watch-del-all 2>/dev/null || true

# 5. Restart Expo
echo "5/5 Starting Expo..."
echo ""
echo "✅ Cache cleared! Now starting Expo..."
echo "👉 Press 'i' in the terminal to install on iOS simulator"
echo ""

pnpm start --clear
