import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { fetchMyOrders } from '../../src/store/slices/ordersSlice';
import type { OrderDTO } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

function OrderCard({ item }: { item: OrderDTO }): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Waluta</Text>
        <Text style={styles.value}>{item.currencyCode}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Ilość</Text>
        <Text style={styles.value}>{item.amount}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Suma</Text>
        <Text style={styles.value}>{item.totalPrice?.toFixed(2) ?? '-'} PLN</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, styles.status]}>{item.status}</Text>
      </View>
    </View>
  );
}

export default function OrdersScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { myOrders, loading, error, fromCache } = useAppSelector((s) => s.orders);

  const load = useCallback(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = useCallback(({ item }: { item: OrderDTO }) => <OrderCard item={item} />, []);
  const keyExtractor = useCallback((item: OrderDTO) => String(item.id), []);

  if (error && myOrders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
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
        data={myOrders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        key={width > 400 ? 'wide' : 'narrow'}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <Text style={styles.emptyText}>Brak zamówień</Text>
          )
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
  errorText: { color: colors.error, textAlign: 'center' },
  offlineBanner: {
    backgroundColor: colors.warning,
    padding: spacing.sm,
    alignItems: 'center',
  },
  offlineText: { color: '#000', fontSize: 12 },
  listContent: { padding: spacing.md, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, color: colors.textSecondary },
  value: { fontSize: 14, color: colors.text, fontWeight: '500' },
  status: { textTransform: 'uppercase' },
  loadingContainer: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
