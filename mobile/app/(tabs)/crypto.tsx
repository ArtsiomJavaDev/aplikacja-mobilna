import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { fetchCrypto } from '../../src/store/slices/cryptoSlice';
import { createOrder } from '../../src/store/slices/ordersSlice';
import { useConnectivity } from '../../src/hooks/useConnectivity';
import type { CryptoItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

function CryptoCard({
  item,
  onOrder,
  creating,
}: {
  item: CryptoItem;
  onOrder: (symbol: string, amount: number) => void;
  creating: boolean;
}): React.JSX.Element {
  const [amount, setAmount] = React.useState('');
  const discount = ((item.marketPrice - item.sellPrice) / item.marketPrice) * 100;
  const discountStr = discount.toFixed(1);
  const isPositive = true;

  const handleOrder = (): void => {
    const num = parseFloat(amount);
    if (num > 0) {
      onOrder(item.symbol, num);
      setAmount('');
    } else {
      Alert.alert('Błąd', 'Podaj poprawną ilość');
    }
  };

  const initial = item.symbol.charAt(0);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconLetter}>{initial}</Text>
        </View>
        <View style={styles.cardMiddle}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.symbol}>{item.symbol}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>
            ${item.marketPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.changeRow}>
            <MaterialCommunityIcons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={isPositive ? colors.success : colors.error}
            />
            <Text style={[styles.changeText, isPositive ? styles.changeUp : styles.changeDown]}>
              ~{discountStr}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!creating}
        />
      </View>
      <TouchableOpacity
        style={[styles.sellBtn, creating && styles.sellBtnDisabled]}
        onPress={handleOrder}
        disabled={creating}
        activeOpacity={0.85}
      >
        <Text style={styles.sellBtnText}>SPRZEDAJ NAM</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CryptoScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { list, loading, error, fromCache } = useAppSelector((s) => s.crypto);
  const { createLoading } = useAppSelector((s) => s.orders);
  const isConnected = useConnectivity();

  const load = useCallback(() => {
    dispatch(fetchCrypto());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOrder = useCallback(
    (symbol: string, amount: number) => {
      if (!isConnected) {
        Alert.alert('Brak połączenia', 'Operacja wymaga internetu.');
        return;
      }
      dispatch(createOrder({ currencyCode: symbol, amount }));
    },
    [dispatch, isConnected]
  );

  const renderItem = useCallback(
    ({ item }: { item: CryptoItem }) => (
      <CryptoCard item={item} onOrder={handleOrder} creating={createLoading} />
    ),
    [handleOrder, createLoading]
  );

  const keyExtractor = useCallback((item: CryptoItem) => item.id, []);

  const listContent = useMemo(
    () => ({
      padding: spacing.md,
      paddingBottom: 100,
    }),
    []
  );

  if (error && list.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fromCache && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Dane z pamięci podręcznej (offline)</Text>
        </View>
      )}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Skupujemy kryptowaluty</Text>
      </View>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={listContent}
        key={width > 400 ? 'wide' : 'narrow'}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: { color: colors.error, marginBottom: spacing.md, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  offlineBanner: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    alignItems: 'center',
  },
  offlineText: { color: colors.warning, fontSize: 12, fontWeight: '500' },
  sectionHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...cardShadow,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardMiddle: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  symbol: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: colors.text },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  changeText: { fontSize: 12, fontWeight: '600' },
  changeUp: { color: colors.success },
  changeDown: { color: colors.error },
  inputRow: { marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sellBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sellBtnDisabled: { opacity: 0.6 },
  sellBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  loadingContainer: { padding: spacing.xl, alignItems: 'center' },
});
