import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, CartProvider } from './src/context';

// Import screens from barrel file
import {
  ServerConfigScreen,
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  EventDetailScreen,
  CartScreen,
  UserProfileScreen,
  UserDashboardScreen,
  UserTicketsScreen,
  UserHistoryScreen,
  AchievementsScreen,
  AdminDashboardScreen,
  AdminEventsScreen,
  AdminVenuesScreen,
  AdminUsersScreen,
  AdminAdsScreen,
  ManagerDashboardScreen,
  ManagerEventsScreen,
  ManagerEventFormScreen,
  ManagerAnalyticsScreen,
  ManagerTransactionsScreen,
  ManagerAttendeesScreen,
  ManagerAdsScreen,
} from './src/screens';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#ffffff' },
            }}
          >
            {/* User Public Screens */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            
            {/* User Personal Console Screens */}
            <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
            <Stack.Screen name="UserTickets" component={UserTicketsScreen} />
            <Stack.Screen name="UserHistory" component={UserHistoryScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />

            {/* Auth Screens */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* Shared Utility Screens */}
            <Stack.Screen name="ServerConfig" component={ServerConfigScreen} />

            {/* Admin Console Screens */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
            <Stack.Screen name="AdminVenues" component={AdminVenuesScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminAds" component={AdminAdsScreen} />

            {/* Manager Console Screens */}
            <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
            <Stack.Screen name="ManagerEvents" component={ManagerEventsScreen} />
            <Stack.Screen name="ManagerEventForm" component={ManagerEventFormScreen} />
            <Stack.Screen name="ManagerAnalytics" component={ManagerAnalyticsScreen} />
            <Stack.Screen name="ManagerTransactions" component={ManagerTransactionsScreen} />
            <Stack.Screen name="ManagerAttendees" component={ManagerAttendeesScreen} />
            <Stack.Screen name="ManagerAds" component={ManagerAdsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
