import Constants from 'expo-constants';

interface AppConfig {
  kakaoMapsAppKey: string;
  kakaoRestApiKey: string;
  naverClientId: string;
  naverClientSecret: string;
  apiBaseUrl: string;
}

const extra = Constants.expoConfig?.extra as AppConfig | undefined;

export const config = {
  kakaoMapsAppKey: extra?.kakaoMapsAppKey || '4b75a4c8c63df038e1a6e673ab97531b',
  kakaoRestApiKey: extra?.kakaoRestApiKey || '5c819766a37a873086ee304676281d67',
  naverClientId: extra?.naverClientId || 'YOUR_NAVER_CLIENT_ID',
  naverClientSecret: extra?.naverClientSecret || 'YOUR_NAVER_CLIENT_SECRET',
  apiBaseUrl: extra?.apiBaseUrl || 'http://localhost:3000/api/v1',
};

// Validate configuration
export const validateConfig = (): boolean => {
  if (config.kakaoMapsAppKey === 'YOUR_KAKAO_MAPS_APP_KEY_HERE') {
    console.warn(
      'Warning: Kakao Maps API key not configured. Please set KAKAO_MAPS_APP_KEY in app.json'
    );
    return false;
  }
  return true;
};

export default config;
