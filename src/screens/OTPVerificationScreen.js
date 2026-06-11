import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ClayButton from '../components/ClayButton';
import ClayCard from '../components/ClayCard';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function OTPVerificationScreen({ route, navigation }) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme, isDarkMode);
  
  const { verificationId, phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // In a real production app using EAS build, you would use @react-native-firebase/auth here.
      // For Expo Go using the JS SDK without the deprecated recaptcha wrapper, we simulate Phone Auth 
      // by seamlessly mapping the phone number to a mock email. 
      // Accept any OTP (e.g. '123456') for testing since SMS is bypassed.
      
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const mockEmail = `${cleanPhone}@yello-test.app`;
      const mockPassword = `yello-pass-${cleanPhone}`;
      
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, mockEmail, mockPassword);
      } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          userCredential = await createUserWithEmailAndPassword(auth, mockEmail, mockPassword);
        } else {
          throw err;
        }
      }
      
      const user = userCredential.user;

      const userDocRef = doc(db, 'patients', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        navigation.reset({ index: 0, routes: [{ name: 'MainDrawer' }] });
      } else {
        navigation.navigate('ProfileSetup');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phoneNumber}</Text>

      <ClayCard style={{ width: '100%' }}>
        <Text style={styles.label}>One-Time Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <ClayButton 
          title="Verify"
          onPress={handleVerifyOTP}
          loading={loading}
          style={{ marginBottom: theme.spacing.md }}
        />
        
        <ClayButton 
          title="Go Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
          disabled={loading}
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
    fontSize: 24, // Larger font for OTP
    letterSpacing: 8,
    textAlign: 'center',
    color: isDarkMode ? '#FFFFFF' : theme.colors.text,
    backgroundColor: theme.colors.background,
  },
});
