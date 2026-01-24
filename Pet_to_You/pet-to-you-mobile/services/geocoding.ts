/**
 * Reverse Geocoding Service - GPS to Korean District (구)
 * Uses Kakao Local API with Naver fallback
 */

import config from '@/constants/config';

interface Location {
  latitude: number;
  longitude: number;
}

interface DistrictResult {
  district: string; // "강남구"
  city: string; // "서울특별시"
  fullAddress: string; // "서울특별시 강남구"
}

/**
 * Kakao Reverse Geocoding - Primary
 */
async function getDistrictFromKakao(location: Location): Promise<DistrictResult | null> {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${location.longitude}&y=${location.latitude}`,
      {
        headers: {
          Authorization: `KakaoAK ${config.kakaoRestApiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Kakao API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      return {
        district: doc.region_2depth_name || '', // "강남구"
        city: doc.region_1depth_name || '', // "서울특별시"
        fullAddress: `${doc.region_1depth_name} ${doc.region_2depth_name}`,
      };
    }

    return null;
  } catch (error) {
    console.error('Kakao geocoding error:', error);
    return null;
  }
}

/**
 * Naver Reverse Geocoding - Fallback
 */
async function getDistrictFromNaver(location: Location): Promise<DistrictResult | null> {
  try {
    const coords = `${location.longitude},${location.latitude}`;
    const response = await fetch(
      `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${coords}&output=json&orders=addr`,
      {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': config.naverClientId,
          'X-NCP-APIGW-API-KEY': config.naverClientSecret,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const region = data.results[0].region;
      return {
        district: region.area2.name || '', // "강남구"
        city: region.area1.name || '', // "서울특별시"
        fullAddress: `${region.area1.name} ${region.area2.name}`,
      };
    }

    return null;
  } catch (error) {
    console.error('Naver geocoding error:', error);
    return null;
  }
}

/**
 * Get Korean district name from GPS coordinates
 * Auto-fallback: Kakao → Naver
 */
export async function getDistrictName(location: Location): Promise<DistrictResult | null> {
  // Try Kakao first (better for Korean addresses)
  let result = await getDistrictFromKakao(location);
  
  if (result) {
    return result;
  }

  // Fallback to Naver
  console.log('Kakao failed, trying Naver...');
  result = await getDistrictFromNaver(location);
  
  return result;
}

/**
 * Get short district name only (e.g., "강남구")
 */
export async function getShortDistrict(location: Location): Promise<string> {
  try {
    const result = await getDistrictName(location);
    if (result?.district) {
      return result.district;
    }
    // Fallback: Use approximate district based on coordinates
    return getApproximateDistrict(location);
  } catch (error) {
    console.warn('Failed to get district, using approximate location');
    return getApproximateDistrict(location);
  }
}

/**
 * Approximate district based on coordinates (fallback when API fails)
 * This is a temporary solution until REST API keys are configured
 */
function getApproximateDistrict(location: Location): string {
  // Seoul approximate districts
  const { latitude, longitude } = location;

  // Gangnam area
  if (latitude >= 37.48 && latitude <= 37.54 && longitude >= 127.02 && longitude <= 127.08) {
    return '강남구';
  }
  // Songpa area
  if (latitude >= 37.47 && latitude <= 37.53 && longitude >= 127.08 && longitude <= 127.14) {
    return '송파구';
  }
  // Seocho area
  if (latitude >= 37.47 && latitude <= 37.52 && longitude >= 126.98 && longitude <= 127.03) {
    return '서초구';
  }
  // Gangdong area
  if (latitude >= 37.52 && latitude <= 37.56 && longitude >= 127.12 && longitude <= 127.16) {
    return '강동구';
  }
  // Mapo area
  if (latitude >= 37.54 && latitude <= 37.58 && longitude >= 126.90 && longitude <= 126.96) {
    return '마포구';
  }
  // Yeongdeungpo area
  if (latitude >= 37.51 && latitude <= 37.54 && longitude >= 126.88 && longitude <= 126.94) {
    return '영등포구';
  }
  // Jongno area
  if (latitude >= 37.57 && latitude <= 37.60 && longitude >= 126.97 && longitude <= 127.01) {
    return '종로구';
  }
  // Jung-gu (Seoul)
  if (latitude >= 37.55 && latitude <= 37.58 && longitude >= 126.97 && longitude <= 127.01) {
    return '중구';
  }

  // Default fallback
  return '서울';
}

/**
 * Cache for district lookups (reduce API calls)
 */
const districtCache = new Map<string, { result: DistrictResult; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function getCachedDistrict(location: Location): Promise<DistrictResult | null> {
  const cacheKey = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
  const cached = districtCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  const result = await getDistrictName(location);
  
  if (result) {
    districtCache.set(cacheKey, { result, timestamp: Date.now() });
  }
  
  return result;
}
