# Pet to You - Toss-Inspired Component Library

🎨 **Production-ready UI component library** with Toss-style animations and modern design for React Native.

## Quick Start

```tsx
import { Button, Card, Input } from '@/components/ui';
import { FloatingCard } from '@/components/animations';

// Use anywhere in your app
<Button title="Click Me" onPress={() => {}} />
<Card><Text>Content</Text></Card>
<Input label="Email" value={email} onChangeText={setEmail} />
```

## 📦 What's Included

### UI Components (`/components/ui/`)

1. **Button** - Animated button with variants (primary, secondary, outline, ghost)
2. **Card** - Glassmorphism card with press/long-press effects
3. **Input** - Text input with floating label and validation states
4. **Badge** - Pill-shaped badge with gradient and remove animation
5. **Modal** - Bottom sheet modal with pan gesture dismiss
6. **ProgressBar** - Progress indicator with shimmer effect
7. **Switch** - Toggle switch with smooth animations

### Animation Components (`/components/animations/`)

1. **FloatingCard** - Floating animation with parallax effect
2. **SpringButton** - Button with spring physics
3. **AnimatedCounter** - Animated number counter

### Design System (`/constants/theme.ts`)

- **Colors**: Vibrant pink primary, turquoise secondary, yellow accent
- **Typography**: 6 text styles (heading1-3, body1-2, caption)
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **Animations**: Spring presets (gentle, bouncy, snappy)
- **Shadows**: 3 elevation levels (small, medium, large)

## 🚀 Features

- ⚡ **60fps animations** using react-native-reanimated (UI thread)
- 📱 **Haptic feedback** on all interactive components
- ♿ **Accessible** with screen reader support
- 🎯 **TypeScript** for type safety
- 🎨 **Toss-style design** with gradients and smooth transitions
- 🧩 **Modular** - import only what you need

## 📖 Documentation

Full documentation available at `/components/ui/README.md`

## 🎯 Example Usage

See `/components/examples/ComponentShowcase.tsx` for complete examples of all components.

```tsx
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Card, Input, Badge, Modal, ProgressBar, Switch } from '@/components/ui';
import { AnimatedCounter, FloatingCard } from '@/components/animations';

export const MyScreen = () => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [progress, setProgress] = useState(75);

  return (
    <ScrollView>
      {/* Floating Card */}
      <FloatingCard>
        <Card onPress={() => console.log('Pressed')}>
          <Badge label="New Feature" variant="success" />
          <AnimatedCounter value={1234} prefix="$" decimals={2} />
        </Card>
      </FloatingCard>

      {/* Input with validation */}
      <Input
        label="Email"
        value={value}
        onChangeText={setValue}
        error={value && !value.includes('@') ? 'Invalid email' : undefined}
        success={value.includes('@')}
      />

      {/* Progress */}
      <ProgressBar progress={progress} />

      {/* Toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Enable notifications</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>

      {/* Buttons */}
      <Button title="Open Modal" onPress={() => setVisible(true)} />
      <Button title="Secondary" variant="secondary" onPress={() => {}} />

      {/* Modal */}
      <Modal visible={visible} onClose={() => setVisible(false)} title="Settings">
        <Text>Modal content here</Text>
      </Modal>
    </ScrollView>
  );
};
```

## 🎨 Design Tokens

```tsx
import { colors, typography, spacing, animations } from '@/constants/theme';

// Colors
colors.primary      // #FF6B9D - Pink
colors.secondary    // #4ECDC4 - Turquoise
colors.accent       // #FFE66D - Yellow

// Typography
typography.heading1 // { fontSize: 32, fontWeight: '700', lineHeight: 40 }
typography.body1    // { fontSize: 16, fontWeight: '400', lineHeight: 24 }

// Spacing
spacing.md          // 16
spacing.lg          // 24

// Animations
animations.spring.gentle  // { damping: 20, stiffness: 90 }
animations.duration.normal // 300
```

## 🔧 Configuration

### Enable react-native-reanimated

Add to `babel.config.js`:

```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Must be last
  };
};
```

### Enable gesture handler

Wrap app in `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app */}
    </GestureHandlerRootView>
  );
}
```

## 📱 Platform Support

- ✅ iOS 13+
- ✅ Android 5.0+ (API 21+)
- ⚠️ Web (limited animation support, no haptics)

## 🎯 Best Practices

1. **Performance**: Use max 3-5 FloatingCard components per screen
2. **Accessibility**: Always provide `accessibilityLabel` for interactive components
3. **Haptics**: Disable with `hapticFeedback={false}` for non-critical interactions
4. **Colors**: Use design tokens from `@/constants/theme` for consistency
5. **Animations**: Adjust spring physics (`stiffness`, `damping`) for feel

## 🐛 Known Issues

1. **Glassmorphism**: `backdropFilter` not fully supported on Android (use blur library)
2. **Modal**: On Android, may need to adjust `StatusBar` visibility
3. **Haptics**: Not supported on Web platform

## 📚 Resources

- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/
- Toss Design System: https://toss.im/design

## 📝 License

MIT

---

Built with ❤️ for Pet to You mobile app
