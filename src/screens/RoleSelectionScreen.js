import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayButton from '../components/ClayButton';

export default function RoleSelectionScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Yello</Text>
      <Text style={styles.subtitle}>Please select your role to continue</Text>

      <ClayButton 
        title="I am a Patient"
        onPress={() => navigation.navigate('Login')}
        style={{ marginBottom: theme.spacing.lg }}
      />

      <ClayButton 
        title="Clinic Admin"
        variant="secondary"
        onPress={() => navigation.navigate('AdminLogin')}
      />
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.header,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: isDarkMode ? '#FFFFFF' : theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
});
