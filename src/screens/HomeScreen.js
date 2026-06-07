import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SERVICES = [
  {
    id: '1',
    title: 'Doctor Consultations',
    icon: 'stethoscope',
    iconFamily: 'FontAwesome5',
    action: 'BookAppointment',
    params: { screen: 'PatientDoctorListScreen', params: { specialty: 'General Physician' } }
  },
  {
    id: '2',
    title: 'Obstetrics & Gynaecology',
    icon: 'baby',
    iconFamily: 'FontAwesome5',
    action: 'BookAppointment',
    params: { screen: 'PatientDoctorListScreen', params: { specialty: 'Gynecologist' } }
  },
  {
    id: '3',
    title: 'Pediatric Care',
    icon: 'child',
    iconFamily: 'FontAwesome5',
    action: 'BookAppointment',
    params: { screen: 'PatientDoctorListScreen', params: { specialty: 'Pediatrician' } }
  },
  {
    id: '4',
    title: 'Dental Care',
    icon: 'tooth',
    iconFamily: 'FontAwesome5',
    action: 'BookAppointment',
    params: { screen: 'PatientDoctorListScreen', params: { specialty: 'Dentist' } }
  },
  {
    id: '5',
    title: 'Lab Tests & Pathology',
    icon: 'microscope',
    iconFamily: 'FontAwesome5',
    action: 'BookTest',
    params: {}
  },
  {
    id: '6',
    title: 'Radiology & Scans',
    icon: 'x-ray',
    iconFamily: 'FontAwesome5',
    action: 'BookAppointment',
    params: { screen: 'PatientDoctorListScreen', params: { specialty: 'Radiology' } }
  },
  {
    id: '7',
    title: 'Health Packages',
    icon: 'heartbeat',
    iconFamily: 'FontAwesome5',
    action: 'HealthPackages',
    params: {}
  }
];

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);
  
  const [patientName, setPatientName] = useState('Guest');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'patients', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPatientName(data.name || 'Patient');
          }
        } catch (error) {
          console.error('Error fetching patient profile:', error);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleServicePress = (service) => {
    navigation.navigate(service.action, service.params);
  };

  const renderIcon = (service) => {
    if (service.iconFamily === 'FontAwesome5') {
      return <FontAwesome5 name={service.icon} size={32} color={theme.colors.primary} />;
    } else if (service.iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={service.icon} size={32} color={theme.colors.primary} />;
    }
    return <Ionicons name={service.icon} size={32} color={theme.colors.primary} />;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.greetingText}>Hello, {patientName}</Text>
        <Text style={styles.subGreeting}>How can we help you today?</Text>
      </View>

      {/* Emergency Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Your Health, Our Priority</Text>
          <View style={styles.bannerRow}>
            <Ionicons name="call" size={16} color="#1A1A1A" style={{ marginRight: 6 }} />
            <Text style={styles.bannerSubtext}>24/7 Emergency Aid: +91 9002 10 9002</Text>
          </View>
        </View>
      </View>

      {/* Services Grid Section */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        
        <View style={styles.gridContainer}>
          {SERVICES.map((service) => (
            <TouchableOpacity 
              key={service.id} 
              style={styles.cardContainer}
              activeOpacity={0.8}
              onPress={() => handleServicePress(service)}
            >
              <View style={styles.cardIconContainer}>
                {renderIcon(service)}
              </View>
              <Text style={styles.cardText} numberOfLines={2}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
    paddingBottom: theme.spacing.md,
  },
  greetingText: {
    ...theme.typography.header,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 28,
    marginBottom: 4,
  },
  subGreeting: {
    ...theme.typography.body,
    color: isDarkMode ? '#CCCCCC' : theme.colors.textLight,
    fontSize: 16,
  },
  bannerContainer: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: theme.spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bannerContent: {
    alignItems: 'flex-start',
  },
  bannerTitle: {
    ...theme.typography.title,
    color: '#1A1A1A', // keep black on yellow banner
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bannerSubtext: {
    ...theme.typography.body,
    color: '#1A1A1A', // keep black on yellow banner
    fontWeight: '700',
    fontSize: 13,
  },
  servicesSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 20,
    marginBottom: theme.spacing.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2, // 2-column grid
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: isDarkMode ? '#332D15' : '#FFF8E1', // Subtle yellow background for icon
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardText: {
    ...theme.typography.body,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  }
});
