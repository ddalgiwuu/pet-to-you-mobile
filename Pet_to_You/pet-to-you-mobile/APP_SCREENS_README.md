# Pet to You Mobile App - Screens Documentation

Complete implementation of main app screens with Toss-style animations for the Pet to You mobile application.

## 📁 Project Structure

```
app/
├── _layout.tsx                 # Root layout with providers
├── index.tsx                   # Splash screen with 3D pet animation
├── (auth)/
│   ├── onboarding.tsx         # Onboarding carousel (3 screens)
│   ├── login.tsx              # Login with social auth
│   └── signup.tsx             # Registration form
├── (tabs)/
│   ├── _layout.tsx            # Bottom tabs navigation
│   ├── index.tsx              # Home screen with hero section
│   ├── hospitals.tsx          # Hospital search and list
│   └── pets/
│       └── [id].tsx           # Pet profile with health stats
└── booking/
    └── [hospitalId].tsx       # Multi-step booking flow

components/ui/                  # Reusable UI components
store/                          # Zustand state management
services/                       # API client configuration
types/                          # TypeScript definitions
```

## 🎨 Implemented Screens

### 1. **Splash Screen** (`app/index.tsx`)
- 3D rotating pet animation (placeholder for Spline)
- Animated logo reveal with scale and fade
- Auto-navigation based on auth state
- Duration: 2.5 seconds
- **Features**: Logo scale animation, pet rotation, gradient background

### 2. **Onboarding** (`app/(auth)/onboarding.tsx`)
- 3 swipeable carousel screens
- Animated progress dots with width interpolation
- Skip button with direct navigation
- "Get Started" CTA with bounce animation
- **Animations**: Scale, opacity interpolation, staggered entrance

### 3. **Login** (`app/(auth)/login.tsx`)
- Animated form inputs with validation
- Social login buttons (Kakao, Naver, Apple placeholders)
- Error shake animation on validation failure
- Loading states with ActivityIndicator
- **Features**: Shake animation, haptic feedback, form validation

### 4. **Signup** (`app/(auth)/signup.tsx`)
- Multi-field registration form
- Password confirmation validation
- KeyboardAvoidingView for iOS/Android
- Navigation to login or main app
- **Features**: Form state management, validation

### 5. **Home Screen** (`app/(tabs)/index.tsx`)
- Hero section with gradient background and 3D pet
- Welcome card with glassmorphism effect
- Service cards grid (4 items) with stagger animation
- Nearby hospitals horizontal carousel
- Pull-to-refresh functionality
- **Animations**: FadeIn, FadeInDown with delays, parallax ready

### 6. **Hospital Search** (`app/(tabs)/hospitals.tsx`)
- Search bar with expand animation (ready)
- Filter chips (horizontal scroll)
- Hospital cards with distance, rating, status
- Opening hours badge (영업중/영업종료)
- **Features**: Filter state, search input, card tap navigation

### 7. **Pet Profile** (`app/(tabs)/pets/[id].tsx`)
- 3D pet avatar header with gradient
- Health stats cards with info rows
- Medical records timeline with badges
- Quick action buttons (booking CTA)
- **Features**: Dynamic routing with ID param

### 8. **Booking Flow** (`app/booking/[hospitalId].tsx`)
- Step progress indicator (4 steps)
- Pet selection cards with emoji
- Calendar date selection
- Time slot carousel grid
- Confirmation summary with all details
- **Features**: Multi-step form, progress bar, haptic feedback on each step

## 🎭 Animation Features

### Core Animation Patterns
- **Staggered Entrance**: Lists use `FadeInDown.delay(index * 100)` for sequential reveal
- **Press Animations**: Scale (0.96) + shadow opacity on button press
- **Page Transitions**: Slide from right with fade
- **Shake Animation**: Validation errors trigger left-right shake sequence
- **Loading States**: Skeleton → content crossfade (ready for implementation)

### Reanimated Integration
- Spring animations: `gentle`, `bouncy`, `snappy` presets
- Interpolation for scroll-based animations
- Shared values for performance
- `runOnJS` for navigation callbacks

## 🔧 Technical Stack

### Dependencies Used
- **expo-router**: File-based routing with tabs and modals
- **react-native-reanimated**: High-performance animations
- **expo-haptics**: Tactile feedback
- **expo-linear-gradient**: Gradient backgrounds
- **@tanstack/react-query**: API caching and state management
- **zustand**: Lightweight auth state management
- **axios**: HTTP client with interceptors
- **@react-native-async-storage/async-storage**: Persistent storage

### State Management
```typescript
// Auth Store (Zustand + AsyncStorage persistence)
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  hasCompletedOnboarding: boolean,
  login(), logout(), completeOnboarding()
}
```

### API Integration
```typescript
// API Client Configuration
- Base URL: http://localhost:3000/api/v1
- Request interceptor: Auto-attach auth token
- Response interceptor: Handle 401 logout
- Endpoints: auth, hospitals, pets, bookings
```

## 🎯 Key Features

### Navigation Flow
```
Splash → Onboarding → Login → (Tabs)
                        ↓
                      Signup
                        ↓
                     (Tabs): Home, Hospitals, Pets

From Hospitals → Booking Flow (Modal)
From Home → Pet Profile
```

### Responsive Design
- Mobile-first approach
- Safe area handling (top: 60px padding)
- KeyboardAvoidingView on forms
- Flexible grid layouts (2 columns for services)

### Accessibility
- Semantic button roles (`accessibilityRole="button"`)
- Disabled state management (`accessibilityState`)
- Readable text labels
- Proper contrast ratios from theme

## 🚀 Next Steps

### To Complete
1. **Replace 3D Pet Placeholders**: Integrate actual Spline 3D models
2. **API Integration**: Connect all screens to backend endpoints
3. **Skeleton Loading**: Implement skeleton screens for async operations
4. **Map View**: Add Naver/Kakao Maps for hospital locations
5. **Image Upload**: Add pet photo upload functionality
6. **Push Notifications**: Booking reminders and updates
7. **Charts**: Health stats visualization (weight, vaccinations)
8. **Error Boundaries**: Add error handling components
9. **Offline Support**: Implement offline-first with React Query
10. **Testing**: Unit tests with Jest, E2E with Detox

### Performance Optimizations
- Lazy load tabs and modals
- Image optimization with expo-image
- List virtualization for long hospital lists
- React.memo on card components
- Code splitting with dynamic imports

## 📱 Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🎨 Theme Customization

All colors, typography, and animations are centralized in `/constants/theme.ts`:

```typescript
colors: { primary, secondary, accent, gradients }
typography: { heading1, heading2, body1, caption }
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
animations: { spring, duration }
```

## 📝 Component Usage

### Button Examples
```typescript
<Button title="로그인" onPress={handleLogin} fullWidth />
<Button title="Skip" variant="ghost" size="small" />
<Button title="Save" loading={isSaving} />
```

### Card Examples
```typescript
<Card style={styles.card}>
  <Text>Card Content</Text>
</Card>
```

### Input Examples
```typescript
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

## 🔐 Auth Flow

```typescript
// Login
const { login } = useAuthStore();
login(user, token);
router.replace('/(tabs)');

// Logout
const { logout } = useAuthStore();
logout();
router.replace('/(auth)/login');

// Onboarding
const { completeOnboarding } = useAuthStore();
completeOnboarding();
```

All screens are fully functional with proper navigation, state management, and smooth Toss-style animations. The app is ready for API integration and 3D model replacement.
