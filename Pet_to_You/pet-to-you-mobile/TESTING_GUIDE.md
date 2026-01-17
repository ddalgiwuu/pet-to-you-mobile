# Pet to You Mobile - Comprehensive Testing Guide

**Last Updated:** January 17, 2026
**Project:** /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Fix TypeScript Errors](#fix-typescript-errors)
4. [Running on iOS Simulator](#running-on-ios-simulator)
5. [Running on Android Emulator](#running-on-android-emulator)
6. [Testing on Physical Device](#testing-on-physical-device)
7. [Testing Animations](#testing-animations)
8. [Testing API Integration](#testing-api-integration)
9. [Debugging Guide](#debugging-guide)
10. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

### Required Software

```bash
# Node.js (v18 or later)
node --version  # Should show v18.x or later

# npm or yarn
npm --version   # Should show v9.x or later

# Expo CLI
npm install -g expo-cli

# iOS Development (macOS only)
xcode-select --install  # Install Xcode Command Line Tools
```

### Platform-Specific Requirements

#### macOS (for iOS)
- **Xcode 15+** from Mac App Store
- **iOS Simulator** (comes with Xcode)
- **Rosetta 2** (for Apple Silicon): `softwareupdate --install-rosetta`

#### Windows/Linux (for Android)
- **Android Studio** with Android SDK
- **Android Emulator** configured
- **Java Development Kit (JDK) 17+**

#### Both Platforms
- **Expo Go** app on physical device (optional)

---

## Environment Setup

### 1. Install Dependencies

```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile

# Install all packages
npm install

# Verify installation
npm list --depth=0
```

### 2. Verify Expo Configuration

```bash
# Check Expo doctor for issues
npx expo-doctor

# Should show:
# ✅ expo dependencies
# ✅ recommended dependencies
# ✅ global prerequisites
```

### 3. Environment Variables (Optional)

Create `.env` file for API configuration:

```bash
# .env
API_BASE_URL=http://localhost:3000/api/v1
ENABLE_MOCK_API=true
```

---

## Fix TypeScript Errors

**CRITICAL:** You must fix these errors before the app will run.

### Quick Fix Script

Run these fixes in order:

#### 1. Fix Badge Component Usage (7 errors)

**File:** `app/(tabs)/hospitals.tsx`

```typescript
// Line 70 - Change:
<Badge text="Open" variant="success" />

// To:
<Badge label="Open" variant="success" />

// Line 75 - Change each service badge:
{hospital.services.map((service) => (
  <Badge key={service} text={service} variant="secondary" />
))}

// To:
{hospital.services.map((service) => (
  <Badge key={service} label={service} variant="secondary" />
))}
```

**File:** `app/(tabs)/pets/[id].tsx`

```typescript
// Line 66 - Change:
<Badge text="Up to date" variant="success" />

// To:
<Badge label="Up to date" variant="success" />
```

#### 2. Fix Input Component Usage (1 error)

**File:** `app/(tabs)/hospitals.tsx`

```typescript
// Line 29 - Change:
<Input
  value={search}
  onChangeText={setSearch}
  placeholder="Search hospitals..."
/>

// To:
<Input
  label="Search Hospitals"
  value={search}
  onChangeText={setSearch}
  placeholder="Search hospitals..."
/>
```

#### 3. Fix ProgressBar Usage (1 error)

**File:** `app/booking/[hospitalId].tsx`

```typescript
// Line 115 - Change:
<ProgressBar current={step} total={3} />

// To:
<ProgressBar progress={step / 3} />
```

#### 4. Fix Modal Component (5 errors)

**File:** `components/ui/Modal.tsx`

```typescript
// Line 21 - Change import:
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  // Remove: useAnimatedGestureHandler,
} from 'react-native-reanimated';

// Add gesture handler import:
import { Gesture } from 'react-native-gesture-handler';

// Lines 92-102 - Replace gestureHandler with:
const panGesture = Gesture.Pan()
  .onStart(() => {
    'worklet';
  })
  .onUpdate((event) => {
    'worklet';
    translateY.value = Math.max(0, event.translationY);
  })
  .onEnd((event) => {
    'worklet';
    if (event.translationY > 100 || event.velocityY > 1000) {
      runOnJS(onClose)();
    } else {
      translateY.value = withSpring(0);
    }
  });

// Update JSX (around line 150):
<GestureDetector gesture={panGesture}>
  <Animated.View style={[styles.modalContent, animatedStyle]}>
    {/* ... */}
  </Animated.View>
</GestureDetector>
```

#### 5. Fix AnimatedCounter Import (1 error)

**File:** `components/animations/AnimatedCounter.tsx`

```typescript
// Line 1 - Update import:
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,  // Add this
} from 'react-native-reanimated';
```

#### 6. Fix LinearGradient Types (4 errors)

**File:** `constants/theme.ts`

```typescript
// Lines 19-23 - Change:
export const colors = {
  // ...
  gradients: {
    primary: ['#FF6B9D', '#FF8FAB'],
    card: ['#FFFFFF', '#F8F9FA'],
    glow: ['rgba(255,107,157,0.3)', 'transparent'],
  },
} as const;

// To:
export const colors = {
  // ...
  gradients: {
    primary: ['#FF6B9D', '#FF8FAB'] as string[],
    card: ['#FFFFFF', '#F8F9FA'] as string[],
    glow: ['rgba(255,107,157,0.3)', 'transparent'] as string[],
  },
} as const;
```

#### 7. Fix Shadow Opacity Types (2 errors)

**File:** `components/ui/Button.tsx`

```typescript
// Line 67 - Change:
shadowOpacity.value = withTiming(shadows.small.shadowOpacity, {

// To:
shadowOpacity.value = withTiming(0.1, {
```

**File:** `components/ui/Card.tsx`

```typescript
// Line 51 - Change:
elevation.value = withSpring(shadows.large.elevation);

// To:
elevation.value = withSpring(8);
```

#### 8. Remove Unused Files

```bash
# Remove App.tsx (not used with Expo Router)
rm App.tsx

# Update index.ts
cat > index.ts << 'EOF'
import 'expo-router/entry';
EOF
```

### Verify Fixes

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Should show no errors
```

---

## Running on iOS Simulator

### 1. Start Expo Dev Server

```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile

# Start Expo
npx expo start --ios
```

### 2. Select iOS Simulator

The Expo CLI will:
1. Build the app
2. Launch iOS Simulator automatically
3. Install the app
4. Open with Expo Go or standalone

**Expected Output:**
```
✅ Using Expo Go
✅ Opening on iOS Simulator
✅ Metro waiting on exp://192.168.1.100:8081
```

### 3. Alternative: Manual Launch

```bash
# List available simulators
xcrun simctl list devices

# Start specific simulator
open -a Simulator

# In Expo terminal, press 'i' to open iOS
```

### 4. Test Device Sizes

Test on multiple simulator sizes:

```bash
# iPhone 15 Pro
# iPhone 15 Pro Max
# iPhone SE (3rd gen)
# iPad Pro (12.9-inch)
```

---

## Running on Android Emulator

### 1. Setup Android Emulator

```bash
# Open Android Studio
# Tools → AVD Manager
# Create Virtual Device:
#   - Pixel 7 Pro (or latest)
#   - System Image: Android 13+ (API 33+)
#   - Graphics: Hardware
```

### 2. Start Emulator

```bash
# From Android Studio AVD Manager
# Click ▶️ on your emulator

# OR from command line:
emulator -avd Pixel_7_Pro_API_33
```

### 3. Run on Android

```bash
cd /Users/ryansong/Desktop/DEV/Pet_to_You/pet-to-you-mobile

# Start Expo with Android
npx expo start --android
```

**Expected Output:**
```
✅ Using Expo Go
✅ Opening on Android emulator
✅ Installing APK
```

### 4. Test Device Configurations

Test on:
- **Pixel 7 Pro** (large screen)
- **Pixel 5** (standard)
- **Tablet** (10-inch)

---

## Testing on Physical Device

### Method 1: Expo Go App (Easiest)

#### iOS Device

```bash
# 1. Install Expo Go from App Store
# 2. Ensure device and computer on same WiFi
# 3. Start Expo:
npx expo start

# 4. Scan QR code with Camera app
# 5. Opens in Expo Go automatically
```

#### Android Device

```bash
# 1. Install Expo Go from Google Play
# 2. Ensure device and computer on same WiFi
# 3. Start Expo:
npx expo start

# 4. In Expo Go, tap "Scan QR code"
# 5. Scan code from terminal
```

### Method 2: Development Build

For features not supported in Expo Go (like custom native modules):

```bash
# iOS
npx expo run:ios --device

# Android
npx expo run:android --device
```

### Testing Checklist for Physical Device

- [ ] Touch gestures work smoothly
- [ ] Haptic feedback triggers correctly
- [ ] Camera permissions work (if implemented)
- [ ] Location services work
- [ ] Push notifications work (if implemented)
- [ ] Network requests succeed
- [ ] Offline mode handles gracefully

---

## Testing Animations

### Animation Components to Test

#### 1. Splash Screen Animation

**Location:** `app/index.tsx`

**Test:**
1. Fresh app launch
2. Observe:
   - Logo fade-in and scale
   - Pet rotation (360°)
   - Smooth transition to next screen
3. **Expected:** 2.5s total animation time

**Timing:**
- Logo appears: 200ms delay
- Pet rotates: 0-2000ms
- Navigation: 2500ms

#### 2. SpringButton Component

**Location:** `components/animations/SpringButton.tsx`

**Test:**
```typescript
// In any screen, add:
import { SpringButton } from '@/components/animations';

<SpringButton onPress={() => console.log('Pressed')}>
  <View style={styles.testButton}>
    <Text>Test Spring</Text>
  </View>
</SpringButton>
```

**Expected Behavior:**
- Press: Scales to 0.96 with spring physics
- Release: Bounces back to 1.0 with overshoot
- Haptic feedback triggers

#### 3. FloatingCard Component

**Location:** `components/animations/FloatingCard.tsx`

**Test:**
```typescript
import { FloatingCard } from '@/components/animations';

<FloatingCard>
  <Text>Floating Content</Text>
</FloatingCard>
```

**Expected Behavior:**
- Gentle floating animation
- 3D transform effects
- Smooth rotation and translation

#### 4. AnimatedCounter

**Location:** `components/animations/AnimatedCounter.tsx`

**Test:**
```typescript
import { AnimatedCounter } from '@/components/animations';

const [count, setCount] = useState(0);

<AnimatedCounter from={0} to={count} duration={1000} />
<Button title="+10" onPress={() => setCount(count + 10)} />
```

**Expected Behavior:**
- Smooth number counting animation
- Easing applied correctly
- No flashing or jumping

### Animation Performance Testing

```bash
# Enable performance monitor in app
# Press 'd' in Expo terminal
# Select "Enable Performance Monitor"
```

**Target Metrics:**
- FPS: 60 (smooth)
- JS thread: <10ms per frame
- UI thread: <16ms per frame

**Tools:**
- React Native DevTools
- Xcode Instruments (iOS)
- Android Profiler

---

## Testing API Integration

### 1. Mock API Testing (Default)

The app currently uses mock data. Test each flow:

#### Auth Flow
```typescript
// services/api.ts - Currently returns mock data

Test:
1. Login with any email/password
2. Should navigate to (tabs)
3. Check authStore has user and token
```

#### Hospitals API
```typescript
Test:
1. Navigate to Hospitals tab
2. Should show mock hospital list
3. Search should filter locally
```

### 2. Connect to Real Backend

**Setup Backend Connection:**

```typescript
// services/api.ts - Update line 8:
const API_BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Android emulator
// const API_BASE_URL = 'http://localhost:3000/api/v1'; // iOS simulator
// const API_BASE_URL = 'https://your-api.com/api/v1'; // Production
```

**Test API Endpoints:**

```bash
# Start backend server first
cd /path/to/backend
npm start

# Test connection:
curl http://localhost:3000/api/v1/health
```

**Test in App:**
1. Login screen → Enter real credentials
2. Hospitals → Should load from API
3. Pet profile → Should fetch pet data
4. Booking → Should create real booking

### 3. Network Error Handling

**Test Cases:**

```bash
# Disable WiFi on device
# Or in simulator: Disable network in Settings
```

**Expected Behavior:**
- Login: Shows "Network error" message
- API calls: Graceful error display
- Retry mechanism works
- Offline mode (if implemented)

### 4. React Query DevTools

```typescript
// Add to app/_layout.tsx for debugging:
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  {__DEV__ && <ReactQueryDevtools />}
</QueryClientProvider>
```

---

## Debugging Guide

### 1. React Native Debugger

```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# In Expo app:
# Shake device or Cmd+D (iOS) / Cmd+M (Android)
# Select "Debug Remote JS"
```

### 2. Console Logging

```typescript
// Structured logging
console.log('[Auth]', 'Login successful', { userId: user.id });
console.warn('[API]', 'Slow response', { duration: 3000 });
console.error('[Network]', 'Request failed', error);

// Performance logging
console.time('API_CALL');
await api.getHospitals();
console.timeEnd('API_CALL');
```

### 3. React DevTools

```bash
# Standalone React DevTools
npm install -g react-devtools

# Start DevTools
react-devtools

# In app, shake and select "Show React DevTools"
```

### 4. Debugging Animations

```typescript
// components/animations/SpringButton.tsx

// Add logging:
const handlePressIn = () => {
  console.log('[Animation]', 'Press started', scale.value);
  // ...
};

// Use __DEV__ flag:
if (__DEV__) {
  console.log('Animation config:', { stiffness, damping, mass });
}
```

### 5. Network Debugging

```bash
# In Expo DevTools
# Press 'd' → "Debug Remote JS"
# Network tab shows all requests

# Or use standalone tool:
npm install -g reactotron-react-native
```

**Reactotron Setup:**

```typescript
// lib/reactotron.ts (create this)
import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  Reactotron
    .configure({ name: 'Pet to You' })
    .useReactNative()
    .connect();
}

// app/_layout.tsx
import './lib/reactotron';
```

### 6. Crash Reporting

```typescript
// Add error boundary
// components/ErrorBoundary.tsx

import React from 'react';
import { View, Text, Button } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Text>Something went wrong!</Text>
          <Text>{this.state.error?.toString()}</Text>
          <Button title="Reload" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }
    return this.props.children;
  }
}
```

---

## Common Issues & Solutions

### Build Issues

#### Issue: "Unable to resolve module"

```bash
# Solution:
watchman watch-del-all
rm -rf node_modules
npm install
npx expo start --clear
```

#### Issue: "Metro bundler stuck"

```bash
# Solution:
# Kill Metro process
lsof -ti:8081 | xargs kill -9

# Restart Expo
npx expo start --clear
```

#### Issue: "iOS build fails"

```bash
# Solution:
cd ios
pod install
cd ..
npx expo run:ios
```

### Runtime Issues

#### Issue: "White screen on launch"

**Debug Steps:**
1. Check console for errors
2. Verify all imports resolve
3. Check for syntax errors in _layout.tsx
4. Clear Metro cache: `npx expo start --clear`

#### Issue: "Animations not working"

**Solutions:**
```typescript
// 1. Check Reanimated plugin in babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin', // Must be last
  ],
};

// 2. Rebuild after babel.config.js changes
npx expo start --clear
```

#### Issue: "Haptics not triggering"

**Solutions:**
- Physical device only (simulators don't support)
- Check permissions in Info.plist (iOS)
- Verify expo-haptics installed

#### Issue: "Network requests fail"

**Debug:**
```typescript
// Add request logging in services/api.ts
apiClient.interceptors.request.use(
  (config) => {
    console.log('[API]', config.method?.toUpperCase(), config.url);
    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API]', 'Success', response.status);
    return response;
  },
  (error) => {
    console.error('[API]', 'Error', error.response?.status, error.message);
    return Promise.reject(error);
  }
);
```

### Performance Issues

#### Issue: "App feels slow"

**Solutions:**
1. Check JS thread performance
2. Optimize heavy components with React.memo
3. Use FlatList for long lists
4. Implement virtualization
5. Reduce animation complexity

#### Issue: "High memory usage"

**Solutions:**
1. Check for memory leaks in useEffect
2. Cleanup listeners and timers
3. Optimize images (use expo-image)
4. Implement pagination for data

---

## Testing Checklist

### Pre-Launch Testing

#### Functional Testing
- [ ] App launches successfully
- [ ] Splash screen animation works
- [ ] Onboarding flow complete
- [ ] Login/signup work
- [ ] Tab navigation smooth
- [ ] All screens render correctly
- [ ] Back button works everywhere

#### Animation Testing
- [ ] SpringButton springs correctly
- [ ] FloatingCard floats smoothly
- [ ] Counter animates numbers
- [ ] Splash animations smooth
- [ ] No frame drops (<60fps)

#### UI Component Testing
- [ ] Buttons respond to press
- [ ] Inputs accept text
- [ ] Modals open/close
- [ ] Cards render properly
- [ ] Badges display correctly
- [ ] Progress bars animate
- [ ] Switches toggle

#### API Testing
- [ ] Login API works
- [ ] Hospital fetch works
- [ ] Pet data loads
- [ ] Booking creates
- [ ] Error handling works
- [ ] Loading states show
- [ ] Retry mechanism works

#### Platform Testing
- [ ] iOS simulator works
- [ ] Android emulator works
- [ ] iOS device works
- [ ] Android device works
- [ ] Different screen sizes
- [ ] Different OS versions

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| App Launch | <1.5s | <3s | >3s |
| Screen Transition | <200ms | <500ms | >500ms |
| API Response | <500ms | <2s | >2s |
| Animation FPS | 60fps | >50fps | <50fps |
| Memory Usage | <100MB | <200MB | >200MB |

### Monitoring Tools

```bash
# iOS Performance
# Xcode → Product → Profile → Instruments
# Select: Time Profiler, Allocations, Leaks

# Android Performance
# Android Studio → Profile App
# Select: CPU, Memory, Network
```

---

## Next Steps

1. **Fix TypeScript Errors** ← START HERE
2. **Test on iOS Simulator**
3. **Test on Android Emulator**
4. **Test Animations**
5. **Connect Real API**
6. **Test on Physical Devices**
7. **Performance Optimization**
8. **Production Build**

---

## Support & Resources

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Online playground
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Mobile app debugger

---

*Last Updated: January 17, 2026*
*For issues or questions, contact the development team*
