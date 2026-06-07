import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayButton from '../components/ClayButton';
import ClayCard from '../components/ClayCard';
import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function DoctorDetailsScreen({ route, navigation }) {
  const { doctor } = route.params;
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const [loading, setLoading] = useState(false);

  const requestBooking = async () => {
    const patientId = auth.currentUser?.uid;
    if (!patientId) {
      Alert.alert('Error', 'You must be logged in to request an appointment.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'booking_requests'), {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        patientId: patientId,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Appointment requested successfully! Our reception will contact you soon.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error requesting booking:', error);
      Alert.alert('Error', 'Failed to request appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Doctor Details</Text>
      
      <ClayCard style={styles.infoCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{doctor.name.charAt(0)}</Text>
        </View>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <Text style={styles.experience}>{doctor.experience} Years Experience</Text>
        
        {doctor.about && (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutText}>{doctor.about}</Text>
          </View>
        )}
      </ClayCard>

      <ClayButton 
        title="Request Booking" 
        onPress={requestBooking}
        loading={loading}
        style={styles.requestButton}
      />
    </ScrollView>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  headerTitle: {
    ...theme.typography.header,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 28,
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  doctorName: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  specialty: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  experience: {
    ...theme.typography.caption,
    color: isDarkMode ? '#CCCCCC' : theme.colors.textLight,
    fontSize: 14,
  },
  aboutContainer: {
    marginTop: theme.spacing.lg,
    width: '100%',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#333333' : '#EEEEEE',
  },
  aboutTitle: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  aboutText: {
    ...theme.typography.body,
    color: isDarkMode ? '#AAAAAA' : '#555555',
    lineHeight: 22,
  },
  requestButton: {
    marginTop: theme.spacing.md,
  }
});
