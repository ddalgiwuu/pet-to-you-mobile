# Toss-Inspired UI Component Library

Production-ready, reusable UI components for Pet to You mobile app with Toss-style animations and design.

## Features

- 🎨 **Toss-style Design**: Vibrant colors, smooth animations, modern aesthetics
- ⚡ **60fps Animations**: Using react-native-reanimated for optimal performance
- 📱 **Haptic Feedback**: Native haptic feedback on interactions
- ♿ **Accessible**: Screen reader support and ARIA labels
- 🎯 **TypeScript**: Full type safety with TypeScript
- 🧩 **Modular**: Import only what you need

## Installation

All dependencies are already installed in the project:

```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "expo-haptics": "^15.0.8",
  "expo-linear-gradient": "^15.0.8"
}
```

## Components

### Button

Animated button with multiple variants and states.

```tsx
import { Button } from '@/components/ui';

<Button
  title="Click Me"
  onPress={() => console.log('Pressed')}
  variant="primary" // primary | secondary | outline | ghost
  size="medium" // small | medium | large
  loading={false}
  disabled={false}
  fullWidth={false}
/>
```

**Features**:
- Press animation (scale 1→0.96) with spring physics
- Gradient background for primary variant
- Loading state with spinner
- Haptic feedback on press
- Shadow elevation animation

---

### Card

Glassmorphism card with press and long-press animations.

```tsx
import { Card } from '@/components/ui';

<Card
  onPress={() => console.log('Pressed')}
  onLongPress={() => console.log('Long pressed')}
  glassEffect={true}
  gradientBorder={true}
>
  <Text>Card content</Text>
</Card>
```

**Features**:
- Frosted glass background effect
- Gradient border with customizable colors
- Press animation: translateY(0→-2) + shadow expand
- Long press: scale pulse animation
- Haptic feedback

---

### Input

Animated text input with floating label and validation states.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  value={value}
  onChangeText={setValue}
  error="Invalid email"
  success={false}
  showClearButton={true}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
/>
```

**Features**:
- Floating label animation on focus
- Focus state: border glow + scale(1→1.02)
- Error state: shake animation with red border
- Success state: checkmark slide-in with green border
- Clear button with fade animation
- Haptic feedback on error/success

---

### Badge

Animated badge/chip component.

```tsx
import { Badge } from '@/components/ui';

<Badge
  label="New"
  variant="primary" // primary | secondary | success | error | neutral
  size="medium" // small | medium | large
  onRemove={() => console.log('Removed')}
  gradient={true}
/>
```

**Features**:
- Bounce entrance animation
- Gradient fill with customizable colors
- Remove animation: scale + fade
- Pill-shaped design
- Haptic feedback on remove

---

### Modal

Bottom sheet modal with pan gesture dismiss.

```tsx
import { Modal } from '@/components/ui';

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Modal Title"
  showHandle={true}
>
  <Text>Modal content</Text>
</Modal>
```

**Features**:
- Slide up from bottom animation
- Backdrop fade (opacity 0→0.5)
- Pan gesture to dismiss with threshold
- Spring physics: damping(20), stiffness(90)
- Haptic feedback on open/close

---

### ProgressBar

Animated progress indicator with shimmer effect.

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar
  progress={65} // 0-100
  height={8}
  showShimmer={true}
  gradientColors={['#FF6B9D', '#FF8FAB']}
/>
```

**Features**:
- Width animation with spring physics
- Gradient fill
- Shimmer effect during loading
- Customizable colors and height

---

### Switch

Toss-style toggle switch.

```tsx
import { Switch } from '@/components/ui';

<Switch
  value={enabled}
  onValueChange={setEnabled}
  activeColor="#FF6B9D"
  inactiveColor="#6B7280"
  disabled={false}
/>
```

**Features**:
- Smooth slide animation (300ms)
- Background color morph
- Circle scale bounce on toggle
- Haptic feedback (medium on enable, light on disable)

---

## Animation Components

### FloatingCard

Floating animation with parallax effect.

```tsx
import { FloatingCard } from '@/components/animations';

<FloatingCard
  floatDistance={5}
  duration={3000}
  rotationDegree={2}
  delay={0}
>
  <Card><Text>Floating content</Text></Card>
</FloatingCard>
```

**Features**:
- Subtle float animation (translateY ±5px)
- Rotation tilt during float
- Configurable duration and distance
- Loops infinitely

---

### SpringButton

Button wrapper with spring physics.

```tsx
import { SpringButton } from '@/components/animations';

<SpringButton
  stiffness={150}
  damping={15}
  mass={1}
  pressScale={0.96}
>
  <View><Text>Press me</Text></View>
</SpringButton>
```

**Features**:
- Press animation with overshoot
- Release spring back with bounce
- Configurable spring physics
- Haptic feedback

---

### AnimatedCounter

Number counter with smooth animation.

```tsx
import { AnimatedCounter } from '@/components/animations';

<AnimatedCounter
  value={1234}
  duration={1000}
  decimals={2}
  prefix="$"
  suffix=" USD"
  separator=","
/>
```

**Features**:
- Count up/down with easing
- Digit animation
- Number formatting (thousands separator, decimals)
- Customizable prefix/suffix

---

## Design System

### Colors

```typescript
import { colors } from '@/constants/theme';

colors.primary      // #FF6B9D - Pink
colors.secondary    // #4ECDC4 - Turquoise
colors.accent       // #FFE66D - Yellow
colors.success      // #95E1D3 - Mint green
colors.error        // #FF6B6B - Coral red
colors.background   // #FFFFFF
colors.surface      // #F8F9FA
colors.text.primary // #191919
```

### Typography

```typescript
import { typography } from '@/constants/theme';

typography.heading1 // 32px, bold
typography.heading2 // 24px, bold
typography.heading3 // 20px, semibold
typography.body1    // 16px, regular
typography.body2    // 14px, regular
typography.caption  // 12px, regular
```

### Spacing

```typescript
import { spacing } from '@/constants/theme';

spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing.xxl  // 48px
```

### Animation Presets

```typescript
import { animations } from '@/constants/theme';

animations.spring.gentle  // damping: 20, stiffness: 90
animations.spring.bouncy  // damping: 15, stiffness: 150
animations.spring.snappy  // damping: 25, stiffness: 200

animations.duration.fast   // 200ms
animations.duration.normal // 300ms
animations.duration.slow   // 500ms
```

---

## Usage Example

See `/components/examples/ComponentShowcase.tsx` for a complete example demonstrating all components.

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Input, Badge, Modal } from '@/components/ui';

export const MyScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <Card onPress={() => setModalVisible(true)}>
        <Badge label="New" variant="success" />
        <Input label="Email" value="" onChangeText={() => {}} />
        <Button title="Open Modal" onPress={() => setModalVisible(true)} />
      </Card>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        {/* Modal content */}
      </Modal>
    </View>
  );
};
```

---

## Accessibility

All components include:

- ✅ Screen reader support (`accessibilityLabel`, `accessibilityHint`)
- ✅ Accessibility roles (`accessibilityRole="button"`)
- ✅ State announcements (`accessibilityState`)
- ✅ Keyboard navigation support
- ✅ Sufficient color contrast ratios

---

## Performance

- 🚀 **60fps animations** using react-native-reanimated (runs on UI thread)
- ⚡ **Optimized re-renders** with React.memo and useCallback
- 📦 **Tree-shakeable** imports for minimal bundle size
- 🎯 **Native haptics** using expo-haptics

---

## Browser/Platform Support

- ✅ iOS 13+
- ✅ Android 5.0+ (API 21+)
- ⚠️ Web (limited animation support, no haptics)

---

## Tips

1. **Haptic Feedback**: Set `hapticFeedback={false}` to disable on specific components
2. **Custom Colors**: Use `activeColor` and `inactiveColor` props for theming
3. **Animation Physics**: Adjust `stiffness`, `damping`, and `mass` for SpringButton
4. **Accessibility**: Always provide meaningful `accessibilityLabel` props
5. **Performance**: Use `FloatingCard` sparingly (3-5 per screen max)

---

## License

MIT
