import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface LocationCardData {
  id: string;
  name: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  address?: string;
  phone?: string;
  isOpen?: boolean;
  services?: string[];
  tags?: string[];
  price?: string;
}

interface LocationCardProps {
  data: LocationCardData;
  onPress?: () => void;
  variant?: 'hospital' | 'adoption' | 'daycare';
  showDistance?: boolean;
  showRating?: boolean;
  style?: any;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  data,
  onPress,
  variant = 'hospital',
  showDistance = true,
  showRating = true,
  style,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'hospital':
        return '#42A5F5';
      case 'adoption':
        return '#FF6B9D';
      case 'daycare':
        return '#66BB6A';
      default:
        return '#42A5F5';
    }
  };

  const variantColor = getVariantColor();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {data.image ? (
          <Image
            source={{ uri: data.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: variantColor + '20' }]}>
            <Ionicons name="image-outline" size={40} color={variantColor} />
          </View>
        )}
        
        {/* Status Badge */}
        {data.isOpen !== undefined && (
          <View style={[styles.statusBadge, data.isOpen ? styles.openBadge : styles.closedBadge]}>
            <View style={[styles.statusDot, data.isOpen && styles.openDot]} />
            <Text style={[styles.statusText, data.isOpen && styles.openText]}>
              {data.isOpen ? '영업중' : '영업종료'}
            </Text>
          </View>
        )}

        {/* Distance Badge */}
        {showDistance && data.distance !== undefined && (
          <View style={styles.distanceBadge}>
            <Ionicons name="location" size={12} color="#fff" />
            <Text style={styles.distanceText}>
              {data.distance < 1
                ? `${(data.distance * 1000).toFixed(0)}m`
                : `${data.distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {data.name}
          </Text>
          
          {showRating && data.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB300" />
              <Text style={styles.rating}>{data.rating.toFixed(1)}</Text>
              {data.reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({data.reviewCount})</Text>
              )}
            </View>
          )}
        </View>

        {data.address && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.infoText} numberOfLines={1}>
              {data.address}
            </Text>
          </View>
        )}

        {data.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color="#999" />
            <Text style={styles.infoText}>{data.phone}</Text>
          </View>
        )}

        {/* Services/Tags */}
        {(data.services || data.tags) && (
          <View style={styles.tagsContainer}>
            {(data.services || data.tags)?.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { borderColor: variantColor }]}>
                <Text style={[styles.tagText, { color: variantColor }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {(data.services || data.tags)!.length > 3 && (
              <Text style={styles.moreText}>
                +{(data.services || data.tags)!.length - 3}
              </Text>
            )}
          </View>
        )}

        {/* Price (for daycare) */}
        {data.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>시작가</Text>
            <Text style={styles.price}>{data.price}</Text>
          </View>
        )}
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  openBadge: {
    backgroundColor: 'rgba(66, 165, 245, 0.9)',
  },
  closedBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  openDot: {
    backgroundColor: '#fff',
    opacity: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
  },
  openText: {
    opacity: 1,
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: 90,
  },
});

export default LocationCard;
