import React from 'react';
import { Tabs } from 'expo-router';
import { Redirect } from 'expo-router';
import { useAppSelector } from '../../src/hooks/useRedux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout(): React.JSX.Element {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#f8fafc',
        tabBarStyle: { backgroundColor: '#1e293b' },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Start',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="crypto"
        options={{
          title: 'Kryptowaluty',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bitcoin" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Zamówienia',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
