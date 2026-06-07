import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ClayButton from '../../components/ClayButton';
import ClayCard from '../../components/ClayCard';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ManageTestsScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!testName || !price) {
      Alert.alert('Error', 'Please enter both test name and price.');
      return;
    }

    setLoading(true);
    try {
      const testsRef = collection(db, 'available_tests');
      await addDoc(testsRef, {
        testName,
        price: parseFloat(price),
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Test added successfully!');
      setTestName('');
      setPrice('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add test. Please try again.');
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
        <Text style={styles.title}>Add New Test</Text>

        <ClayCard style={styles.form}>
          <Text style={styles.label}>Test Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Complete Blood Count (CBC)"
            placeholderTextColor={theme.colors.textLight}
            value={testName}
            onChangeText={setTestName}
          />

          <Text style={styles.label}>Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <ClayButton
            title="Publish Test"
            onPress={handleSubmit}
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
});
