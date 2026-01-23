import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCreatePost } from '@/hooks/useCommunity';
// import ImagePicker from '@/components/community/ImagePicker'; // Disabled until native modules
import HashtagInput from '@/components/community/HashtagInput';

const CATEGORIES = ['daily', 'health', 'training', 'food', 'adoption', 'hospital'];

export default function CreatePostScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('daily');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // const [images, setImages] = useState<string[]>([]); // Disabled until native modules
  const images: string[] = []; // Temporary: no image upload
  const [hashtags, setHashtags] = useState<string[]>([]);
  const { mutate: createPost, isPending } = useCreatePost();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 입력해주세요');
      return;
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title.trim());
    formData.append('content', content.trim());

    // Add hashtags
    if (hashtags.length > 0) {
      formData.append('hashtags', JSON.stringify(hashtags));
    }

    // Add images if any
    images.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `image-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('images', {
        uri,
        type,
        name: filename,
      } as any);
    });

    createPost(formData as any, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('작성 완료', '게시물이 등록되었습니다', [
          { text: '확인', onPress: () => router.back() },
        ]);
      },
      onError: (error) => {
        console.error('Post creation error:', error);
        Alert.alert('오류', '게시물 작성 중 오류가 발생했습니다');
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>글쓰기</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
            <Text style={[styles.submitText, isPending && styles.submitTextDisabled]}>완료</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput value={title} onChangeText={setTitle} placeholder="제목을 입력하세요" placeholderTextColor="#999" style={styles.titleInput} />
          <TextInput value={content} onChangeText={setContent} placeholder="내용을 입력하세요" placeholderTextColor="#999" multiline textAlignVertical="top" style={styles.contentInput} />

          {/* Image Picker - Disabled until native modules configured */}
          {/* <View style={styles.section}>
            <ImagePicker
              selectedImages={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </View> */}

          {/* Hashtag Input */}
          <View style={styles.section}>
            <HashtagInput
              hashtags={hashtags}
              onHashtagsChange={setHashtags}
              maxHashtags={10}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  submitText: { fontSize: 16, fontWeight: '600', color: '#42A5F5' },
  submitTextDisabled: { color: '#ccc' },
  content: { flex: 1, padding: 20 },
  categoriesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 20 },
  categoryChipActive: { backgroundColor: '#42A5F5' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#666' },
  categoryTextActive: { color: '#fff' },
  titleInput: { fontSize: 20, fontWeight: '600', color: '#333', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 16 },
  contentInput: { fontSize: 16, color: '#333', minHeight: 200, lineHeight: 24, marginBottom: 20 },
  section: { marginBottom: 20 },
});
