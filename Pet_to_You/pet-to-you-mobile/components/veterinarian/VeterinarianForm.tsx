import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Veterinarian, WorkingSchedule, BreakTime } from '@/types';

interface VeterinarianFormProps {
  initialData?: Partial<Veterinarian>;
  onSubmit: (data: Partial<Veterinarian>) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

const SPECIALIZATIONS = [
  '외과',
  '내과',
  '피부과',
  '치과',
  '안과',
  '정형외과',
  '응급의학',
];

const DAYS = [
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
  { key: 'sunday', label: '일' },
];

const DEFAULT_WORKING_HOURS: WorkingSchedule = {
  monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
  tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
  wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
  thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
  friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
  saturday: { isWorking: false, startTime: '', endTime: '' },
  sunday: { isWorking: false, startTime: '', endTime: '' },
};

export const VeterinarianForm: React.FC<VeterinarianFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = '저장',
  isLoading = false,
}) => {
  const [photo, setPhoto] = useState(initialData?.photo);
  const [name, setName] = useState(initialData?.name || '');
  const [title, setTitle] = useState(initialData?.title || '수의사');
  const [license, setLicense] = useState(initialData?.veterinarianLicense || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [specializations, setSpecializations] = useState<string[]>(
    initialData?.specialization || []
  );
  const [workingHours, setWorkingHours] = useState<WorkingSchedule>(
    initialData?.workingHours || DEFAULT_WORKING_HOURS
  );
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>(
    initialData?.breakTimes || [{ startTime: '12:00', endTime: '13:00' }]
  );
  const [consultationDuration, setConsultationDuration] = useState(
    initialData?.consultationDuration?.toString() || '30'
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 업로드를 위해 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const toggleSpecialization = (spec: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );
  };

  const toggleWorkingDay = (day: keyof WorkingSchedule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorking: !prev[day].isWorking,
      },
    }));
  };

  const updateWorkingTime = (
    day: keyof WorkingSchedule,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('입력 오류', '이름을 입력해주세요.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('입력 오류', '이름은 최소 2자 이상이어야 합니다.');
      return;
    }

    if (!license.trim()) {
      Alert.alert('입력 오류', '면허번호를 입력해주세요.');
      return;
    }

    if (license.trim().length < 5) {
      Alert.alert('입력 오류', '면허번호는 최소 5자 이상이어야 합니다.');
      return;
    }

    // Check at least one working day
    const hasWorkingDay = Object.values(workingHours).some((day) => day.isWorking);
    if (!hasWorkingDay) {
      Alert.alert('입력 오류', '최소 1일의 근무 시간을 설정해주세요.');
      return;
    }

    const formData: Partial<Veterinarian> = {
      photo,
      name: name.trim(),
      title,
      veterinarianLicense: license.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      specialization: specializations,
      workingHours,
      breakTimes: breakTimes.filter(
        (bt) => bt.startTime && bt.endTime
      ),
      consultationDuration: parseInt(consultationDuration) || 30,
      isActive,
    };

    onSubmit(formData);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Photo Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>프로필 사진</Text>
        <TouchableOpacity
          style={styles.photoUpload}
          onPress={handlePickImage}
          activeOpacity={0.8}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={32} color="#999" />
              <Text style={styles.photoPlaceholderText}>사진 업로드</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.helpText}>선택사항 (최대 5MB)</Text>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기본 정보</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            이름 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="김수의"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>직함</Text>
          <View style={styles.titleButtons}>
            {['수의사', '원장'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.titleButton,
                  title === t && styles.titleButtonSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTitle(t);
                }}
              >
                <Text
                  style={[
                    styles.titleButtonText,
                    title === t && styles.titleButtonTextSelected,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            면허번호 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={license}
            onChangeText={setLicense}
            placeholder="VL-2020-12345"
            placeholderTextColor="#ccc"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="vet@hospital.com"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="02-1234-5678"
            placeholderTextColor="#ccc"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Specializations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>전문분야</Text>
        <View style={styles.chipsContainer}>
          {SPECIALIZATIONS.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.chip,
                specializations.includes(spec) && styles.chipSelected,
              ]}
              onPress={() => toggleSpecialization(spec)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  specializations.includes(spec) && styles.chipTextSelected,
                ]}
              >
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Working Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          근무시간 <Text style={styles.required}>*</Text>
        </Text>
        {DAYS.map(({ key, label }) => {
          const dayKey = key as keyof WorkingSchedule;
          const daySchedule = workingHours[dayKey];

          return (
            <View key={key} style={styles.dayRow}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{label}</Text>
                <Switch
                  value={daySchedule.isWorking}
                  onValueChange={() => toggleWorkingDay(dayKey)}
                  trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                  thumbColor={daySchedule.isWorking ? '#4CAF50' : '#f4f3f4'}
                />
              </View>

              {daySchedule.isWorking && (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={daySchedule.startTime}
                    onChangeText={(value) =>
                      updateWorkingTime(dayKey, 'startTime', value)
                    }
                    placeholder="09:00"
                    placeholderTextColor="#ccc"
                  />
                  <Text style={styles.timeSeparator}>-</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={daySchedule.endTime}
                    onChangeText={(value) =>
                      updateWorkingTime(dayKey, 'endTime', value)
                    }
                    placeholder="18:00"
                    placeholderTextColor="#ccc"
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Break Times */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>휴게시간</Text>
        {breakTimes.map((breakTime, index) => (
          <View key={index} style={styles.breakTimeRow}>
            <TextInput
              style={styles.timeInput}
              value={breakTime.startTime}
              onChangeText={(value) => {
                const newBreakTimes = [...breakTimes];
                newBreakTimes[index].startTime = value;
                setBreakTimes(newBreakTimes);
              }}
              placeholder="12:00"
              placeholderTextColor="#ccc"
            />
            <Text style={styles.timeSeparator}>-</Text>
            <TextInput
              style={styles.timeInput}
              value={breakTime.endTime}
              onChangeText={(value) => {
                const newBreakTimes = [...breakTimes];
                newBreakTimes[index].endTime = value;
                setBreakTimes(newBreakTimes);
              }}
              placeholder="13:00"
              placeholderTextColor="#ccc"
            />
            {breakTimes.length > 1 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBreakTimes(breakTimes.filter((_, i) => i !== index));
                }}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBreakButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setBreakTimes([...breakTimes, { startTime: '', endTime: '' }]);
          }}
        >
          <Ionicons name="add-circle" size={20} color="#42A5F5" />
          <Text style={styles.addBreakText}>휴게시간 추가</Text>
        </TouchableOpacity>
      </View>

      {/* Consultation Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>진료 시간</Text>
        <View style={styles.durationRow}>
          <TextInput
            style={styles.durationInput}
            value={consultationDuration}
            onChangeText={setConsultationDuration}
            placeholder="30"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
          />
          <Text style={styles.durationUnit}>분</Text>
        </View>
        <Text style={styles.helpText}>기본 진료 소요 시간입니다</Text>
      </View>

      {/* Active Status */}
      <View style={styles.section}>
        <View style={styles.activeRow}>
          <View>
            <Text style={styles.sectionTitle}>활성 상태</Text>
            <Text style={styles.helpText}>
              {isActive ? '예약 가능' : '예약 불가능'}
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsActive(value);
            }}
            trackColor={{ false: '#E0E0E0', true: '#81C784' }}
            thumbColor={isActive ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <Text style={styles.submitButtonText}>처리 중...</Text>
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  helpText: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },

  // Photo Upload
  photoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    alignSelf: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: '#999',
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // Title Selection
  titleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  titleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  titleButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#42A5F5',
  },
  titleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  titleButtonTextSelected: {
    color: '#42A5F5',
  },

  // Specializations
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#E1BEE7',
    borderColor: '#9C27B0',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  chipTextSelected: {
    color: '#6A1B9A',
    fontWeight: '600',
  },

  // Working Hours
  dayRow: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#999',
  },

  // Break Times
  breakTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  removeButton: {
    padding: 4,
  },
  addBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#42A5F5',
    borderStyle: 'dashed',
  },
  addBreakText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#42A5F5',
  },

  // Duration
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: 100,
    textAlign: 'center',
  },
  durationUnit: {
    fontSize: 16,
    color: '#666',
  },

  // Active Status
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#42A5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});

export default VeterinarianForm;
