# Home Screen Integration Guide

## Quick Start - Integrating Real Data

This guide shows how to replace mock data with real booking data using SWR hooks.

---

## Step 1: Create Data Hook

**File**: `lib/hooks/useUpcomingBookings.ts`

```typescript
import useSWR from 'swr';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  hospitalName: string;
  date: string;
  time: string;
  petName: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export function useUpcomingBookings() {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    '/api/bookings/upcoming',
    api.get,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    bookings: data ?? [],
    hasBookings: (data?.length ?? 0) > 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
```

---

## Step 2: Update UpcomingBooking Component

**File**: `components/home/UpcomingBooking.tsx`

### Before
```typescript
export default function UpcomingBooking({ onPress, onViewAll }: UpcomingBookingProps) {
  // TODO: Replace with useUpcomingBookings() hook
  const hasBooking = false; // Set to false by default

  if (!hasBooking) {
    return <EmptyState />;
  }

  return (
    <Animated.View>
      <BookingCard booking={MOCK_BOOKING} onPress={onPress} />
    </Animated.View>
  );
}
```

### After
```typescript
import { useUpcomingBookings } from '@/lib/hooks/useUpcomingBookings';

export default function UpcomingBooking({ onPress, onViewAll }: UpcomingBookingProps) {
  const { bookings, hasBookings, isLoading } = useUpcomingBookings();

  // Loading state
  if (isLoading) {
    return <BookingSkeleton />;
  }

  // Empty state
  if (!hasBookings) {
    return <EmptyState />;
  }

  // Get the next upcoming booking
  const nextBooking = bookings[0];

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>다가오는 예약</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>전체보기</Text>
        </Pressable>
      </View>

      <BookingCard booking={nextBooking} onPress={onPress} />
    </Animated.View>
  );
}
```

---

## Step 3: Update HomeScreen

**File**: `app/(tabs)/index.tsx`

### Before
```typescript
export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // TODO: Replace with actual booking data from useUpcomingBookings() hook
  const hasUpcomingBookings = false;

  return (
    <ScrollView>
      <UpcomingBooking onPress={handleBookingPress} onViewAll={handleBookingsPress} />
      {!hasUpcomingBookings && <HealthTips />}
    </ScrollView>
  );
}
```

### After
```typescript
import { useUpcomingBookings } from '@/lib/hooks/useUpcomingBookings';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // ✅ Real data integration
  const { hasBookings, isLoading, refresh } = useUpcomingBookings();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh(); // Refresh booking data
    setRefreshing(false);
  }, [refresh]);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <UpcomingBooking onPress={handleBookingPress} onViewAll={handleBookingsPress} />
      
      {/* ✅ Conditional rendering based on real data */}
      {!isLoading && !hasBookings && <HealthTips />}
    </ScrollView>
  );
}
```

---

## Step 4: Add Loading Skeleton (Optional)

**File**: `components/home/UpcomingBooking.tsx`

```typescript
const BookingSkeleton = React.memo(() => (
  <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
    <View style={styles.header}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonAction} />
    </View>
    
    <View style={[styles.bookingCard, styles.skeletonCard]}>
      <View style={styles.skeletonBadge} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  </Animated.View>
));

// Add skeleton styles
const styles = StyleSheet.create({
  // ... existing styles ...
  
  skeletonTitle: {
    width: 120,
    height: 20,
    backgroundColor: colors.surface,
    borderRadius: 4,
  },
  skeletonAction: {
    width: 60,
    height: 16,
    backgroundColor: colors.surface,
    borderRadius: 4,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    gap: 12,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
});
```

---

## Step 5: Error Handling

Add error state to `UpcomingBooking.tsx`:

```typescript
export default function UpcomingBooking({ onPress, onViewAll }: UpcomingBookingProps) {
  const { bookings, hasBookings, isLoading, error } = useUpcomingBookings();

  // Loading state
  if (isLoading) {
    return <BookingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
        <Text style={styles.title}>다가오는 예약</Text>
        <Pressable style={styles.errorCard} onPress={() => window.location.reload()}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorText}>예약 정보를 불러오지 못했습니다</Text>
          <Text style={styles.errorSubtext}>다시 시도하려면 탭하세요</Text>
        </Pressable>
      </Animated.View>
    );
  }

  // Empty state
  if (!hasBookings) {
    return <EmptyState />;
  }

  // Success state
  const nextBooking = bookings[0];
  return <BookingCard booking={nextBooking} onPress={onPress} />;
}
```

---

## API Endpoint Requirements

### GET `/api/bookings/upcoming`

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_123",
      "hospitalName": "24시 행복 동물병원",
      "date": "2024-01-20",
      "time": "14:30",
      "petName": "멍멍이",
      "status": "confirmed"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized (redirect to login)
- `500`: Server error (show error state)

---

## Testing Checklist

### Unit Tests
```typescript
describe('useUpcomingBookings', () => {
  it('should return empty array when no bookings', async () => {
    // Mock API response
    mockApi.get.mockResolvedValue({ data: [] });
    
    const { result } = renderHook(() => useUpcomingBookings());
    
    await waitFor(() => {
      expect(result.current.hasBookings).toBe(false);
      expect(result.current.bookings).toEqual([]);
    });
  });

  it('should return bookings when available', async () => {
    // Mock API response with bookings
    mockApi.get.mockResolvedValue({ 
      data: [{ id: '1', hospitalName: 'Test Hospital' }] 
    });
    
    const { result } = renderHook(() => useUpcomingBookings());
    
    await waitFor(() => {
      expect(result.current.hasBookings).toBe(true);
      expect(result.current.bookings).toHaveLength(1);
    });
  });
});
```

### Integration Tests
```typescript
describe('HomeScreen', () => {
  it('should show HealthTips when no bookings', async () => {
    mockUseUpcomingBookings({ hasBookings: false });
    
    render(<HomeScreen />);
    
    expect(screen.getByText('건강 관리 팁')).toBeInTheDocument();
  });

  it('should hide HealthTips when bookings exist', async () => {
    mockUseUpcomingBookings({ hasBookings: true });
    
    render(<HomeScreen />);
    
    expect(screen.queryByText('건강 관리 팁')).not.toBeInTheDocument();
  });
});
```

---

## Performance Optimization

### 1. SWR Configuration
```typescript
export function useUpcomingBookings() {
  return useSWR('/api/bookings/upcoming', api.get, {
    revalidateOnFocus: true,     // Refresh when user returns
    revalidateOnReconnect: true, // Refresh on network recovery
    refreshInterval: 60000,      // Auto-refresh every 60s
    dedupingInterval: 5000,      // Prevent duplicate requests
    errorRetryCount: 3,          // Retry failed requests
    errorRetryInterval: 1000,    // Wait 1s between retries
  });
}
```

### 2. Memoization
```typescript
// Memoize booking card to prevent re-renders
const BookingCard = React.memo(({ booking, onPress }) => {
  // ... component code
});

// Memoize callbacks
const handleBookingPress = React.useCallback((id: string) => {
  router.push(`/bookings/${id}`);
}, [router]);
```

### 3. Conditional Rendering
```typescript
// Only render HealthTips when necessary
{!isLoading && !hasBookings && <HealthTips />}
```

---

## Migration Timeline

### Phase 1: Setup (Week 1)
- [ ] Create `useUpcomingBookings` hook
- [ ] Set up API endpoint
- [ ] Add loading skeleton
- [ ] Add error handling

### Phase 2: Integration (Week 2)
- [ ] Update `UpcomingBooking` component
- [ ] Update `HomeScreen` logic
- [ ] Test with real data
- [ ] Handle edge cases

### Phase 3: Polish (Week 3)
- [ ] Add animations for state transitions
- [ ] Optimize performance
- [ ] Add analytics tracking
- [ ] User acceptance testing

---

## Rollback Plan

If issues arise, you can revert to mock data:

```typescript
// In useUpcomingBookings.ts
export function useUpcomingBookings() {
  // Temporary fallback to mock data
  return {
    bookings: [MOCK_BOOKING],
    hasBookings: true,
    isLoading: false,
    error: null,
    refresh: () => {},
  };
}
```

---

## Analytics Integration

Track key metrics:

```typescript
import { analytics } from '@/lib/analytics';

export default function UpcomingBooking({ onPress, onViewAll }: UpcomingBookingProps) {
  const { bookings, hasBookings, isLoading } = useUpcomingBookings();

  React.useEffect(() => {
    if (!isLoading) {
      analytics.track('home_booking_state', {
        hasBookings,
        bookingCount: bookings.length,
      });
    }
  }, [isLoading, hasBookings, bookings.length]);

  // ... rest of component
}
```

---

## Common Issues & Solutions

### Issue 1: Infinite Re-renders
**Cause**: Unstable dependencies in hooks  
**Solution**: Wrap callbacks in `useCallback`, memoize objects

### Issue 2: Stale Data
**Cause**: SWR cache not invalidating  
**Solution**: Call `mutate()` after booking actions

### Issue 3: Flash of Empty State
**Cause**: Loading state not handled  
**Solution**: Show skeleton during `isLoading`

---

## Support

For questions or issues:
1. Check this integration guide
2. Review `HOME_SCREEN_REDESIGN.md`
3. Consult React Best Practices documentation
4. Contact: dev@pettoyou.com

---

**Last Updated**: 2024-01-18  
**Status**: Ready for integration  
**Estimated Integration Time**: 2-3 weeks
