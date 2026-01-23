// Location & Map
export { useLocation } from './useLocation';
export { useKakaoMap } from './useKakaoMap';

// Hospitals
export { useHospitals, useHospitalById, useHospitalReviews, useAvailableSlots, useCreateBooking } from './useHospitals';

// Pets
export { usePets, usePetById, useCreatePet, useUpdatePet, useUploadPetPhoto } from './usePets';

// Adoption
export { useAdoptions, useAdoptionById, useSubmitApplication } from './useAdoption';

// Daycare
export { useDaycares, useDaycareById, useCreateReservation } from './useDaycare';

// Bookings
export { useBookings, useCancelBooking, useRescheduleBooking } from './useBookings';

// Community
export { usePosts, usePostById, useCreatePost, useLikePost, useComments, useCreateComment } from './useCommunity';

// Types
export type { UserLocation, UseLocationReturn } from './useLocation';
export type { UseKakaoMapReturn } from './useKakaoMap';
export type { Hospital, HospitalReview, TimeSlot } from './useHospitals';
export type { Pet, CreatePetData } from './usePets';
export type { AdoptionPet } from './useAdoption';
export type { Daycare } from './useDaycare';
export type { Booking } from './useBookings';
export type { Post, Comment } from './useCommunity';
