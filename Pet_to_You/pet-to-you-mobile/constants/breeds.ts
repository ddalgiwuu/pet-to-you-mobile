/**
 * Pet Breed Lists
 * Comprehensive Korean and International breeds
 */

export interface BreedOption {
  id: string;
  name: string;
  nameEn?: string;
  popular?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface BreedCategory {
  title: string;
  data: BreedOption[];
}

// ==================== 강아지 품종 ====================

// 소형견 (10kg 이하)
const SMALL_DOGS: BreedOption[] = [
  { id: 'maltese', name: '말티즈', nameEn: 'Maltese', popular: true, size: 'small' },
  { id: 'poodle', name: '푸들', nameEn: 'Poodle', popular: true, size: 'small' },
  { id: 'pomeranian', name: '포메라니안', nameEn: 'Pomeranian', popular: true, size: 'small' },
  { id: 'shih-tzu', name: '시츄', nameEn: 'Shih Tzu', popular: true, size: 'small' },
  { id: 'yorkshire', name: '요크셔테리어', nameEn: 'Yorkshire Terrier', popular: true, size: 'small' },
  { id: 'chihuahua', name: '치와와', nameEn: 'Chihuahua', popular: true, size: 'small' },
  { id: 'bichon', name: '비숑 프리제', nameEn: 'Bichon Frise', popular: true, size: 'small' },
  { id: 'dachshund', name: '닥스훈트', nameEn: 'Dachshund', size: 'small' },
  { id: 'pug', name: '퍼그', nameEn: 'Pug', size: 'small' },
  { id: 'miniature-schnauzer', name: '미니어처 슈나우저', nameEn: 'Miniature Schnauzer', size: 'small' },
  { id: 'papillon', name: '파피용', nameEn: 'Papillon', size: 'small' },
  { id: 'boston-terrier', name: '보스턴 테리어', nameEn: 'Boston Terrier', size: 'small' },
  { id: 'cavalier', name: '캐벌리어 킹 찰스 스패니얼', nameEn: 'Cavalier King Charles Spaniel', size: 'small' },
];

// 중형견 (10-25kg)
const MEDIUM_DOGS: BreedOption[] = [
  { id: 'corgi', name: '웰시코기', nameEn: 'Welsh Corgi', popular: true, size: 'medium' },
  { id: 'bulldog', name: '프렌치 불독', nameEn: 'French Bulldog', popular: true, size: 'medium' },
  { id: 'beagle', name: '비글', nameEn: 'Beagle', size: 'medium' },
  { id: 'shiba', name: '시바견', nameEn: 'Shiba Inu', size: 'medium' },
  { id: 'jindo', name: '진돗개', nameEn: 'Korean Jindo', size: 'medium' },
  { id: 'cocker', name: '코카 스패니얼', nameEn: 'Cocker Spaniel', size: 'medium' },
  { id: 'border-collie', name: '보더 콜리', nameEn: 'Border Collie', size: 'medium' },
];

// 대형견 (25kg 이상)
const LARGE_DOGS: BreedOption[] = [
  { id: 'golden', name: '골든 리트리버', nameEn: 'Golden Retriever', popular: true, size: 'large' },
  { id: 'labrador', name: '래브라도 리트리버', nameEn: 'Labrador Retriever', size: 'large' },
  { id: 'samoyed', name: '사모예드', nameEn: 'Samoyed', size: 'large' },
  { id: 'husky', name: '시베리안 허스키', nameEn: 'Siberian Husky', size: 'large' },
  { id: 'german-shepherd', name: '저먼 셰퍼드', nameEn: 'German Shepherd', size: 'large' },
  { id: 'doberman', name: '도베르만', nameEn: 'Doberman', size: 'large' },
  { id: 'rottweiler', name: '로트와일러', nameEn: 'Rottweiler', size: 'large' },
  { id: 'malamute', name: '알래스칸 말라뮤트', nameEn: 'Alaskan Malamute', size: 'large' },
];

// 기타
const OTHER_DOGS: BreedOption[] = [
  { id: 'mixed', name: '믹스견', nameEn: 'Mixed' },
  { id: 'other', name: '기타 (직접 입력)', nameEn: 'Other' },
];

// 전체 강아지 품종
export const DOG_BREEDS: BreedOption[] = [
  ...SMALL_DOGS,
  ...MEDIUM_DOGS,
  ...LARGE_DOGS,
  ...OTHER_DOGS,
];

// 카테고리별 강아지 품종
export const DOG_CATEGORIES: BreedCategory[] = [
  { title: '소형견 (10kg 이하)', data: SMALL_DOGS },
  { title: '중형견 (10-25kg)', data: MEDIUM_DOGS },
  { title: '대형견 (25kg 이상)', data: LARGE_DOGS },
  { title: '기타', data: OTHER_DOGS },
];

// ==================== 고양이 품종 ====================

// 단모종
const SHORT_HAIR_CATS: BreedOption[] = [
  { id: 'korean-short', name: '코리안 숏헤어', nameEn: 'Korean Shorthair', popular: true },
  { id: 'british-short', name: '브리티시 숏헤어', nameEn: 'British Shorthair', popular: true },
  { id: 'american-short', name: '아메리칸 숏헤어', nameEn: 'American Shorthair', popular: true },
  { id: 'russian-blue', name: '러시안 블루', nameEn: 'Russian Blue', popular: true },
  { id: 'bengal', name: '벵갈', nameEn: 'Bengal', popular: true },
  { id: 'siamese', name: '샴', nameEn: 'Siamese', popular: true },
  { id: 'abyssinian', name: '아비시니안', nameEn: 'Abyssinian' },
  { id: 'exotic', name: '엑조틱 숏헤어', nameEn: 'Exotic Shorthair' },
  { id: 'oriental', name: '오리엔탈', nameEn: 'Oriental' },
  { id: 'tonkinese', name: '통키니즈', nameEn: 'Tonkinese' },
];

// 장모종
const LONG_HAIR_CATS: BreedOption[] = [
  { id: 'persian', name: '페르시안', nameEn: 'Persian', popular: true },
  { id: 'ragdoll', name: '랙돌', nameEn: 'Ragdoll', popular: true },
  { id: 'maine-coon', name: '메인쿤', nameEn: 'Maine Coon', popular: true },
  { id: 'norwegian', name: '노르웨이 숲', nameEn: 'Norwegian Forest' },
  { id: 'birman', name: '버만', nameEn: 'Birman' },
  { id: 'somali', name: '소말리', nameEn: 'Somali' },
  { id: 'turkish-angora', name: '터키시 앙고라', nameEn: 'Turkish Angora' },
];

// 특수 품종
const SPECIAL_CATS: BreedOption[] = [
  { id: 'scottish-fold', name: '스코티시 폴드', nameEn: 'Scottish Fold', popular: true },
  { id: 'munchkin', name: '먼치킨', nameEn: 'Munchkin' },
  { id: 'sphynx', name: '스핑크스', nameEn: 'Sphynx' },
];

// 기타
const OTHER_CATS: BreedOption[] = [
  { id: 'mixed', name: '믹스묘', nameEn: 'Mixed' },
  { id: 'other', name: '기타 (직접 입력)', nameEn: 'Other' },
];

// 전체 고양이 품종
export const CAT_BREEDS: BreedOption[] = [
  ...SHORT_HAIR_CATS,
  ...LONG_HAIR_CATS,
  ...SPECIAL_CATS,
  ...OTHER_CATS,
];

// 카테고리별 고양이 품종
export const CAT_CATEGORIES: BreedCategory[] = [
  { title: '단모종', data: SHORT_HAIR_CATS },
  { title: '장모종', data: LONG_HAIR_CATS },
  { title: '특수 품종', data: SPECIAL_CATS },
  { title: '기타', data: OTHER_CATS },
];

// ==================== 기타 동물 품종 ====================
export const OTHER_BREEDS: BreedOption[] = [
  { id: 'rabbit', name: '토끼', nameEn: 'Rabbit' },
  { id: 'hamster', name: '햄스터', nameEn: 'Hamster' },
  { id: 'guinea-pig', name: '기니피그', nameEn: 'Guinea Pig' },
  { id: 'ferret', name: '페럿', nameEn: 'Ferret' },
  { id: 'bird', name: '새', nameEn: 'Bird' },
  { id: 'turtle', name: '거북이', nameEn: 'Turtle' },
  { id: 'other', name: '기타 (직접 입력)', nameEn: 'Other' },
];

// ==================== Helper Functions ====================

/**
 * Get breed categories by species (for SectionList)
 */
export const getBreedCategories = (species: 'dog' | 'cat' | 'other'): BreedCategory[] => {
  switch (species) {
    case 'dog':
      return DOG_CATEGORIES;
    case 'cat':
      return CAT_CATEGORIES;
    case 'other':
      return [{ title: '기타 동물', data: OTHER_BREEDS }];
    default:
      return [];
  }
};

/**
 * Get breeds by species
 */
export const getBreedsBySpecies = (species: 'dog' | 'cat' | 'other'): BreedOption[] => {
  switch (species) {
    case 'dog':
      return DOG_BREEDS;
    case 'cat':
      return CAT_BREEDS;
    case 'other':
      return OTHER_BREEDS;
    default:
      return [];
  }
};

/**
 * Get popular breeds only
 */
export const getPopularBreeds = (species: 'dog' | 'cat' | 'other'): BreedOption[] => {
  const breeds = getBreedsBySpecies(species);
  return breeds.filter((breed) => breed.popular);
};

/**
 * Search breeds by name (supports partial Korean and English matching)
 */
export const searchBreeds = (species: 'dog' | 'cat' | 'other', query: string): BreedOption[] => {
  const breeds = getBreedsBySpecies(species);
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return breeds;
  }

  return breeds.filter((breed) => {
    // Korean name matching
    const koreanMatch = breed.name.toLowerCase().includes(normalizedQuery);

    // English name matching
    const englishMatch = breed.nameEn?.toLowerCase().includes(normalizedQuery);

    return koreanMatch || englishMatch;
  });
};
