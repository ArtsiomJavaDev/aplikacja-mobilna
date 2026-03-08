import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen(): React.JSX.Element {
  return (
    <>
      <Stack.Screen options={{ title: 'Nie znaleziono' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>Ta strona nie istnieje.</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Strona główna</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
