# Image Optimization Guide

## Quick Setup for Placeholder Images

### 1. Create Placeholder Assets

Add these placeholder images to `/assets/images/`:

#### Avatar Placeholder (40x40px)
```
avatar-placeholder.png
- Size: 40x40px
- Background: #f0f0f0
- Icon: Person silhouette in #999
```

#### Post Image Placeholder (full width)
```
post-placeholder.png
- Size: 375x200px (or larger)
- Background: #f5f5f5
- Icon/Text: "Image loading..." in #ccc
```

### 2. Usage Pattern

```typescript
import { Image } from 'expo-image';

// Basic usage with placeholder
<Image
  source={{ uri: imageUrl }}
  placeholder={require('@/assets/images/placeholder.png')}
  contentFit="cover"
  transition={200}
  style={styles.image}
/>

// With blurhash (advanced)
<Image
  source={{ uri: imageUrl }}
  placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }}
  contentFit="cover"
  transition={200}
  style={styles.image}
/>
```

### 3. Temporary Fallback (Current Implementation)

For now, the code handles missing placeholders gracefully:
- Community posts show avatar placeholder via conditional rendering
- Post images load without placeholder (will add black background during load)

### 4. Future: Blurhash Integration

Install blurhash library:
```bash
npm install blurhash react-native-blurhash
```

Generate blurhash on server/upload:
```typescript
import { encode } from 'blurhash';

// When uploading image, generate blurhash
const blurhash = encode(imageData, 4, 3);
// Store blurhash with image metadata in database
```

Use in React Native:
```typescript
<Image
  source={{ uri: post.imageUrl }}
  placeholder={{ blurhash: post.blurhash }}
  contentFit="cover"
  transition={200}
  style={styles.postImage}
/>
```

## Performance Tips

### Image Caching Strategy

expo-image automatically handles caching, but you can configure:

```typescript
import { Image } from 'expo-image';

// Aggressive caching (default)
<Image
  source={{ uri: imageUrl }}
  cachePolicy="memory-disk"  // Default: cache in memory and disk
/>

// Network-first for frequently changing images
<Image
  source={{ uri: profileAvatar }}
  cachePolicy="network"  // Always fetch from network
/>
```

### Image Size Optimization

1. **Serve appropriate sizes:**
   - Thumbnails: 200x200
   - Feed images: 750x500
   - Full-screen: 1080x1920

2. **Use CDN with resizing:**
   ```typescript
   const imageUrl = `${CDN_URL}/${imageId}?w=750&h=500&fit=cover`;
   ```

3. **Format selection:**
   - expo-image automatically uses WebP on supported devices
   - Fallback to JPEG/PNG on older devices

### Memory Management

For image-heavy feeds:

```typescript
<FlashList
  data={posts}
  renderItem={renderPost}
  estimatedItemSize={180}
  // Important: Remove images when off-screen
  removeClippedSubviews={true}
  maxToRenderPerBatch={5}
  windowSize={5}
/>
```

## Common Patterns

### Avatar with Fallback
```typescript
{user.avatar ? (
  <Image
    source={{ uri: user.avatar }}
    placeholder={require('@/assets/images/avatar-placeholder.png')}
    style={styles.avatar}
    contentFit="cover"
    transition={200}
  />
) : (
  <View style={styles.avatarPlaceholder}>
    <Ionicons name="person" size={20} color="#999" />
  </View>
)}
```

### Progressive Image Loading
```typescript
const [imageLoading, setImageLoading] = useState(true);

<View>
  <Image
    source={{ uri: post.image }}
    style={styles.postImage}
    contentFit="cover"
    transition={200}
    onLoadStart={() => setImageLoading(true)}
    onLoadEnd={() => setImageLoading(false)}
  />
  {imageLoading && (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator />
    </View>
  )}
</View>
```

### Image Grid Optimization
```typescript
<FlashList
  data={images}
  numColumns={3}
  renderItem={({ item }) => (
    <Image
      source={{ uri: item.thumbnail }}
      style={styles.gridImage}
      contentFit="cover"
      // Use lower quality for thumbnails
      cachePolicy="memory"
    />
  )}
  estimatedItemSize={120}
/>
```

## Testing Checklist

- [ ] Images load on slow 3G network
- [ ] Placeholders display during load
- [ ] Transitions are smooth (no flash)
- [ ] Memory usage acceptable on long scrolls
- [ ] Images cache properly (check DevTools)
- [ ] Fallback works when image fails to load

## Resources

- [expo-image documentation](https://docs.expo.dev/versions/latest/sdk/image/)
- [blurhash documentation](https://blurha.sh/)
- [Image optimization best practices](https://web.dev/fast/#optimize-your-images)
