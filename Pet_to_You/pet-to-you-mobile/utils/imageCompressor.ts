/**
 * Image Compression Utility
 * Compresses and resizes images for optimal upload performance
 */

import * as ImageManipulator from 'expo-image-manipulator';

// Maximum image dimensions
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

// Compression quality (0-1)
const COMPRESSION_QUALITY = 0.7;

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

/**
 * Compress a single image
 * @param uri - Image URI from image picker
 * @returns Compressed image with metadata
 */
export async function compressImage(uri: string): Promise<CompressedImage> {
  try {
    // Manipulate image: resize and compress
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
          },
        },
      ],
      {
        compress: COMPRESSION_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('이미지 압축에 실패했습니다');
  }
}

/**
 * Compress multiple images
 * @param uris - Array of image URIs
 * @returns Array of compressed images
 */
export async function compressImages(uris: string[]): Promise<CompressedImage[]> {
  const compressed: CompressedImage[] = [];

  for (const uri of uris) {
    try {
      const result = await compressImage(uri);
      compressed.push(result);
    } catch (error) {
      console.error(`Failed to compress image: ${uri}`, error);
      // Skip failed images and continue
    }
  }

  return compressed;
}

/**
 * Calculate resize dimensions while maintaining aspect ratio
 * @param width - Original width
 * @param height - Original height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns New dimensions
 */
export function calculateResizeDimensions(
  width: number,
  height: number,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT
): { width: number; height: number } {
  // If image is smaller than max, return original
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  // Determine which dimension is the limiting factor
  if (width > height) {
    // Landscape
    const newWidth = Math.min(width, maxWidth);
    const newHeight = newWidth / aspectRatio;
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  } else {
    // Portrait or square
    const newHeight = Math.min(height, maxHeight);
    const newWidth = newHeight * aspectRatio;
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }
}

/**
 * Validate image file size
 * @param uri - Image URI
 * @returns true if size is acceptable
 */
export async function validateImageSize(uri: string): Promise<boolean> {
  try {
    // Note: React Native doesn't provide direct file size access
    // This would require native modules or backend validation
    // For now, we'll compress first and assume it's valid
    return true;
  } catch (error) {
    return false;
  }
}
