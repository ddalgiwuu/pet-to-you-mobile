import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BookingSummaryProps {
  hospital?: { name: string; address: string; phone: string };
  pet?: { name: string; species: string; image?: string };
  serviceType?: string;
  date?: Date;
  time?: string;
  symptoms: string;
  notes: string;
  onSymptomsChange: (text: string) => void;
  onNotesChange: (text: string) => void;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  general: '일반 진료',
  vaccination: '예방 접종',
  emergency: '응급 진료',
  surgery: '수술',
  dental: '치과',
  checkup: '건강 검진',
};

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  hospital,
  pet,
  serviceType,
  date,
  time,
  symptoms,
  notes,
  onSymptomsChange,
  onNotesChange,
}) => {
  const formattedDate = date
    ? format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })
    : '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>예약 정보를 확인하세요</Text>

      {/* Hospital Info */}
      {hospital && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={20} color="#42A5F5" />
            <Text style={styles.cardTitle}>병원 정보</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.infoLabel}>병원명</Text>
            <Text style={styles.infoValue}>{hospital.name}</Text>
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>{hospital.address}</Text>
            <Text style={styles.infoLabel}>연락처</Text>
            <Text style={styles.infoValue}>{hospital.phone}</Text>
          </View>
        </View>
      )}

      {/* Pet Info */}
      {pet && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="paw" size={20} color="#42A5F5" />
            <Text style={styles.cardTitle}>반려동물 정보</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.petRow}>
              {pet.image ? (
                <Image
                  source={{ uri: pet.image }}
                  style={styles.petImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.petImagePlaceholder}>
                  <Ionicons name="paw" size={24} color="#42A5F5" />
                </View>
              )}
              <View style={styles.petInfo}>
                <Text style={styles.infoValue}>{pet.name}</Text>
                <Text style={styles.infoLabel}>{pet.species}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Appointment Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color="#42A5F5" />
          <Text style={styles.cardTitle}>예약 일정</Text>
        </View>
        <View style={styles.cardContent}>
          {serviceType && (
            <>
              <Text style={styles.infoLabel}>진료 유형</Text>
              <Text style={styles.infoValue}>
                {SERVICE_TYPE_LABELS[serviceType] || serviceType}
              </Text>
            </>
          )}
          {date && (
            <>
              <Text style={styles.infoLabel}>날짜</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </>
          )}
          {time && (
            <>
              <Text style={styles.infoLabel}>시간</Text>
              <Text style={styles.infoValue}>{time}</Text>
            </>
          )}
        </View>
      </View>

      {/* Symptoms Input */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={20} color="#42A5F5" />
          <Text style={styles.cardTitle}>증상 설명</Text>
        </View>
        <View style={styles.cardContent}>
          <TextInput
            value={symptoms}
            onChangeText={onSymptomsChange}
            placeholder="현재 증상을 자세히 설명해주세요"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textInput}
          />
        </View>
      </View>

      {/* Notes Input */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbox" size={20} color="#42A5F5" />
          <Text style={styles.cardTitle}>요청 사항</Text>
        </View>
        <View style={styles.cardContent}>
          <TextInput
            value={notes}
            onChangeText={onNotesChange}
            placeholder="병원에 전달할 메시지가 있다면 입력해주세요 (선택)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={styles.textInput}
          />
        </View>
      </View>

      {/* Important Notice */}
      <View style={styles.noticeCard}>
        <Ionicons name="information-circle" size={20} color="#FF9800" />
        <Text style={styles.noticeText}>
          예약 시간보다 10분 전에 도착해주시기 바랍니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    padding: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  petImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  datesScroll: {
    gap: 10,
  },
  dateCard: {
    width: 64,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  dateCardSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  dayOfWeek: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  dayOfMonth: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  dateTextSelected: {
    color: '#fff',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#42A5F5',
    position: 'absolute',
    bottom: 6,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '30%',
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotDisabled: {
    backgroundColor: '#fafafa',
    opacity: 0.5,
  },
  timeSlotSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeTextDisabled: {
    color: '#ccc',
  },
  timeTextSelected: {
    color: '#fff',
  },
  doctorText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  doctorTextSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  textInput: {
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        paddingTop: 14,
      },
    }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptySlots: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptySlotsText: {
    fontSize: 15,
    color: '#999',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#F57C00',
  },
});

export default BookingSummary;
