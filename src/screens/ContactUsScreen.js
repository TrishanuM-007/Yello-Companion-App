import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayCard from '../components/ClayCard';

export default function ContactUsScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <ClayCard>
        <Text style={styles.cardText}>Phone: +1 234 567 8900</Text>
        <Text style={styles.cardText}>Email: yellomedi@gmail.com</Text>
        <Text style={styles.cardText}>Address: 123 Health Ave, Wellness City</Text>
      </ClayCard>
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
    marginBottom: theme.spacing.lg,
  },
  cardText: {
    ...theme.typography.body,
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
  },
});
