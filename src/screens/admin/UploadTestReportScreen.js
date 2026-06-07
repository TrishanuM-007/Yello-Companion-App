import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ClayButton from '../../components/ClayButton';
import ClayCard from '../../components/ClayCard';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export default function UploadTestReportScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testName, setTestName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetchingPatients, setFetchingPatients] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const patientsList = [];
      querySnapshot.forEach((doc) => {
        patientsList.push({ id: doc.id, ...doc.data() });
      });
      setPatients(patientsList);
      if (patientsList.length > 0) {
        setSelectedPatientId(patientsList[0].id);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch patients from database.');
    } finally {
      setFetchingPatients(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleUpload = async () => {
    if (!selectedPatientId || !testName || !selectedFile) {
      Alert.alert('Error', 'Please fill in all fields and select a PDF file.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload to Cloudinary using Base64 JSON payload
      const base64String = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      const base64File = 'data:application/pdf;base64,' + base64String;

      const response = await fetch('https://api.cloudinary.com/v1_1/dveoylowg/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file: base64File,
          upload_preset: 'yello_reports'
        })
      });

      const cloudinaryData = await response.json();

      if (!cloudinaryData.secure_url) {
        throw new Error('Cloudinary upload failed: secure_url missing');
      }

      const pdfUrl = cloudinaryData.secure_url;

      // 2. Save to Firestore
      const reportsRef = collection(db, 'test_reports');
      await addDoc(reportsRef, {
        patientId: selectedPatientId,
        testName,
        pdfUrl,
        uploadDate: new Date().toISOString()
      });

      Alert.alert('Success', 'Test report uploaded successfully!');

      // Reset form
      setTestName('');
      setSelectedFile(null);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload report. Please try again.');
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
        <Text style={styles.title}>Upload Test Report</Text>

        <ClayCard style={styles.form}>
          <Text style={styles.label}>Patient</Text>
          <View style={styles.pickerContainer}>
            {fetchingPatients ? (
              <Text style={{ padding: theme.spacing.md, color: isDarkMode ? '#FFFFFF' : theme.colors.textLight }}>Loading patients...</Text>
            ) : (
              <Picker
                selectedValue={selectedPatientId}
                onValueChange={(itemValue) => setSelectedPatientId(itemValue)}
                style={styles.picker}
              >
                {patients.map(patient => (
                  <Picker.Item
                    key={patient.id}
                    label={`${patient.name} (${patient.phoneNumber})`}
                    value={patient.id}
                  />
                ))}
              </Picker>
            )}
          </View>

          <Text style={styles.label}>Test Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Complete Blood Count (CBC)"
            placeholderTextColor={theme.colors.textLight}
            value={testName}
            onChangeText={setTestName}
          />

          <Text style={styles.label}>PDF Report File</Text>
          <View style={styles.fileContainer}>
            <Text
              style={styles.fileText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedFile ? selectedFile.name : 'No file selected'}
            </Text>
            <ClayButton
              title="Browse"
              onPress={handlePickDocument}
              variant="secondary"
              style={styles.browseButton}
              textStyle={{ fontSize: 14 }}
            />
          </View>

          <ClayButton
            title="Upload Report"
            onPress={handleUpload}
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
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingLeft: theme.spacing.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  fileText: {
    flex: 1,
    color: isDarkMode ? '#FFFFFF' : theme.colors.textLight,
    marginRight: theme.spacing.sm,
  },
  browseButton: {
    width: 'auto',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  }
});
