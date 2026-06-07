import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';

export default function AdminSettingsScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl },
    title: { ...theme.typography.header, color: isDarkMode ? '#FFFFFF' : theme.colors.text, marginBottom: theme.spacing.xl },
    sectionTitle: { ...theme.typography.title, color: isDarkMode ? '#FFFFFF' : theme.colors.text, marginBottom: theme.spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    label: { ...theme.typography.body, color: isDarkMode ? '#FFFFFF' : theme.colors.text },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Admin Settings</Text>

      <ClayCard style={{ marginBottom: theme.spacing.xl }}>
        <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
        <View style={dynamicStyles.row}>
          <Text style={dynamicStyles.label}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>
      </ClayCard>

      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: theme.spacing.xl }}>
        <ClayButton 
          title="Logout" 
          variant="secondary"
          onPress={handleLogout} 
        />
      </View>
    </View>
  );
}
