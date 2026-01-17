/**
 * Developer mode store for testing features
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DevState {
  isDevMode: boolean;
  apiEndpoint: string;
  testCredentials: {
    email: string;
    password: string;
  };
  toggleDevMode: () => void;
  setApiEndpoint: (endpoint: string) => void;
  loadDevSettings: () => Promise<void>;
}

const DEFAULT_API_ENDPOINT = 'https://api.pet-to-you.com';
const DEV_STORAGE_KEY = '@pet_to_you_dev_settings';

export const useDevStore = create<DevState>((set, get) => ({
  isDevMode: false,
  apiEndpoint: DEFAULT_API_ENDPOINT,
  testCredentials: {
    email: 'test@pet-to-you.com',
    password: 'test1234',
  },

  toggleDevMode: async () => {
    const newDevMode = !get().isDevMode;
    set({ isDevMode: newDevMode });

    try {
      await AsyncStorage.setItem(
        DEV_STORAGE_KEY,
        JSON.stringify({ isDevMode: newDevMode })
      );
    } catch (error) {
      console.error('Failed to save dev mode:', error);
    }
  },

  setApiEndpoint: async (endpoint: string) => {
    set({ apiEndpoint: endpoint });

    try {
      const settings = await AsyncStorage.getItem(DEV_STORAGE_KEY);
      const parsed = settings ? JSON.parse(settings) : {};
      await AsyncStorage.setItem(
        DEV_STORAGE_KEY,
        JSON.stringify({ ...parsed, apiEndpoint: endpoint })
      );
    } catch (error) {
      console.error('Failed to save API endpoint:', error);
    }
  },

  loadDevSettings: async () => {
    try {
      const settings = await AsyncStorage.getItem(DEV_STORAGE_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        set({
          isDevMode: parsed.isDevMode ?? false,
          apiEndpoint: parsed.apiEndpoint ?? DEFAULT_API_ENDPOINT,
        });
      }
    } catch (error) {
      console.error('Failed to load dev settings:', error);
    }
  },
}));
