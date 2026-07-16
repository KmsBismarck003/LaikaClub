import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getApiBaseUrl } from '../../services/apiClient';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications = null;
let Device = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.log('Error requiring notification modules:', e);
  }
}

export const useNotifications = (user) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!user || isExpoGo || !Notifications) return;

    const setupNotifications = async () => {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        setExpoPushToken(pushToken);
        if (pushToken) {
          const authToken = await AsyncStorage.getItem('token');
          if (authToken) {
            sendTokenToBackend(pushToken, authToken);
          }
        }
      } catch (err) {
        console.log('Push notifications not available:', err);
      }
    };

    setupNotifications();

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
    } catch (e) {
      console.log('Error adding notification listeners:', e);
    }

    return () => {
      if (notificationListener.current && Notifications) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current && Notifications) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const sendTokenToBackend = async (pushToken, authToken) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: pushToken, platform: Platform.OS }),
      });
      if (res.ok) {
        console.log('Push token successfully registered in backend:', pushToken);
      } else {
        console.log('Failed to register push token in backend:', res.status);
      }
    } catch (error) {
      console.log('Error al enviar push token al backend', error);
    }
  };

  return { expoPushToken, notification };
};

async function registerForPushNotificationsAsync() {
  if (isExpoGo || !Notifications || !Device) return null;

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
      console.log('Fallo al obtener permiso de notificaciones');
      return null;
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || 'laikaclub-project';
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.log('Error getting expo push token:', e);
      return null;
    }
  } else {
    console.log('Las notificaciones Push requieren dispositivo físico');
  }

  return token;
}

export default useNotifications;
