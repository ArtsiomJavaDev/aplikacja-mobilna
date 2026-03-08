import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { login, clearError } from '../../src/store/slices/authSlice';
import { useConnectivity } from '../../src/hooks/useConnectivity';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

const { width } = Dimensions.get('window');

export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const isConnected = useConnectivity();

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert('Błąd', 'Wpisz email i hasło');
      return;
    }
    if (!isConnected) {
      Alert.alert('Brak połączenia', 'Sprawdź połączenie z internetem.');
      return;
    }
    dispatch(clearError());
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  }, [email, password, dispatch, isConnected]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { width: width > 400 ? 360 : width - spacing.lg * 2 }]}>
          <Text style={styles.title}>Logowanie</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Hasło"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logowanie...' : 'Zaloguj'}</Text>
          </TouchableOpacity>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    color: colors.secondary,
    fontSize: 14,
  },
});
