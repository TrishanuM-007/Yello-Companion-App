import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when the app is in the foreground
if (Constants.appOwnership !== 'expo') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  if (Constants.appOwnership === 'expo') {
    console.warn('Running in Expo Go: Bypassing Push Notifications');
    return 'EXPO_GO_DUMMY_TOKEN';
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      token = tokenData.data;
      console.log('Push Token:', tokenData.data);
    } catch (e) {
      console.warn('Push notifications are not supported in Expo Go. Returning dummy token.');
      token = 'EXPO_GO_DUMMY_TOKEN';
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleAppointmentReminder(title, dateString, timeString) {
  if (Constants.appOwnership === 'expo') {
    return;
  }

  try {
    if (!dateString || !timeString) return;

    // Parse dateString (e.g. "2024-05-12" or similar) and timeString (e.g. "10:30 AM")
    const dateObj = new Date(`${dateString} ${timeString}`);
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      console.log('Invalid date/time for notification:', dateString, timeString);
      return;
    }

    // Subtract 30 minutes
    const triggerTime = new Date(dateObj.getTime() - 30 * 60000);

    // If trigger time is in the future
    if (triggerTime > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming Appointment',
          body: `Your appointment for ${title} is in 30 minutes!`,
          sound: true,
        },
        trigger: { date: triggerTime },
      });
      console.log(`Scheduled local notification for ${title} at ${triggerTime.toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
}

export async function sendPushNotification(expoPushToken, title, body) {
  if (!expoPushToken || expoPushToken === 'EXPO_GO_DUMMY_TOKEN') {
    console.log('Skipping push notification (invalid or dummy token)');
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    console.log(`Push notification sent to ${expoPushToken}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
