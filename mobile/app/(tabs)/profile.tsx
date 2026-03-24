import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { logout } from '../../src/store/slices/authSlice';
import FadeInScreen from '../../src/components/FadeInScreen';
import haptics from '../../src/utils/haptics';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

export default function ProfileScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(16)).current;
  const adminScale = useRef(new Animated.Value(1)).current;
  const logoutScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY]);

  const handleLogout = async (): Promise<void> => {
    await haptics.warning();
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  const scaleIn = (scale: Animated.Value): void => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const scaleOut = (scale: Animated.Value): void => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
      <FadeInScreen>
        <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: 100 }]}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
        >
          <Animated.View
              style={[
                styles.card,
                width > 400 && { maxWidth: 420, alignSelf: 'center' },
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
          >
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {user?.email?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </View>
              <Text style={styles.email}>{user?.email ?? '—'}</Text>
              {user?.role && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user.role}</Text>
                  </View>
              )}
            </View>

            {user?.role === 'ROLE_ADMIN' && (
                <Animated.View style={{ transform: [{ scale: adminScale }], width: '100%' }}>
                  <TouchableOpacity
                      style={styles.adminButton}
                      onPress={() => router.push('/admin')}
                      activeOpacity={0.85}
                      onPressIn={() => scaleIn(adminScale)}
                      onPressOut={() => scaleOut(adminScale)}
                  >
                    <MaterialCommunityIcons name="shield-account" size={22} color="#fff" />
                    <Text style={styles.adminButtonText}>Panel administratora</Text>
                  </TouchableOpacity>
                </Animated.View>
            )}

            <Animated.View style={{ transform: [{ scale: logoutScale }], width: '100%' }}>
              <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.85}
                  onPressIn={() => scaleIn(logoutScale)}
                  onPressOut={() => scaleOut(logoutScale)}
              >
                <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
                <Text style={styles.logoutText}>Wyloguj</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </FadeInScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLetter: { fontSize: 32, fontWeight: '700', color: '#fff' },
  email: { fontSize: 16, color: colors.text, fontWeight: '600' },
  roleBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  roleText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: spacing.md,
    width: '100%',
  },
  adminButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '600' },
});