import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../src/hooks/useRedux';
import { useLocation } from '../../src/hooks/useLocation';
import FadeInScreen from '../../src/components/FadeInScreen';
import haptics from '../../src/utils/haptics';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

export default function HomeScreen(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { user } = useAppSelector((s) => s.auth);
  const { result, status, requestLocation } = useLocation();

  return (
    <FadeInScreen>
      <ScrollView
        contentContainerStyle={[styles.container, { minHeight: height }]}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, width > 400 && { maxWidth: 420, alignSelf: 'center' }]}>
          <Text style={styles.title}>Witaj, {user?.email?.split('@')[0] ?? 'użytkowniku'}</Text>
          <Text style={styles.subtitle}>Platforma wymiany kryptowalut i walut</Text>

          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Lokalizacja</Text>
            </View>
            {status === 'loading' && (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />
            )}
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
            <TouchableOpacity
              style={styles.locationButton}
              onPress={async () => {
                await haptics.mediumTap();
                requestLocation();
              }}
              disabled={status === 'loading'}
              activeOpacity={0.85}
            >
              <Text style={styles.locationButtonText}>
                {status === 'loading' ? 'Pobieranie...' : 'Pobierz moją lokalizację'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={async () => {
                await haptics.lightTap();
                router.push('/(tabs)/crypto');
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="bitcoin" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Kursy kryptowalut</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={async () => {
                await haptics.lightTap();
                router.push('/(tabs)/orders');
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="format-list-bulleted" size={24} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Moje zamówienia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </FadeInScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  locationSection: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  locationText: { fontSize: 13, color: colors.textSecondary },
  locationDenied: { fontSize: 13, color: colors.error, marginVertical: 4 },
  locationButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  locationButtonText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  actions: { gap: spacing.md },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
