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
} from 'react-native';
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
  const discount = ((item.marketPrice - item.sellPrice) / item.marketPrice * 100).toFixed(1);

  const handleOrder = (): void => {
    const num = parseFloat(amount);
    if (num > 0) {
      onOrder(item.symbol, num);
      setAmount('');
    } else {
      Alert.alert('Błąd', 'Podaj poprawną ilość');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name} ({item.symbol})</Text>
        <Text style={styles.discount}>-{discount}%</Text>
      </View>
      <Text style={styles.price}>Rynek: ${item.marketPrice.toLocaleString()}</Text>
      <Text style={styles.sellPrice}>Skup: ${item.sellPrice.toLocaleString()}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Ilość"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!creating}
        />
        <TouchableOpacity
          style={[styles.orderBtn, creating && styles.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={creating}
        >
          <Text style={styles.orderBtnText}>Zamów</Text>
        </TouchableOpacity>
      </View>
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

  const listContent = useMemo(() => ({
    padding: spacing.md,
    paddingBottom: 80,
  }), []);

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
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  offlineBanner: {
    backgroundColor: colors.warning,
    padding: spacing.sm,
    alignItems: 'center',
  },
  offlineText: { color: '#000', fontSize: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  discount: { fontSize: 12, color: colors.success },
  price: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  sellPrice: { fontSize: 14, color: colors.success, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    fontSize: 14,
  },
  orderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: '#fff', fontWeight: '600' },
  loadingContainer: { padding: spacing.xl, alignItems: 'center' },
});
