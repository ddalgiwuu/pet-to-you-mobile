import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UseLocationReturn {
  location: UserLocation | null;
  error: string | null;
  hasPermission: boolean;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('위치 권한이 필요합니다');
        setHasPermission(false);
        
        Alert.alert(
          '위치 권한 필요',
          '근처 병원, 입양처, 유치원을 찾기 위해 위치 권한이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return false;
      }

      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 요청 중 오류가 발생했습니다';
      setError(errorMessage);
      setHasPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      const userLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
      };

      setLocation(userLocation);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '위치를 가져오는 중 오류가 발생했습니다';
      setError(errorMessage);
      console.error('Location error:', err);
      
      // Fallback to Seoul city center
      setLocation({
        latitude: 37.5665,
        longitude: 126.9780,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await getCurrentLocation();
  }, [hasPermission, requestPermission, getCurrentLocation]);

  // Initialize location on mount
  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      // Check existing permission
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
        await getCurrentLocation();
      } else {
        setIsLoading(false);
        // Don't auto-request permission, let user trigger it
        setLocation({
          latitude: 37.5665,
          longitude: 126.9780,
        });
      }
    };

    if (isMounted) {
      initializeLocation();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Watch location changes (optional)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const watchLocation = async () => {
      if (!hasPermission) return;

      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Update every 30 seconds
            distanceInterval: 100, // Or when moved 100 meters
          },
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy ?? undefined,
            });
          }
        );
      } catch (err) {
        console.error('Watch location error:', err);
      }
    };

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, [hasPermission]);

  return {
    location,
    error,
    hasPermission,
    isLoading,
    refreshLocation,
    requestPermission,
  };
};

export default useLocation;
