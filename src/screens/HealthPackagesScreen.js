import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const PACKAGES = [
  {
    id: '1',
    name: 'Basic Full Body Checkup',
    description: 'A comprehensive checkup covering 50+ vital parameters including CBC, Lipid Profile, Thyroid, and Liver Function tests. Ideal for annual screening.',
    price: '₹ 1,499'
  },
  {
    id: '2',
    name: 'Comprehensive Master Health Profile',
    description: 'Advanced diagnostic screening with 80+ tests including Vitamin D, B12, advanced heart markers, and full organ panel. Recommended for age 40+.',
    price: '₹ 3,999'
  },
  {
    id: '3',
    name: "Women's Wellness Package",
    description: 'Specially designed for women. Includes hormonal profile, bone health (Calcium, Vitamin D), Iron studies, and general wellness tests.',
    price: '₹ 2,499'
  },
  {
    id: '4',
    name: 'Diabetes & Cardiac Care',
    description: 'Focused testing for blood sugar levels, HbA1c, complete lipid profile, and cardiac risk markers to monitor cardiovascular health.',
    price: '₹ 1,999'
  }
];

export default function HealthPackagesScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const handleBookPackage = (pkg) => {
    Alert.alert(
      "Confirm Booking",
      `Would you like to request the ${pkg.name}? Our reception will call you to schedule the sample collection.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Request", 
          onPress: () => {
            Alert.alert("Success", "Your request has been submitted. Our team will contact you shortly!");
            navigation.goBack();
          } 
        }
      ]
    );
  };

  const renderPackage = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      
      <Text style={styles.descriptionText}>{item.description}</Text>
      
      <View style={styles.footerContainer}>
        <Text style={styles.priceText}>{item.price}</Text>
        <TouchableOpacity 
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() => handleBookPackage(item)}
        >
          <Text style={styles.bookButtonText}>Book Package</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Health Packages</Text>
      <Text style={styles.headerSubtitle}>Curated comprehensive health checkups for you and your family.</Text>
      
      <FlatList
        data={PACKAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderPackage}
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
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.header,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    marginTop: theme.spacing.xl,
    fontSize: 26,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: isDarkMode ? '#CCCCCC' : theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    fontSize: 15,
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? '#332D15' : '#FFF8E1', // very light yellow
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    fontSize: 18,
    lineHeight: 24,
  },
  descriptionText: {
    ...theme.typography.body,
    color: isDarkMode ? '#CCCCCC' : '#555555',
    lineHeight: 22,
    marginBottom: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#333333' : '#EEEEEE',
    paddingTop: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bookButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 14,
  }
});
