import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { checkAuth, logout } from '../src/store/slices/authSlice';
import { setOnUnauthorized } from '../src/api/client';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useAppDispatch } from '../src/hooks/useRedux';
import { PaperProvider } from 'react-native-paper';
import { colors } from '../src/theme/colors';

function RootLayoutNav(): React.JSX.Element {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    setOnUnauthorized(() => store.dispatch(logout()));
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Provider store={store}>
        <PaperProvider
          theme={{
            dark: false,
            colors: {
              primary: colors.primary,
              background: colors.background,
              surface: colors.surface,
              error: colors.error,
            },
          }}
        >
          <RootLayoutNav />
        </PaperProvider>
      </Provider>
    </ErrorBoundary>
  );
}
