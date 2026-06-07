import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayCard from '../components/ClayCard';

export default function BookTestScreen() {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Test</Text>
      <ClayCard>
        <Text style={styles.cardText}>Select a medical test.</Text>
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
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.title,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
  },
});
