/**
 * Share Utility (Simplified for Expo Go compatibility)
 * Functions for sharing posts via various methods
 */

import { Alert, Share } from 'react-native';

/**
 * Copy link to clipboard (placeholder)
 * @param postId - Post ID to share
 */
export async function copyLink(postId: string): Promise<void> {
  const url = `https://pet-to-you.com/community/${postId}`;

  // Fallback: Use Share API instead of clipboard
  try {
    await Share.share({
      message: `링크: ${url}`,
      url,
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
}

/**
 * Share post via native share sheet
 * @param title - Post title
 * @param postId - Post ID
 */
export async function sharePost(title: string, postId: string): Promise<void> {
  const url = `https://pet-to-you.com/community/${postId}`;
  const message = `${title}\n\n${url}`;

  try {
    await Share.share({
      message,
      url,
      title: 'Pet to You',
    });
  } catch (error: any) {
    console.error('Share failed:', error);
  }
}

/**
 * Capture view as image and save to gallery (placeholder)
 * @param viewRef - Reference to view to capture
 * @param filename - Optional filename
 */
export async function captureAndSave(
  viewRef: any,
  filename: string = 'pet-to-you-post.jpg'
): Promise<void> {
  Alert.alert('준비 중', '이미지 저장 기능은 준비 중입니다');
}

/**
 * Share to Kakao Talk (placeholder)
 * @param title - Post title
 * @param content - Post content
 * @param imageUrl - Optional image URL
 */
export async function shareToKakao(
  title: string,
  content: string,
  imageUrl?: string
): Promise<void> {
  Alert.alert('준비 중', '카카오톡 공유 기능은 준비 중입니다');
}
