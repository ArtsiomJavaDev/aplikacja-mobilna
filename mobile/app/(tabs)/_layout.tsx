import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../src/hooks/useRedux';
import { colors } from '../../src/theme/colors';

export default function TabsLayout(): React.JSX.Element {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary, shadowOpacity: 0 },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerTitle: 'CryptoWallet',
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dom',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="crypto"
          options={{
            title: 'Krypto',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="newspaper-variant-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Zamowienia',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
