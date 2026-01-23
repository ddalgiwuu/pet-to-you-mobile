/**
 * PhotoUpload Component (Simplified for Expo Go)
 * Placeholder until native modules are properly configured
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PhotoUploadProps {
  mainPhoto?: string;
  additionalPhotos?: string[];
  onMainPhotoChange: (uri: string) => void;
  onAdditionalPhotosChange: (uris: string[]) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  mainPhoto,
  additionalPhotos = [],
  onMainPhotoChange,
  onAdditionalPhotosChange,
}) => {
  const handlePhotoPress = () => {
    Alert.alert(
      '사진 업로드',
      '사진 업로드 기능은 네이티브 빌드에서 사용 가능합니다.\n\n지금은 기본 이미지로 진행됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '기본 이미지 사용',
          onPress: () => {
            // Set default image
            onMainPhotoChange('https://via.placeholder.com/300');
          },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>대표 사진</Text>
        <Text style={styles.sublabel}>반려동물의 얼굴이 잘 보이는 사진을 선택해주세요</Text>

        <TouchableOpacity onPress={handlePhotoPress} style={styles.mainPhotoButton}>
          {mainPhoto ? (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="checkmark-circle" size={48} color="#4ECDC4" />
              <Text style={styles.photoText}>기본 이미지 선택됨</Text>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#999" />
              <Text style={styles.uploadText}>대표 사진 추가</Text>
              <Text style={styles.uploadSubtext}>탭하여 선택</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>추가 사진 (선택)</Text>
        <Text style={styles.sublabel}>최대 4장까지 추가할 수 있습니다</Text>

        <View style={styles.additionalPhotos}>
          <TouchableOpacity onPress={handlePhotoPress} style={styles.smallPhotoButton}>
            <Ionicons name="add" size={32} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#4ECDC4" />
        <Text style={styles.infoText}>
          사진 업로드 기능은 네이티브 앱 빌드 시 활성화됩니다
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sublabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  mainPhotoButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#999',
  },
  photoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  additionalPhotos: {
    flexDirection: 'row',
    gap: 8,
  },
  smallPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#E3F9F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC430',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
