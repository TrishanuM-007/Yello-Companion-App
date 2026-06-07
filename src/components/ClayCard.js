import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ClayCard({ children, style }) {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={[styles.card, {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.clayHighlight,
      borderLeftColor: theme.colors.clayHighlight,
      borderBottomColor: theme.colors.clayShadow,
      borderRightColor: theme.colors.clayShadow,
    }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    padding: 24,
    width: '100%',
  }
});
