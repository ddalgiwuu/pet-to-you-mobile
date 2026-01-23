/**
 * ImagePicker Component
 * Multi-image picker with compression and preview grid
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { compressImage } from '@/utils/imageCompressor';

interface ImagePickerProps {
  selectedImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImagePicker({
  selectedImages,
  onImagesChange,
  maxImages = 5,
}: ImagePickerProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const handlePickImages = async () => {
    // Request permission
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '사진을 선택하려면 갤러리 접근 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    // Check if we can add more images
    const remainingSlots = maxImages - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert('알림', `최대 ${maxImages}장까지 선택할 수 있습니다.`);
      return;
    }

    // Launch image picker
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remainingSlots,
    });

    if (!result.canceled && result.assets.length > 0) {
      setIsCompressing(true);

      try {
        // Compress all selected images
        const compressedImages = [];

        for (const asset of result.assets) {
          const compressed = await compressImage(asset.uri);
          compressedImages.push(compressed.uri);
        }

        // Add to selected images
        onImagesChange([...selectedImages, ...compressedImages]);
      } catch (error) {
        console.error('Image compression error:', error);
        Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      {/* Image Grid */}
      {selectedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageScroll}
        >
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <Pressable
                onPress={() => handleRemoveImage(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </Pressable>
              <View style={styles.imageNumber}>
                <Text style={styles.imageNumberText}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Button */}
      {selectedImages.length < maxImages && (
        <Pressable
          onPress={handlePickImages}
          disabled={isCompressing}
          style={styles.addButton}
        >
          {isCompressing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>
                사진 추가 ({selectedImages.length}/{maxImages})
              </Text>
            </>
          )}
        </Pressable>
      )}

      {/* Helper Text */}
      <Text style={styles.helperText}>
        최대 {maxImages}장까지 선택할 수 있습니다. 이미지는 자동으로 압축됩니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  imageScroll: {
    gap: 12,
    paddingRight: 16,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    ...shadows.small,
  },
  imageNumber: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumberText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.background,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.primary,
  },
  helperText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
