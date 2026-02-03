/**
 * Centralized Mock Data for Pet to You App
 * Used as fallback when backend is unavailable
 */

import { Pet } from '@/hooks/usePets';
import { Booking } from '@/hooks/useBookings';
import { Veterinarian, AvailableTimeSlot } from '@/types';

// ==================== MOCK PETS ====================
export const MOCK_PETS: Pet[] = [
  {
    id: 'pet-1',
    userId: 'user-1',
    name: '멍멍이',
    species: 'dog',
    breed: '말티즈',
    birthDate: '2020-03-15',
    gender: 'male',
    weight: 3.5,
    color: '흰색',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
    ],
    allergies: ['닭고기'],
    diseases: [],
    vaccinations: [
      {
        name: '종합백신',
        date: '2025-01-10',
        nextDate: '2026-01-10',
      },
      {
        name: '광견병',
        date: '2024-12-20',
        nextDate: '2025-12-20',
      },
    ],
    neutered: true,
    microchipId: '410123456789012',
    bloodType: 'DEA 1.1+',
    registrationNumber: 'KR-SEOUL-2020-001234',
    registrationDate: '2020-04-01',
    implantDate: '2020-03-20',
    emergencyContact: {
      name: '김민수',
      phone: '010-1234-5678',
      relationship: '보호자',
      isVet: false,
    },
    personality: '활발하고 사람을 좋아해요',
    specialNeeds: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'pet-2',
    userId: 'user-1',
    name: '나비',
    species: 'cat',
    breed: '코리안 숏헤어',
    birthDate: '2021-07-22',
    gender: 'female',
    weight: 4.2,
    color: '치즈 태비',
    image: 'https://images.unsplash.com/photo-1573865526739-10c1de0342e9',
    images: [
      'https://images.unsplash.com/photo-1573865526739-10c1de0342e9',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006',
    ],
    allergies: [],
    diseases: [],
    vaccinations: [
      {
        name: '종합백신',
        date: '2025-01-05',
        nextDate: '2026-01-05',
      },
    ],
    neutered: true,
    microchipId: '410987654321098',
    bloodType: 'A',
    registrationNumber: 'KR-SEOUL-2021-005678',
    registrationDate: '2021-08-10',
    implantDate: '2021-07-30',
    emergencyContact: {
      name: '이영희',
      phone: '010-9876-5432',
      relationship: '보호자',
      isVet: false,
    },
    personality: '조용하고 독립적이에요',
    specialNeeds: '',
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'pet-3',
    userId: 'user-1',
    name: '초코',
    species: 'dog',
    breed: '푸들',
    birthDate: '2019-11-30',
    gender: 'female',
    weight: 5.8,
    color: '갈색',
    image: 'https://images.unsplash.com/photo-1605691595657-35c115d0b0e7',
    images: ['https://images.unsplash.com/photo-1605691595657-35c115d0b0e7'],
    allergies: ['소고기'],
    diseases: ['슬개골 탈구'],
    vaccinations: [
      {
        name: '종합백신',
        date: '2024-12-01',
        nextDate: '2025-12-01',
      },
    ],
    neutered: true,
    microchipId: '410555666777888',
    bloodType: 'DEA 1.1-',
    registrationNumber: 'KR-SEOUL-2019-009012',
    implantDate: '2020-01-15',
    emergencyContact: {
      name: '박철수',
      phone: '010-2345-6789',
      relationship: '보호자',
    },
    personality: '온순하고 차분해요',
    specialNeeds: '관절 보호 필요',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
  },
  {
    id: 'pet-4',
    userId: 'user-1',
    name: '까미',
    species: 'dog',
    breed: '시바견',
    birthDate: '2022-05-18',
    gender: 'male',
    weight: 9.2,
    color: '검은색',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee'],
    allergies: [],
    diseases: [],
    vaccinations: [
      {
        name: '종합백신',
        date: '2025-01-08',
        nextDate: '2026-01-08',
      },
    ],
    neutered: false,
    personality: '장난기 많고 에너지가 넘쳐요',
    specialNeeds: '',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
  },
  {
    id: 'pet-5',
    userId: 'user-1',
    name: '봄이',
    species: 'cat',
    breed: '페르시안',
    birthDate: '2020-04-12',
    gender: 'female',
    weight: 4.8,
    color: '크림색',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006'],
    allergies: ['생선'],
    diseases: [],
    vaccinations: [
      {
        name: '종합백신',
        date: '2024-12-28',
        nextDate: '2025-12-28',
      },
    ],
    neutered: true,
    microchipId: 'KR555666777',
    personality: '애교가 많고 사람을 따라다녀요',
    specialNeeds: '긴 털 관리 필요',
    createdAt: '2023-08-20T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
];

// ==================== MOCK BOOKINGS ====================
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    hospitalId: 'hospital-1',
    hospitalName: '24시 행복 동물병원',
    hospitalAddress: '서울시 강남구 역삼동 123-45',
    petId: 'pet-1',
    petName: '멍멍이',
    date: '2026-01-25',
    time: '14:00',
    serviceType: '정기검진',
    status: 'upcoming',
    symptoms: '',
    notes: '예방접종 스케줄 확인 부탁드립니다',
    createdAt: '2026-01-18T10:30:00Z',
  },
  {
    id: 'booking-2',
    hospitalId: 'hospital-2',
    hospitalName: '사랑 동물병원',
    hospitalAddress: '서울시 강남구 삼성동 456-78',
    petId: 'pet-2',
    petName: '나비',
    date: '2026-01-28',
    time: '10:30',
    serviceType: '치과',
    status: 'upcoming',
    symptoms: '잇몸 출혈',
    notes: '스케일링 상담 원합니다',
    createdAt: '2026-01-15T14:20:00Z',
  },
  {
    id: 'booking-3',
    hospitalId: 'hospital-1',
    hospitalName: '24시 행복 동물병원',
    hospitalAddress: '서울시 강남구 역삼동 123-45',
    petId: 'pet-3',
    petName: '초코',
    date: '2026-01-15',
    time: '16:00',
    serviceType: '정형외과',
    status: 'completed',
    symptoms: '슬개골 탈구 재발',
    notes: '관절 영양제 처방받음',
    createdAt: '2026-01-10T09:00:00Z',
  },
];

// ==================== MOCK USER PROFILE ====================
export const MOCK_USER_PROFILE = {
  id: 'user-1',
  email: 'user@example.com',
  name: '김민수',
  phone: '010-1234-5678',
  address: '서울시 강남구 역삼동',
  avatar: 'https://ui-avatars.com/api/?name=김민수&background=FF6B9D&color=fff',
  createdAt: '2024-01-01T00:00:00Z',
  stats: {
    pets: 5,
    bookings: 12,
    reviews: 8,
  },
};

// ==================== MOCK COMMUNITY POSTS ====================
export const MOCK_POSTS = [
  {
    id: 'post-1',
    userId: 'user-1',
    userName: '김민수',
    userAvatar: 'https://ui-avatars.com/api/?name=김민수&background=FF6B9D&color=fff',
    category: 'daily',
    title: '오늘 우리 멍멍이 산책 다녀왔어요 🐶',
    content: '한강공원에서 산책하다가 강아지 친구들도 많이 만났어요. 날씨도 좋고 정말 행복한 하루였습니다!',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
    ],
    hashtags: ['#강아지', '#산책', '#한강공원'],
    likes: 24,
    comments: 5,
    isLiked: false,
    createdAt: '2026-01-19T14:30:00Z',
  },
  {
    id: 'post-2',
    userId: 'user-2',
    userName: '이영희',
    userAvatar: 'https://ui-avatars.com/api/?name=이영희&background=4ECDC4&color=fff',
    category: 'health',
    title: '반려동물 건강검진 꼭 받으세요!',
    content: '정기 건강검진으로 우리 나비의 건강 이상을 조기에 발견했어요. 1년에 한 번은 꼭 받으세요!',
    images: ['https://images.unsplash.com/photo-1573865526739-10c1de0342e9'],
    hashtags: ['#건강검진', '#반려묘', '#건강관리'],
    likes: 42,
    comments: 12,
    isLiked: true,
    createdAt: '2026-01-18T10:20:00Z',
  },
  {
    id: 'post-3',
    userId: 'user-3',
    userName: '박철수',
    userAvatar: 'https://ui-avatars.com/api/?name=박철수&background=FFE66D&color=333',
    category: 'adoption',
    title: '입양 후기 - 초코를 만나다',
    content: '보호소에서 만난 초코, 이제는 우리 가족이 되었어요. 입양은 사랑입니다 💕',
    images: ['https://images.unsplash.com/photo-1605691595657-35c115d0b0e7'],
    hashtags: ['#입양', '#유기견구조', '#사지말고입양하세요'],
    likes: 67,
    comments: 18,
    isLiked: true,
    createdAt: '2026-01-17T16:45:00Z',
  },
  {
    id: 'post-4',
    userId: 'user-4',
    userName: '정수민',
    userAvatar: 'https://ui-avatars.com/api/?name=정수민&background=FF6B6B&color=fff',
    category: 'training',
    title: '배변 훈련 성공 비법 공유해요!',
    content: '3주 만에 배변 훈련 성공했어요. 일관성과 긍정 강화가 핵심입니다!',
    images: [],
    hashtags: ['#배변훈련', '#강아지훈련', '#훈련팁'],
    likes: 35,
    comments: 9,
    isLiked: false,
    createdAt: '2026-01-16T11:30:00Z',
  },
  {
    id: 'post-5',
    userId: 'user-5',
    userName: '최지은',
    userAvatar: 'https://ui-avatars.com/api/?name=최지은&background=9C88FF&color=fff',
    category: 'food',
    title: '강아지 간식 레시피 - 고구마 칩',
    content: '집에서 만드는 건강한 강아지 간식! 고구마만 있으면 OK! 레시피 공유합니다.',
    images: [],
    hashtags: ['#강아지간식', '#홈메이드', '#고구마'],
    likes: 28,
    comments: 7,
    isLiked: false,
    createdAt: '2026-01-15T09:15:00Z',
  },
  {
    id: 'post-6',
    userId: 'user-6',
    userName: '김태희',
    userAvatar: 'https://ui-avatars.com/api/?name=김태희&background=FFA07A&color=fff',
    category: 'hospital',
    title: '추천 동물병원 - 24시 행복 동물병원',
    content: '응급 상황에서 정말 친절하게 진료해주셨어요. 적극 추천합니다!',
    images: [],
    hashtags: ['#동물병원', '#병원추천', '#응급진료'],
    likes: 19,
    comments: 4,
    isLiked: false,
    createdAt: '2026-01-14T20:00:00Z',
  },
  {
    id: 'post-7',
    userId: 'user-7',
    userName: '박민지',
    userAvatar: 'https://ui-avatars.com/api/?name=박민지&background=87CEEB&color=fff',
    category: 'daily',
    title: '고양이 장난감 추천해주세요!',
    content: '우리 나비가 요즘 심심해하는 것 같아요. 좋은 장난감 추천 부탁드려요!',
    images: [],
    hashtags: ['#고양이', '#장난감추천', '#묻고답하기'],
    likes: 15,
    comments: 11,
    isLiked: false,
    createdAt: '2026-01-13T15:30:00Z',
  },
  {
    id: 'post-8',
    userId: 'user-8',
    userName: '이준호',
    userAvatar: 'https://ui-avatars.com/api/?name=이준호&background=32CD32&color=fff',
    category: 'health',
    title: '겨울철 반려동물 건강 관리 팁',
    content: '추운 겨울, 반려동물 건강 관리법을 공유합니다. 산책 시간과 보온에 신경 써주세요!',
    images: [],
    hashtags: ['#겨울철관리', '#건강관리', '#팁공유'],
    likes: 31,
    comments: 6,
    isLiked: true,
    createdAt: '2026-01-12T12:00:00Z',
  },
  {
    id: 'post-9',
    userId: 'user-9',
    userName: '강서연',
    userAvatar: 'https://ui-avatars.com/api/?name=강서연&background=FF69B4&color=fff',
    category: 'training',
    title: '강아지 사회화 훈련 중요성',
    content: '어릴 때부터 사회화 훈련이 정말 중요해요. 경험 공유합니다!',
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb'],
    hashtags: ['#사회화훈련', '#강아지훈련', '#퍼피'],
    likes: 26,
    comments: 8,
    isLiked: false,
    createdAt: '2026-01-11T17:45:00Z',
  },
  {
    id: 'post-10',
    userId: 'user-10',
    userName: '윤성호',
    userAvatar: 'https://ui-avatars.com/api/?name=윤성호&background=FFD700&color=333',
    category: 'adoption',
    title: '입양 전 꼭 알아야 할 것들',
    content: '입양을 고려하시는 분들께 도움이 되었으면 합니다. 제 경험을 공유해요!',
    images: [],
    hashtags: ['#입양', '#입양준비', '#입양팁'],
    likes: 38,
    comments: 14,
    isLiked: true,
    createdAt: '2026-01-10T13:20:00Z',
  },
];

// ==================== MOCK VETERINARIANS ====================
export const MOCK_VETERINARIANS: Veterinarian[] = [
  {
    id: 'vet-1',
    hospitalId: 'hospital-1',
    name: '김수의',
    title: '원장',
    veterinarianLicense: 'VL-2018-12345',
    specialization: ['외과', '정형외과'],
    photo: undefined,
    email: 'kim.vet@hospital1.com',
    phone: '02-1234-5678',
    workingHours: {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      saturday: { isWorking: true, startTime: '09:00', endTime: '14:00' },
      sunday: { isWorking: false, startTime: '', endTime: '' },
    },
    consultationDuration: 30,
    breakTimes: [
      { startTime: '12:00', endTime: '13:00' },
    ],
    isActive: true,
    rating: 4.8,
    reviewCount: 127,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'vet-2',
    hospitalId: 'hospital-1',
    name: '이수의',
    title: '수의사',
    veterinarianLicense: 'VL-2020-67890',
    specialization: ['피부과', '내과'],
    photo: undefined,
    email: 'lee.vet@hospital1.com',
    phone: '02-1234-5679',
    workingHours: {
      monday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      tuesday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      wednesday: { isWorking: false, startTime: '', endTime: '' },
      thursday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      friday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      saturday: { isWorking: true, startTime: '10:00', endTime: '15:00' },
      sunday: { isWorking: false, startTime: '', endTime: '' },
    },
    consultationDuration: 30,
    breakTimes: [
      { startTime: '13:00', endTime: '14:00' },
    ],
    isActive: true,
    rating: 4.6,
    reviewCount: 89,
    createdAt: '2021-03-20T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'vet-3',
    hospitalId: 'hospital-1',
    name: '박수의',
    title: '수의사',
    veterinarianLicense: 'VL-2019-11111',
    specialization: ['치과', '안과'],
    photo: undefined,
    email: 'park.vet@hospital1.com',
    phone: '02-1234-5680',
    workingHours: {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      saturday: { isWorking: false, startTime: '', endTime: '' },
      sunday: { isWorking: false, startTime: '', endTime: '' },
    },
    consultationDuration: 30,
    breakTimes: [
      { startTime: '12:30', endTime: '13:30' },
    ],
    isActive: true,
    rating: 4.9,
    reviewCount: 156,
    createdAt: '2019-08-10T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'vet-4',
    hospitalId: 'hospital-2',
    name: '최원장',
    title: '원장',
    veterinarianLicense: 'VL-2015-22222',
    specialization: ['외과', '응급의학'],
    photo: undefined,
    email: 'choi.vet@hospital2.com',
    phone: '02-2345-6789',
    workingHours: {
      monday: { isWorking: true, startTime: '08:00', endTime: '20:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '20:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '20:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '20:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '20:00' },
      saturday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorking: true, startTime: '10:00', endTime: '16:00' },
    },
    consultationDuration: 30,
    breakTimes: [],
    isActive: true,
    rating: 4.7,
    reviewCount: 203,
    createdAt: '2018-05-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'vet-5',
    hospitalId: 'hospital-2',
    name: '정수의',
    title: '수의사',
    veterinarianLicense: 'VL-2021-33333',
    specialization: ['내과'],
    photo: undefined,
    email: 'jung.vet@hospital2.com',
    phone: '02-2345-6790',
    workingHours: {
      monday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isWorking: false, startTime: '', endTime: '' },
      sunday: { isWorking: false, startTime: '', endTime: '' },
    },
    consultationDuration: 30,
    breakTimes: [
      { startTime: '12:00', endTime: '13:00' },
    ],
    isActive: true,
    rating: 4.5,
    reviewCount: 67,
    createdAt: '2022-02-14T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

// ==================== MOCK TIME SLOTS ====================
export const MOCK_TIME_SLOTS: AvailableTimeSlot[] = [
  { time: '09:00', available: true, veterinarianId: 'vet-1', veterinarianName: '김수의', doctorName: '김수의' },
  { time: '10:00', available: true, veterinarianId: 'vet-1', veterinarianName: '김수의', doctorName: '김수의' },
  { time: '11:00', available: true, veterinarianId: 'vet-2', veterinarianName: '이수의', doctorName: '이수의' },
  { time: '13:00', available: true, veterinarianId: 'vet-3', veterinarianName: '박수의', doctorName: '박수의' },
  { time: '14:00', available: true, veterinarianId: 'vet-2', veterinarianName: '이수의', doctorName: '이수의' },
  { time: '15:00', available: true, veterinarianId: 'vet-1', veterinarianName: '김수의', doctorName: '김수의' },
  { time: '16:00', available: true, veterinarianId: 'vet-3', veterinarianName: '박수의', doctorName: '박수의' },
  { time: '17:00', available: true, veterinarianId: 'vet-2', veterinarianName: '이수의', doctorName: '이수의' },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get pets filtered by species
 */
export const getMockPetsBySpecies = (species: 'dog' | 'cat' | 'other') => {
  return MOCK_PETS.filter((pet) => pet.species === species);
};

/**
 * Get bookings filtered by status
 */
export const getMockBookingsByStatus = (
  status: 'upcoming' | 'completed' | 'cancelled'
) => {
  return MOCK_BOOKINGS.filter((booking) => booking.status === status);
};


/**
 * Get posts filtered by category
 */
export const getMockPostsByCategory = (category: string) => {
  return MOCK_POSTS.filter((post) => post.category === category);
};

/**
 * Get trending hashtags from posts
 */
export const getMockTrendingHashtags = () => {
  const hashtagCounts = new Map<string, number>();

  MOCK_POSTS.forEach((post) => {
    post.hashtags.forEach((tag) => {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(hashtagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
};
