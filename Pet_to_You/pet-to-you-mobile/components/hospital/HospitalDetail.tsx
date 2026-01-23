import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Hospital } from '@/hooks/useHospitals';

const { width } = Dimensions.get('window');

interface HospitalDetailProps {
  hospital: Hospital;
  onBookPress?: () => void;
}

export const HospitalDetail: React.FC<HospitalDetailProps> = ({
  hospital,
  onBookPress,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${hospital.phone}`);
  };

  const handleGetDirections = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = Platform.select({
      ios: `maps://app?daddr=${hospital.latitude},${hospital.longitude}`,
      android: `geo:${hospital.latitude},${hospital.longitude}?q=${hospital.name}`,
    });
    if (url) Linking.openURL(url);
  };

  const images = hospital.images && hospital.images.length > 0
    ? hospital.images
    : hospital.image
    ? [hospital.image]
    : [];

  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      {images.length > 0 && (
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(index);
            }}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeImageIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              hospital.isOpen ? styles.openBadge : styles.closedBadge,
            ]}
          >
            <View style={[styles.statusDot, hospital.isOpen && styles.openDot]} />
            <Text style={styles.statusText}>
              {hospital.isOpen ? '영업중' : '영업종료'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{hospital.name}</Text>
          
          {hospital.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={20} color="#FFB300" />
              <Text style={styles.rating}>{hospital.rating.toFixed(1)}</Text>
              {hospital.reviewCount && (
                <Text style={styles.reviewCount}>
                  ({hospital.reviewCount}개 리뷰)
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="call" size={20} color="#42A5F5" />
            </View>
            <Text style={styles.actionText}>전화</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGetDirections}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="navigate" size={20} color="#42A5F5" />
            </View>
            <Text style={styles.actionText}>길찾기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="share-outline" size={20} color="#42A5F5" />
            </View>
            <Text style={styles.actionText}>공유</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>병원 정보</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.infoText}>{hospital.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#666" />
            <Text style={styles.infoText}>{hospital.phone}</Text>
          </View>

          {hospital.distance && (
            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color="#666" />
              <Text style={styles.infoText}>
                {hospital.distance < 1
                  ? `${(hospital.distance * 1000).toFixed(0)}m`
                  : `${hospital.distance.toFixed(1)}km`}
              </Text>
            </View>
          )}
        </View>

        {/* Opening Hours */}
        {hospital.openingHours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>운영 시간</Text>
            {Object.entries(hospital.openingHours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.hoursText}>
                  {hours.closed
                    ? '휴무'
                    : `${hours.open} - ${hours.close}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Services */}
        {hospital.services && hospital.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>진료 과목</Text>
            <View style={styles.servicesGrid}>
              {hospital.services.map((service, index) => (
                <View key={index} style={styles.serviceChip}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>편의 시설</Text>
          <View style={styles.featuresGrid}>
            {hospital.has24Hour && (
              <View style={styles.featureItem}>
                <Ionicons name="time" size={24} color="#42A5F5" />
                <Text style={styles.featureText}>24시간</Text>
              </View>
            )}
            {hospital.hasNightCare && (
              <View style={styles.featureItem}>
                <Ionicons name="moon" size={24} color="#42A5F5" />
                <Text style={styles.featureText}>야간진료</Text>
              </View>
            )}
            {hospital.hasParking && (
              <View style={styles.featureItem}>
                <Ionicons name="car" size={24} color="#42A5F5" />
                <Text style={styles.featureText}>주차</Text>
              </View>
            )}
            {hospital.hasEmergency && (
              <View style={styles.featureItem}>
                <Ionicons name="medical" size={24} color="#42A5F5" />
                <Text style={styles.featureText}>응급</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {hospital.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>병원 소개</Text>
            <Text style={styles.description}>{hospital.description}</Text>
          </View>
        )}

        {/* Bottom spacing for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselImage: {
    width,
    height: 280,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  openBadge: {
    backgroundColor: 'rgba(66, 165, 245, 0.95)',
  },
  closedBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  openDot: {
    opacity: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  hoursText: {
    fontSize: 15,
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#42A5F5',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#666',
  },
});

export default HospitalDetail;
