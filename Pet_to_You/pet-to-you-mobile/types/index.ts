/**
 * Core TypeScript types for Pet to You mobile app
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  gender: 'male' | 'female';
  weight: number;
  profileImage?: string;
  medicalRecords?: MedicalRecord[];
  vaccinations?: Vaccination[];
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  type: 'checkup' | 'surgery' | 'emergency' | 'vaccination';
  diagnosis: string;
  treatment: string;
  veterinarian: string;
  hospitalId: string;
  notes?: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDueDate: string;
  veterinarian: string;
  hospitalId: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  reviewCount: number;
  services: string[];
  openHours: OpenHours;
  images?: string[];
  isEmergency: boolean;
}

export interface OpenHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  petId: string;
  hospitalId: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

export interface OnboardingScreen {
  id: number;
  title: string;
  description: string;
  image: string;
}
