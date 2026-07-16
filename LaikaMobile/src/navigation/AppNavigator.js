import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import useNotifications from '../features/notifications/useNotifications';

// Auth Screens
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import ServerConfigScreen from '../features/auth/ServerConfigScreen';

// Navigators
import UserTabNavigator from './UserTabNavigator';
import OperatorTabNavigator from './OperatorTabNavigator';

// Additional Stacks
import EventDetailScreen from '../features/events/EventDetailScreen';
import CartScreen from '../features/tickets/CartScreen';
import UserDashboardScreen from '../features/auth/UserDashboardScreen';
import UserHistoryScreen from '../features/tickets/UserHistoryScreen';
import AchievementsScreen from '../features/auth/AchievementsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isAuthenticated, loading } = useAuth();
  useNotifications(user); // Initializes push notifications if user is logged in


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }}>
      {!isAuthenticated() ? (
        // Auth Stack
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ServerConfig" component={ServerConfigScreen} />
        </Stack.Group>
      ) : (
        // Main App based on Role
        <Stack.Group>
          {user?.role === 'operador' ? (
             <Stack.Screen name="OperatorApp" component={OperatorTabNavigator} />
          ) : (
             <Stack.Screen name="UserApp" component={UserTabNavigator} />
          )}

          {/* Shared Inner Screens */}
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
          <Stack.Screen name="UserHistory" component={UserHistoryScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
