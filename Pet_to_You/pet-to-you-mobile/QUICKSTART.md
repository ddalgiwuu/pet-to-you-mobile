# Quick Start Guide

## 🚀 Run the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Or scan QR code with Expo Go app
```

## 📱 Test Navigation Flow

1. **Splash Screen** (2.5s) → Auto-navigates based on state
2. **Onboarding** → Swipe through 3 screens or skip
3. **Login** → Use any email/password (mocked)
4. **Home** → See hero section, services, hospitals
5. **Hospitals** → Search and filter hospitals
6. **Booking** → Click hospital → Complete 4-step flow
7. **Pet Profile** → Click "자세히 보기" from home

## 🔑 Key Interactions

- **Pull to Refresh** on Home screen
- **Swipe** on Onboarding screens
- **Tap** service cards to navigate
- **Filter** hospitals with chips
- **Multi-step** booking with progress bar
- **Shake** animation on login error

## 🎨 Animation Examples

```typescript
// FadeInDown with stagger
{items.map((item, i) => (
  <Animated.View entering={FadeInDown.delay(i * 100)}>
    <Card />
  </Animated.View>
))}

// Button press animation (built-in)
<Button onPress={action} /> // Includes scale + haptic

// Shake on error
shakeX.value = withSequence(
  withTiming(-10), withTiming(10),
  withTiming(-10), withTiming(0)
);
```

## 🛠 Development Tips

### Hot Reload
- Save any file → Instant reload
- Press 'r' to reload manually

### Debug
- Shake device → Open developer menu
- Enable "Fast Refresh"
- Use React DevTools

### Theme Editing
All colors/spacing in `/constants/theme.ts`:
```typescript
colors.primary = '#FF6B9D'  // Change main color
spacing.md = 16             // Adjust spacing
```

### Add New Screen
1. Create file in `/app/` directory
2. Export default component
3. File-based routing (automatic)

## 🔧 Common Issues

### Metro Bundler Error
```bash
npx expo start --clear
```

### Android Simulator Not Found
```bash
# Check Android SDK
npx expo doctor

# Or use Expo Go on physical device
```

### iOS Build Issues
```bash
cd ios && pod install
npm run ios
```

## 📊 Project Stats

- **Screens**: 8 main screens
- **Components**: 9 reusable UI components
- **Lines of Code**: ~1,500 LOC
- **Animation Presets**: 6 configs
- **API Endpoints**: 12 configured

## 🎯 Next Actions

1. Replace emoji pets with 3D models
2. Connect API endpoints
3. Add map integration
4. Implement image upload

## 📚 Documentation

- `APP_SCREENS_README.md` - Detailed screen docs
- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `components/ui/README.md` - Component usage
