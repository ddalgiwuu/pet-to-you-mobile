import React from 'react';
import { useRouter } from 'expo-router';
import { LocationCard, LocationCardData } from '@/components/shared';
import { Hospital } from '@/hooks/useHospitals';

interface HospitalListItemProps {
  hospital: Hospital;
  showDistance?: boolean;
  showRating?: boolean;
  style?: any;
}

export const HospitalListItem: React.FC<HospitalListItemProps> = ({
  hospital,
  showDistance = true,
  showRating = true,
  style,
}) => {
  const router = useRouter();

  const cardData: LocationCardData = {
    id: hospital.id,
    name: hospital.name,
    image: hospital.image || hospital.images?.[0],
    rating: hospital.rating,
    reviewCount: hospital.reviewCount,
    distance: hospital.distance,
    address: hospital.address,
    phone: hospital.phone,
    isOpen: hospital.isOpen,
    services: hospital.services,
    tags: [
      hospital.has24Hour && '24시간',
      hospital.hasNightCare && '야간진료',
      hospital.hasParking && '주차가능',
      hospital.hasEmergency && '응급',
    ].filter(Boolean) as string[],
  };

  const handlePress = () => {
    router.push(`/hospital/${hospital.id}`);
  };

  return (
    <LocationCard
      data={cardData}
      onPress={handlePress}
      variant="hospital"
      showDistance={showDistance}
      showRating={showRating}
      style={style}
    />
  );
};

export default HospitalListItem;
