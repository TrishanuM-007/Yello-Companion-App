import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayCard from '../components/ClayCard';

const SPECIALTIES = [
  'Gynecologist',
  'Pediatrician',
  'Radiology',
  'Psychiatrist',
  'Physiology',
  'General Physician'
];

export default function BookAppointmentScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const renderSpecialty = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PatientDoctorListScreen', { specialty: item })}
    >
      <ClayCard style={styles.card}>
        <Text style={styles.cardText}>{item}</Text>
        <Text style={styles.arrow}>{'›'}</Text>
      </ClayCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      <Text style={styles.subtitle}>Select a specialty to find a doctor.</Text>
      
      <FlatList
        data={SPECIALTIES}
        keyExtractor={item => item}
        renderItem={renderSpecialty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.header,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: isDarkMode ? '#FFFFFF' : theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  cardText: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
