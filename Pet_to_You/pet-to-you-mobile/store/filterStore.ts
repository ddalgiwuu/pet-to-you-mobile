import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hospital Filters
export interface HospitalFilters {
  services: string[];
  openNow: boolean;
  rating: number;
  distance: number;
  hasParking: boolean;
  hasEmergency: boolean;
  has24Hour: boolean;
  hasNightCare: boolean;
}

// Adoption Filters
export interface AdoptionFilters {
  species: string[];
  age: string[];
  size: string[];
  gender: string[];
  vaccinated: boolean;
  neutered: boolean;
  distance: number;
}

// Daycare Filters
export interface DaycareFilters {
  services: string[];
  rating: number;
  distance: number;
  hasPickup: boolean;
  hasCamera: boolean;
  hasGrooming: boolean;
  hasTraining: boolean;
  priceRange: [number, number];
}

interface FilterState {
  // Hospital Filters
  hospitals: HospitalFilters;
  setHospitalFilters: (filters: Partial<HospitalFilters>) => void;
  resetHospitalFilters: () => void;

  // Adoption Filters
  adoption: AdoptionFilters;
  setAdoptionFilters: (filters: Partial<AdoptionFilters>) => void;
  resetAdoptionFilters: () => void;

  // Daycare Filters
  daycare: DaycareFilters;
  setDaycareFilters: (filters: Partial<DaycareFilters>) => void;
  resetDaycareFilters: () => void;

  // Search & Sort
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'distance' | 'rating' | 'name';
  setSortBy: (sort: 'distance' | 'rating' | 'name') => void;

  // Reset All
  resetAllFilters: () => void;
}

const defaultHospitalFilters: HospitalFilters = {
  services: [],
  openNow: false,
  rating: 0,
  distance: 5000, // 5km in meters
  hasParking: false,
  hasEmergency: false,
  has24Hour: false,
  hasNightCare: false,
};

const defaultAdoptionFilters: AdoptionFilters = {
  species: [],
  age: [],
  size: [],
  gender: [],
  vaccinated: false,
  neutered: false,
  distance: 10000, // 10km in meters
};

const defaultDaycareFilters: DaycareFilters = {
  services: [],
  rating: 0,
  distance: 5000, // 5km in meters
  hasPickup: false,
  hasCamera: false,
  hasGrooming: false,
  hasTraining: false,
  priceRange: [0, 200000], // 0-200,000 won
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // Hospital
      hospitals: defaultHospitalFilters,
      setHospitalFilters: (filters) =>
        set((state) => ({
          hospitals: { ...state.hospitals, ...filters },
        })),
      resetHospitalFilters: () =>
        set({ hospitals: defaultHospitalFilters }),

      // Adoption
      adoption: defaultAdoptionFilters,
      setAdoptionFilters: (filters) =>
        set((state) => ({
          adoption: { ...state.adoption, ...filters },
        })),
      resetAdoptionFilters: () =>
        set({ adoption: defaultAdoptionFilters }),

      // Daycare
      daycare: defaultDaycareFilters,
      setDaycareFilters: (filters) =>
        set((state) => ({
          daycare: { ...state.daycare, ...filters },
        })),
      resetDaycareFilters: () =>
        set({ daycare: defaultDaycareFilters }),

      // Search & Sort
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      sortBy: 'distance',
      setSortBy: (sort) => set({ sortBy: sort }),

      // Reset All
      resetAllFilters: () =>
        set({
          hospitals: defaultHospitalFilters,
          adoption: defaultAdoptionFilters,
          daycare: defaultDaycareFilters,
          searchQuery: '',
          sortBy: 'distance',
        }),
    }),
    {
      name: 'filter-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist filters, not search query and sort
      partialize: (state) => ({
        hospitals: state.hospitals,
        adoption: state.adoption,
        daycare: state.daycare,
      }),
    }
  )
);

// Selectors for better performance
export const selectHospitalFilters = (state: FilterState) => state.hospitals;
export const selectAdoptionFilters = (state: FilterState) => state.adoption;
export const selectDaycareFilters = (state: FilterState) => state.daycare;
export const selectSearchQuery = (state: FilterState) => state.searchQuery;
export const selectSortBy = (state: FilterState) => state.sortBy;

export default useFilterStore;
