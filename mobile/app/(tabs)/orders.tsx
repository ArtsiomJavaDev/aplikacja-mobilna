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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { fetchMyOrders } from '../../src/store/slices/ordersSlice';
import type { OrderDTO, OrderStatus } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

function statusStyle(s: OrderStatus): { bg: string; color: string } {
  switch (s) {
    case 'COMPLETED':
      return { bg: colors.successLight, color: colors.success };
    case 'CANCELLED':
      return { bg: colors.warningLight, color: colors.warning };
    case 'PENDING_PAYMENT':
    case 'PENDING_CONFIRMATION':
      return { bg: colors.surfaceLight, color: colors.textSecondary };
    default:
      return { bg: colors.primary + '18', color: colors.primary };
  }
}

function OrderCard({ item }: { item: OrderDTO }): React.JSX.Element {
  const { bg, color } = statusStyle(item.status);
  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('pl-PL') : '—';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.currencyCode}>{item.currencyCode}</Text>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Text style={[styles.badgeText, { color }]}>{item.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>Ilość</Text>
          <Text style={styles.value}>{item.amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Suma</Text>
          <Text style={styles.value}>{item.totalPrice?.toFixed(2) ?? '—'} PLN</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
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
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
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
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="cart-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>Brak zamówień</Text>
            </View>
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
  errorText: { color: colors.error, textAlign: 'center', marginTop: spacing.md },
  offlineBanner: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    alignItems: 'center',
  },
  offlineText: { color: colors.warning, fontSize: 12, fontWeight: '500' },
  listContent: { padding: spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currencyCode: { fontSize: 18, fontWeight: '700', color: colors.text },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  rows: { gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, color: colors.textSecondary },
  value: { fontSize: 14, color: colors.text, fontWeight: '600' },
  loadingContainer: { padding: spacing.xl, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingTop: spacing.xl * 2 },
  emptyText: { color: colors.textSecondary, marginTop: spacing.md, fontSize: 16 },
});
