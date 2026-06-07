import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ClayButton from '../../components/ClayButton';
import ClayCard from '../../components/ClayCard';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const SPECIALTIES = [
  'Gynecologist',
  'Pediatrician',
  'Radiology',
  'Psychiatrist',
  'Physiology',
  'General Physician',
  'Dentist'
];

export default function AddDoctorScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [experience, setExperience] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleAddDoctor = async () => {
    if (!name.trim() || !specialty || !experience.trim() || !contactNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const doctorData = {
        name: name.trim(),
        specialty,
        experience: parseInt(experience, 10) || 0,
        contactNumber: contactNumber.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'doctors'), doctorData);

      Alert.alert('Success', 'Doctor added successfully!');
      
      // Clear form
      setName('');
      setSpecialty(SPECIALTIES[0]);
      setExperience('');
      setContactNumber('');
    } catch (error) {
      console.error('Error adding doctor:', error);
      Alert.alert('Error', 'Failed to add doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Doctor</Text>
        
        <ClayCard style={styles.form}>
          <Text style={styles.label}>Doctor Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dr. John Doe"
            placeholderTextColor={theme.colors.textLight}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Specialty</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={specialty}
              onValueChange={(itemValue) => setSpecialty(itemValue)}
              style={styles.picker}
            >
              {SPECIALTIES.map(spec => (
                <Picker.Item 
                  key={spec} 
                  label={spec} 
                  value={spec} 
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Experience (Years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5"
            placeholderTextColor={theme.colors.textLight}
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +1 234 567 8900"
            placeholderTextColor={theme.colors.textLight}
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />

          <ClayButton 
            title="Add Doctor"
            onPress={handleAddDoctor}
            loading={loading}
            style={{ marginTop: theme.spacing.xl }}
          />
        </ClayCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingTop: 40,
  },
  title: {
    ...theme.typography.header,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  form: {
    width: '100%',
  },
  label: {
    ...theme.typography.title,
    fontSize: 14,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
});
