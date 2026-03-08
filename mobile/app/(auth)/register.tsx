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
import { register, clearError } from '../../src/store/slices/authSlice';
import { useConnectivity } from '../../src/hooks/useConnectivity';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

const { width } = Dimensions.get('window');

export default function RegisterScreen(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const isConnected = useConnectivity();

  const handleRegister = useCallback(async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    if (!isConnected) {
      Alert.alert('Brak połączenia', 'Sprawdź połączenie z internetem.');
      return;
    }
    dispatch(clearError());
    const result = await dispatch(register({ username: username.trim(), email: email.trim(), password }));
    if (register.fulfilled.match(result)) {
      Alert.alert('Sukces', 'Konto utworzone. Zaloguj się.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  }, [username, email, password, dispatch, isConnected]);

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
          <Text style={styles.title}>Rejestracja</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Nazwa użytkownika"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />
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
            placeholder="Hasło (min. 6 znaków)"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Rejestracja...' : 'Zarejestruj'}</Text>
          </TouchableOpacity>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>Masz konto? Zaloguj się</Text>
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
