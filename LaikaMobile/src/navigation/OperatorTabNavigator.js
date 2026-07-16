import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QrCode, LayoutDashboard } from 'lucide-react-native';

import QRScannerScreen from '../features/operator/QRScannerScreen';
import OperatorDashboardScreen from '../features/operator/OperatorDashboardScreen';

const Tab = createBottomTabNavigator();

export default function OperatorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OperatorDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Escanear"
        component={QRScannerScreen}
        options={{
          tabBarIcon: ({ color, size }) => <QrCode color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
