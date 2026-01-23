/**
 * SWR Hooks for API Data Fetching
 * Rule 4.3: Use SWR for Automatic Deduplication
 */

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

// API fetcher with error handling
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('API request failed');
    throw error;
  }
  return response.json();
};

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Deduplicate requests within 2s
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// Hook: Fetch nearby hospitals
export function useNearbyHospitals(latitude?: number, longitude?: number) {
  const url = latitude && longitude
    ? `/api/hospitals/nearby?lat=${latitude}&lng=${longitude}&limit=10`
    : null;

  return useSWR(url, fetcher, {
    ...defaultConfig,
    revalidateOnMount: true,
  });
}

// Hook: Fetch user's pets
export function useUserPets(userId?: string) {
  const url = userId ? `/api/users/${userId}/pets` : null;

  return useSWR(url, fetcher, {
    ...defaultConfig,
    revalidateOnMount: true,
  });
}

// Hook: Fetch upcoming bookings
export function useUpcomingBookings(userId?: string) {
  const url = userId ? `/api/users/${userId}/bookings/upcoming` : null;

  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 30000, // Refresh every 30s
  });
}

// Hook: Fetch user profile
export function useUserProfile(userId?: string) {
  const url = userId ? `/api/users/${userId}/profile` : null;

  return useSWR(url, fetcher, {
    ...defaultConfig,
    revalidateOnMount: false, // Profile doesn't change often
  });
}
