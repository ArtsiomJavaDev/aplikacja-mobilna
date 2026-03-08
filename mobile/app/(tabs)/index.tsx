import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { logout } from '../../src/store/slices/authSlice';
import { useLocation } from '../../src/hooks/useLocation';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

export default function HomeScreen(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { result, status, requestLocation } = useLocation();

  const handleLogout = (): void => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { minHeight: height }]}
      style={styles.scroll}
    >
      <View style={[styles.card, width > 400 && { maxWidth: 400, alignSelf: 'center' }]}>
        <Text style={styles.title}>Witaj, {user?.email ?? 'użytkowniku'}</Text>
        <Text style={styles.subtitle}>Platforma wymiany kryptowalut i walut</Text>

        {/* Lokalizacja z obsługą uprawnień */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Lokalizacja</Text>
          {status === 'loading' && <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />}
          {result?.status === 'granted' && (
            <Text style={styles.locationText}>
              {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
            </Text>
          )}
          {result?.status === 'denied' && (
            <Text style={styles.locationDenied}>{result.message}</Text>
          )}
          {result?.status === 'error' && (
            <Text style={styles.locationDenied}>{result.message}</Text>
          )}
          <TouchableOpacity style={styles.locationButton} onPress={requestLocation} disabled={status === 'loading'}>
            <Text style={styles.locationButtonText}>
              {status === 'loading' ? 'Pobieranie...' : 'Pobierz moją lokalizację'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/crypto')}
          >
            <Text style={styles.primaryButtonText}>Kursy kryptowalut</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Text style={styles.secondaryButtonText}>Moje zamówienia</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  locationSection: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationText: { fontSize: 12, color: colors.textSecondary },
  locationDenied: { fontSize: 12, color: colors.error, marginVertical: 4 },
  locationButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  locationButtonText: { color: colors.secondary, fontSize: 14 },
  buttons: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
  },
});
