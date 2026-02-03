import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CreatePetData } from '@/hooks/usePets';
import { BreedSelector } from './BreedSelector';

interface BasicInfoFormProps {
  data: Partial<CreatePetData>;
  onDataChange: (data: Partial<CreatePetData>) => void;
}

// Hoist static options outside component (Vercel: rendering-hoist-jsx)
const SPECIES_OPTIONS = [
  { id: 'dog', label: '강아지', icon: '🐶' },
  { id: 'cat', label: '고양이', icon: '🐱' },
  { id: 'other', label: '기타', icon: '🐾' },
] as const;

const GENDER_OPTIONS = [
  { id: 'male', label: '남아', icon: 'male' as const },
  { id: 'female', label: '여아', icon: 'female' as const },
] as const;

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  onDataChange,
}) => {
  // Use functional setState for stable callbacks (Vercel: rerender-functional-setstate)
  const handleChange = React.useCallback(
    (field: keyof CreatePetData, value: any) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDataChange((prevData) => ({ ...prevData, [field]: value }));
    },
    [onDataChange]
  );

  // Auto-format birth date: 20200310 → 2020-03-10
  const formatBirthDate = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 8 digits (YYYYMMDD)
    const limited = numbers.slice(0, 8);

    // Format based on length
    if (limited.length <= 4) {
      return limited; // YYYY
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 4)}-${limited.slice(4)}`; // YYYY-MM
    } else {
      return `${limited.slice(0, 4)}-${limited.slice(4, 6)}-${limited.slice(6)}`; // YYYY-MM-DD
    }
  };

  const handleBirthDateChange = (value: string) => {
    const formatted = formatBirthDate(value);
    handleChange('birthDate', formatted);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>기본 정보를 입력하세요</Text>

      {/* Name Input */}
      <View style={styles.field}>
        <Text style={styles.label}>
          이름 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={data.name || ''}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="반려동물의 이름을 입력하세요"
          placeholderTextColor="#999"
          style={styles.input}
        />
      </View>

      {/* Species Selection */}
      <View style={styles.field}>
        <Text style={styles.label}>
          종류 <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.optionsRow}>
          {SPECIES_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInDown.delay(index * 80)}
              style={styles.optionWrapper}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  data.species === option.id && styles.optionCardSelected,
                ]}
                onPress={() => handleChange('species', option.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionEmoji}>{option.icon}</Text>
                <Text
                  style={[
                    styles.optionText,
                    data.species === option.id && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Breed Selection */}
      <View style={styles.field}>
        <Text style={styles.label}>품종</Text>
        {data.species ? (
          <BreedSelector
            species={data.species as 'dog' | 'cat' | 'other'}
            selectedBreed={data.breed}
            onSelectBreed={(breed) => handleChange('breed', breed)}
          />
        ) : (
          <View style={styles.disabledInput}>
            <Text style={styles.disabledInputText}>
              먼저 종류를 선택해주세요
            </Text>
          </View>
        )}
      </View>

      {/* Birth Date Input */}
      <View style={styles.field}>
        <Text style={styles.label}>생년월일</Text>
        <TextInput
          value={data.birthDate || ''}
          onChangeText={handleBirthDateChange}
          placeholder="20200315 또는 2020-03-15"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="numeric"
          maxLength={10}
        />
        <Text style={styles.hint}>
          8자리 숫자로 입력하면 자동으로 변환됩니다 (예: 20200315 → 2020-03-15)
        </Text>
      </View>

      {/* Gender Selection */}
      <View style={styles.field}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInDown.delay(index * 80)}
              style={styles.genderWrapper}
            >
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  data.gender === option.id && styles.genderCardSelected,
                ]}
                onPress={() => handleChange('gender', option.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={data.gender === option.id ? '#fff' : '#42A5F5'}
                />
                <Text
                  style={[
                    styles.genderText,
                    data.gender === option.id && styles.genderTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Weight Input */}
      <View style={styles.field}>
        <Text style={styles.label}>몸무게</Text>
        <View style={styles.inputWithUnit}>
          <TextInput
            value={data.weight?.toString() || ''}
            onChangeText={(value) => handleChange('weight', parseFloat(value) || 0)}
            placeholder="0.0"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            style={[styles.input, styles.inputNumber]}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
      </View>

      {/* Color Input */}
      <View style={styles.field}>
        <Text style={styles.label}>털 색깔</Text>
        <TextInput
          value={data.color || ''}
          onChangeText={(value) => handleChange('color', value)}
          placeholder="털 색깔을 입력하세요 (예: 흰색, 검은색)"
          placeholderTextColor="#999"
          style={styles.input}
        />
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
    marginBottom: 24,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  required: {
    color: '#FF5252',
  },
  input: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionWrapper: {
    flex: 1,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderWrapper: {
    flex: 1,
  },
  genderCard: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  genderCardSelected: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#42A5F5',
  },
  genderTextSelected: {
    color: '#fff',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputNumber: {
    flex: 1,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#999',
  },
});

export default BasicInfoForm;
