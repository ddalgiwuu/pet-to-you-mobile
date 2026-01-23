import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HospitalReview } from '@/hooks/useHospitals';

interface HospitalReviewsProps {
  reviews: HospitalReview[];
  total: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onHelpful?: (reviewId: string) => void;
}

export const HospitalReviews: React.FC<HospitalReviewsProps> = ({
  reviews,
  total,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onHelpful,
}) => {
  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFB300"
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: HospitalReview }) => {
    const reviewDate = new Date(item.createdAt);
    const formattedDate = format(reviewDate, 'yyyy.MM.dd', { locale: ko });

    return (
      <View style={styles.reviewCard}>
        {/* User Info */}
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {item.userAvatar ? (
              <Image
                source={{ uri: item.userAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#999" />
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.userName}</Text>
              <Text style={styles.reviewDate}>{formattedDate}</Text>
            </View>
          </View>
          {renderRatingStars(item.rating)}
        </View>

        {/* Review Content */}
        <Text style={styles.reviewContent}>{item.content}</Text>

        {/* Review Images */}
        {item.images && item.images.length > 0 && (
          <View style={styles.reviewImages}>
            {item.images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* Helpful Button */}
        <TouchableOpacity
          style={styles.helpfulButton}
          onPress={() => onHelpful?.(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="thumbs-up-outline" size={16} color="#666" />
          <Text style={styles.helpfulText}>
            도움됨 {item.helpful > 0 ? item.helpful : ''}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#42A5F5" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>리뷰 ({total})</Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    padding: 20,
  },
  reviewCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 13,
    color: '#999',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginBottom: 12,
  },
  reviewImages: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  helpfulText: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default HospitalReviews;
