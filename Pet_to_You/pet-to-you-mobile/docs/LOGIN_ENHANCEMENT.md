# Pet to You Login Screen Enhancement

Modern login screen with glassmorphism design and developer mode features.

## Features Implemented

### 1. Modern Visual Design
- **LinearGradient Background**: Pink to Purple gradient (#FFB6C1 → #DDA0DD → #9370DB)
- **Glassmorphism Card**: Semi-transparent white card with blur effect
- **Shadow Effects**: Elevated card with professional depth
- **Smooth Animations**: Input focus, shake on error, logo bounce

### 2. Logo Component (`components/shared/Logo.tsx`)
- Animated pet paw emoji (🐾) with scale bounce animation
- Reusable component with size variants (small, medium, large)
- Triple-tap gesture detection for developer mode toggle
- Visual "DEV" badge when developer mode is active

### 3. Developer Mode Store (`store/devStore.ts`)
- Persistent developer mode state via AsyncStorage
- Configurable API endpoint
- Test credentials management
- Auto-load settings on app start

### 4. Developer Menu (`components/auth/DeveloperMenu.tsx`)
- **Quick Actions**:
  - 🏠 Direct navigation to home screen
  - 🔐 One-tap test account login
  - Display test credentials (test@pet-to-you.com / test1234)
- **API Configuration**:
  - Change API endpoint
  - Save configuration persistently
- **Modern UI**:
  - Bottom sheet modal with slide animation
  - Backdrop blur effect
  - Professional developer tools styling

### 5. Enhanced Login Screen (`app/(auth)/login.tsx`)
- Pet to You logo at top with tagline "반려동물을 위한 모든 것"
- Modern glassmorphism login card
- Social login buttons:
  - 카카오 (Kakao) - Yellow (#FEE500)
  - 네이버 (Naver) - Green (#03C75A)
  - Apple - Black (#000000)
- Error shake animation with haptic feedback
- Developer mode integration
- Responsive keyboard handling

## How to Use

### For Regular Users
1. Open the app
2. Enter email and password
3. Tap "로그인" button
4. Or use social login buttons (Kakao, Naver, Apple)

### For Developers
1. **Enable Developer Mode**:
   - Triple tap the Pet to You logo
   - Visual feedback: logo bounces and "DEV" badge appears
   - Haptic feedback confirms activation

2. **Access Developer Menu**:
   - When developer mode is active, "🛠️ 개발자 메뉴" button appears
   - Tap to open developer menu

3. **Developer Menu Features**:
   - **홈 화면으로 바로 가기**: Bypass login, go directly to home
   - **테스트 계정으로 로그인**: Auto-fill test credentials
   - **API 엔드포인트 변경**: Change API endpoint for testing

4. **Disable Developer Mode**:
   - Triple tap the logo again
   - "DEV" badge disappears

## Test Credentials
```
Email: test@pet-to-you.com
Password: test1234
```

## Files Created/Modified

### New Files
- `/store/devStore.ts` - Developer mode state management
- `/components/shared/Logo.tsx` - Animated logo component
- `/components/auth/DeveloperMenu.tsx` - Developer menu overlay
- `/components/shared/index.ts` - Shared components export
- `/components/auth/index.ts` - Auth components export

### Modified Files
- `/app/(auth)/login.tsx` - Enhanced with modern design and developer features
- `/constants/theme.ts` - Added border color constant

## Design Tokens Used

### Colors
- Primary: #FF6B9D (Pink)
- Background Gradient: #FFB6C1 → #DDA0DD → #9370DB
- Card: rgba(255, 255, 255, 0.95) (Glassmorphism)
- Border: #E5E7EB

### Spacing
- Container padding: spacing.lg (24px)
- Card padding: spacing.lg (24px)
- Button gaps: spacing.md (16px)

### Border Radius
- Card: borderRadius.xl (24px)
- Buttons: borderRadius.md (12px)
- Badge: borderRadius.sm (8px)

### Typography
- Tagline: heading3 (20px)
- Card Title: heading2 (24px)
- Body text: body1 (16px)

## Animation Details

### Logo Animation
- Continuous scale bounce (1.0 → 1.1 → 1.0)
- Duration: 800ms per cycle
- Easing: Cubic Bezier (0.34, 1.56, 0.64, 1)

### Triple-Tap Detection
- Scale sequence on activation: 0.8 → 1.2 → 1.0
- Spring animation with damping: 10
- Haptic feedback: Success/Warning notification

### Error Shake
- Horizontal shake sequence: -10px → 10px → -10px → 0px
- Duration: 50ms per step
- Total duration: 200ms
- Haptic feedback: Error notification

### Developer Menu
- Entry: SlideInDown with spring animation
- Exit: SlideOutDown with spring animation
- Backdrop: FadeIn/FadeOut

## Accessibility

- Proper keyboard handling with KeyboardAvoidingView
- ScrollView for small screens
- Touch targets: minimum 44x44 points
- Color contrast: WCAG AA compliant
- Haptic feedback for all interactions

## Performance

- Lazy animation initialization
- Optimized re-renders with useSharedValue
- Efficient AsyncStorage operations
- No memory leaks in timers (cleanup in useEffect)

## Next Steps

1. Implement actual OAuth2 providers:
   - Kakao SDK integration
   - Naver SDK integration
   - Apple Sign In
2. Connect to real API endpoint
3. Add biometric authentication (Face ID / Touch ID)
4. Implement "Forgot Password" flow
5. Add email validation and password strength meter
