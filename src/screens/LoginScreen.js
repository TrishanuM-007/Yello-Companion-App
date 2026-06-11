import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayButton from '../components/ClayButton';
import ClayCard from '../components/ClayCard';
import { auth } from '../config/firebase';
import { PhoneAuthProvider } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number with country code (e.g. +1234567890)');
      return;
    }
    
    setLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // Development Bypass Check
      if (cleanNumber === '11234567890') {
        navigation.navigate('OTPVerification', { verificationId: 'DEV_BYPASS', phoneNumber: formattedPhoneNumber });
        setLoading(false);
        return;
      }

      // Normal Verification Flow
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(formattedPhoneNumber, null);
      
      navigation.navigate('OTPVerification', { verificationId, phoneNumber: formattedPhoneNumber });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to process phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Yello</Text>
      <Text style={styles.subtitle}>Patient Login</Text>

      <ClayCard style={{ width: '100%' }}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="+1 234 567 8900"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <ClayButton 
          title="Send OTP"
          onPress={handleSendOTP}
          loading={loading}
        />
      </ClayCard>
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
  label: {
    ...theme.typography.body,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    backgroundColor: theme.colors.background,
  },
});
