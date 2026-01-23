import React, { useState } from 'react';
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

interface MedicalInfoFormProps {
  data: Partial<CreatePetData>;
  onDataChange: (data: Partial<CreatePetData>) => void;
}

export const MedicalInfoForm: React.FC<MedicalInfoFormProps> = ({
  data,
  onDataChange,
}) => {
  const [allergyInput, setAllergyInput] = useState('');
  const [diseaseInput, setDiseaseInput] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');

  const handleChange = (field: keyof CreatePetData, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const allergies = [...(data.allergies || []), allergyInput.trim()];
      handleChange('allergies', allergies);
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const allergies = [...(data.allergies || [])];
    allergies.splice(index, 1);
    handleChange('allergies', allergies);
  };

  const handleAddDisease = () => {
    if (diseaseInput.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const diseases = [...(data.diseases || []), diseaseInput.trim()];
      handleChange('diseases', diseases);
      setDiseaseInput('');
    }
  };

  const handleRemoveDisease = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const diseases = [...(data.diseases || [])];
    diseases.splice(index, 1);
    handleChange('diseases', diseases);
  };

  const handleAddVaccination = () => {
    if (vaccineName.trim() && vaccineDate.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const vaccinations = [
        ...(data.vaccinations || []),
        { name: vaccineName.trim(), date: vaccineDate.trim() },
      ];
      handleChange('vaccinations', vaccinations);
      setVaccineName('');
      setVaccineDate('');
    }
  };

  const handleRemoveVaccination = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const vaccinations = [...(data.vaccinations || [])];
    vaccinations.splice(index, 1);
    handleChange('vaccinations', vaccinations);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>건강 정보를 입력하세요</Text>
      <Text style={styles.subtitle}>정확한 진료를 위해 필요한 정보입니다</Text>

      {/* Neutered Status */}
      <View style={styles.field}>
        <Text style={styles.label}>중성화 여부</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              data.neutered === true && styles.toggleButtonActive,
            ]}
            onPress={() => handleChange('neutered', true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                data.neutered === true && styles.toggleTextActive,
              ]}
            >
              완료
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              data.neutered === false && styles.toggleButtonActive,
            ]}
            onPress={() => handleChange('neutered', false)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                data.neutered === false && styles.toggleTextActive,
              ]}
            >
              미완료
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Microchip ID */}
      <View style={styles.field}>
        <Text style={styles.label}>마이크로칩 번호</Text>
        <TextInput
          value={data.microchipId || ''}
          onChangeText={(value) => handleChange('microchipId', value)}
          placeholder="마이크로칩 번호 (선택)"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      {/* Allergies */}
      <View style={styles.field}>
        <Text style={styles.label}>알러지</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            value={allergyInput}
            onChangeText={setAllergyInput}
            placeholder="알러지가 있다면 입력하세요"
            placeholderTextColor="#999"
            style={[styles.input, styles.inputWithButton]}
            onSubmitEditing={handleAddAllergy}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAllergy}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {data.allergies && data.allergies.length > 0 && (
          <View style={styles.chipContainer}>
            {data.allergies.map((allergy, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50)}
              >
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{allergy}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveAllergy(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>

      {/* Diseases */}
      <View style={styles.field}>
        <Text style={styles.label}>질병 이력</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            value={diseaseInput}
            onChangeText={setDiseaseInput}
            placeholder="과거 또는 현재 질병이 있다면 입력하세요"
            placeholderTextColor="#999"
            style={[styles.input, styles.inputWithButton]}
            onSubmitEditing={handleAddDisease}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddDisease}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {data.diseases && data.diseases.length > 0 && (
          <View style={styles.chipContainer}>
            {data.diseases.map((disease, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50)}
              >
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{disease}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveDisease(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>

      {/* Vaccinations */}
      <View style={styles.field}>
        <Text style={styles.label}>예방 접종 이력</Text>
        <View style={styles.vaccinationInputs}>
          <TextInput
            value={vaccineName}
            onChangeText={setVaccineName}
            placeholder="백신 이름 (예: 종합백신)"
            placeholderTextColor="#999"
            style={[styles.input, styles.vaccineNameInput]}
          />
          <TextInput
            value={vaccineDate}
            onChangeText={setVaccineDate}
            placeholder="접종일 (YYYY-MM-DD)"
            placeholderTextColor="#999"
            style={[styles.input, styles.vaccineDateInput]}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddVaccination}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {data.vaccinations && data.vaccinations.length > 0 && (
          <View style={styles.vaccineList}>
            {data.vaccinations.map((vaccine, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50)}
              >
                <View style={styles.vaccineItem}>
                  <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineName}>{vaccine.name}</Text>
                    <Text style={styles.vaccineDate}>{vaccine.date}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveVaccination(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>

      {/* Special Needs */}
      <View style={styles.field}>
        <Text style={styles.label}>특이사항</Text>
        <TextInput
          value={data.specialNeeds || ''}
          onChangeText={(value) => handleChange('specialNeeds', value)}
          placeholder="의료진이 알아야 할 특이사항이 있다면 입력하세요"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[styles.input, styles.textArea]}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
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
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  inputWithButton: {
    flex: 1,
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: '#42A5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#42A5F5',
  },
  vaccinationInputs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  vaccineNameInput: {
    flex: 1.5,
  },
  vaccineDateInput: {
    flex: 1,
  },
  vaccineList: {
    gap: 10,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 14,
    borderRadius: 12,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vaccineDate: {
    fontSize: 13,
    color: '#666',
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
  textArea: {
    minHeight: 100,
    ...Platform.select({
      ios: {
        paddingTop: 16,
      },
    }),
  },
});

export default MedicalInfoForm;
