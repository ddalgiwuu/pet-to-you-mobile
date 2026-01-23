import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { usePostById, useLikePost, useComments, useCreateComment } from '@/hooks/useCommunity';
import HashtagChip from '@/components/community/HashtagChip';
import ShareSheet from '@/components/community/ShareSheet';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [commentInput, setCommentInput] = useState('');
  const [showShareSheet, setShowShareSheet] = useState(false);

  const { data: post, isLoading } = usePostById(postId);
  const { mutate: likePost } = useLikePost();
  const { data: commentsData, fetchNextPage, hasNextPage } = useComments(postId);
  const { mutate: createComment } = useCreateComment();

  const comments = commentsData?.pages.flatMap((page) => page.comments) || [];

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likePost(postId);
  };

  const handleComment = () => {
    if (!commentInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createComment(
      { postId, content: commentInput.trim() },
      { onSuccess: () => setCommentInput('') }
    );
  };

  if (isLoading || !post) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#42A5F5" /></View>;
  }

  const postDate = format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{post.category}</Text>
          <TouchableOpacity onPress={() => setShowShareSheet(true)}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Pressable
            onPress={() => router.push(`/community/profile/${post.userId}` as any)}
            style={styles.postHeader}
          >
            {post.userAvatar ? (
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}><Ionicons name="person" size={24} color="#999" /></View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.postDate}>{postDate}</Text>
            </View>
          </Pressable>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>

          {post.images && post.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {post.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.postImage} />
              ))}
            </View>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {post.hashtags.map((tag, index) => (
                <HashtagChip
                  key={index}
                  tag={tag}
                  onPress={() => {
                    router.back();
                    // Navigate to community tab with hashtag filter
                    setTimeout(() => {
                      router.push({
                        pathname: '/(tabs)/community',
                        params: { hashtag: tag },
                      } as any);
                    }, 300);
                  }}
                />
              ))}
            </View>
          )}

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={24} color={post.isLiked ? '#FF5252' : '#666'} />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>댓글 {comments.length}</Text>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  {comment.userAvatar ? (
                    <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                  ) : (
                    <View style={styles.commentAvatarPlaceholder}><Ionicons name="person" size={16} color="#999" /></View>
                  )}
                  <Text style={styles.commentUserName}>{comment.userName}</Text>
                  <Text style={styles.commentDate}>{format(new Date(comment.createdAt), 'MM.dd HH:mm')}</Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.commentInputContainer}>
          <TextInput value={commentInput} onChangeText={setCommentInput} placeholder="댓글을 입력하세요" placeholderTextColor="#999" style={styles.commentInput} />
          <TouchableOpacity style={styles.commentButton} onPress={handleComment}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Share Sheet */}
        <ShareSheet
          visible={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          postId={postId}
          title={post.title}
          content={post.content}
          imageUrl={post.images?.[0]}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#666' },
  content: { flex: 1 },
  postHeader: { flexDirection: 'row', padding: 20, paddingBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  userInfo: { marginLeft: 12, justifyContent: 'center' },
  userName: { fontSize: 16, fontWeight: '600', color: '#333' },
  postDate: { fontSize: 13, color: '#999', marginTop: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#333', paddingHorizontal: 20, marginBottom: 16 },
  postContent: { fontSize: 16, lineHeight: 26, color: '#333', paddingHorizontal: 20, marginBottom: 20 },
  imagesContainer: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  postImage: { width: '100%', height: 240, borderRadius: 12 },
  hashtagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  postActions: { flexDirection: 'row', gap: 24, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 15, fontWeight: '500', color: '#666' },
  commentsSection: { padding: 20 },
  commentsTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  commentCard: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  commentUserName: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  commentDate: { fontSize: 12, color: '#999' },
  commentContent: { fontSize: 15, lineHeight: 22, color: '#666', paddingLeft: 40 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 12 },
  commentInput: { flex: 1, fontSize: 15, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  commentButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#42A5F5', justifyContent: 'center', alignItems: 'center' },
});
