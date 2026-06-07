import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ClayButton({ title, onPress, loading, style, textStyle, variant = 'primary' }) {
  const { theme, isDarkMode } = useTheme();

  // Highlight logic for the puffy button look
  const bgColor = variant === 'primary' ? theme.colors.primary : theme.colors.surface;
  
  // Custom clay edge colors depending on the variant
  let topColor, bottomColor;
  if (variant === 'primary') {
    topColor = '#FFE766';
    bottomColor = '#CCAC00';
  } else {
    topColor = theme.colors.clayHighlight;
    bottomColor = theme.colors.clayShadow;
  }

  return (
    <TouchableOpacity 
      style={[styles.button, {
        backgroundColor: bgColor,
        borderTopColor: topColor,
        borderLeftColor: topColor,
        borderBottomColor: bottomColor,
        borderRightColor: bottomColor,
      }, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <Text style={[styles.text, { color: isDarkMode ? '#FFFFFF' : theme.colors.text }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
