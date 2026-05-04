import React, { useEffect, useCallback, useMemo, useState } from 'react';
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
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { fetchCrypto } from '../../src/store/slices/cryptoSlice';
import { createOrder } from '../../src/store/slices/ordersSlice';
import { useConnectivity } from '../../src/hooks/useConnectivity';
import type { CryptoItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

/* ────────────────────────── Chart Data ────────────────────────── */

interface ChartDataPoint {
  time: string;
  price: number;
}

/* ────────────────────────── CryptoCard ────────────────────────── */

function CryptoCard({
  item,
  onOrder,
  creating,
  index,
  cardWidth,
}: {
  item: CryptoItem;
  onOrder: (symbol: string, amount: number) => void;
  creating: boolean;
  index: number;
  cardWidth: number;
}): React.JSX.Element {
  const [amount, setAmount] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(16)).current;

  // Use real 24h change from backend
  const change24h = item.priceChangePercent24h ?? 0;
  const isPositive = change24h >= 0;
  const changeColor = isPositive ? '#16a34a' : '#dc2626';
  const changeBg = isPositive ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, index]);

  const handleOrder = (): void => {
    const num = parseFloat(amount);
    if (num > 0) {
      onOrder(item.symbol, num);
      setAmount('');
    } else {
      Alert.alert('Błąd', 'Podaj poprawną ilość');
    }
  };

  const toggleChart = async () => {
    if (!showChart && chartData.length === 0) {
      setLoadingChart(true);
      try {
        const resp = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${item.symbol}USDT&interval=1h&limit=24`
        );
        const raw = await resp.json();
        const formatted: ChartDataPoint[] = raw.map((k: unknown[]) => {
          const d = new Date(k[0] as number);
          return {
            time: `${d.getHours().toString().padStart(2, '0')}:00`,
            price: parseFloat(k[4] as string), // close price
          };
        });
        setChartData(formatted);
      } catch (err) {
        console.warn('Chart fetch failed', err);
      } finally {
        setLoadingChart(false);
      }
    }
    setShowChart((prev) => !prev);
  };

  const initial = item.symbol.charAt(0);

  // Format price nicely
  const formatPrice = (p: number) =>
    p >= 1
      ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Decorative blurred circle */}
      <View style={[styles.decorCircle, { backgroundColor: changeBg }]} />

      {/* Header row */}
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: isPositive ? '#16a34a' : '#dc2626' }]}>
          <Text style={styles.iconLetter}>{initial}</Text>
        </View>
        <View style={styles.cardMiddle}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.symbol}>{item.symbol}</Text>
        </View>
        <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
          <MaterialCommunityIcons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={14}
            color={changeColor}
          />
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isPositive ? '+' : ''}{change24h.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Price block */}
      <View style={styles.priceBlock}>
        <Text style={styles.priceMain}>${formatPrice(item.marketPrice)}</Text>
        <Text style={styles.priceSub}>
          Skupujemy po: ${formatPrice(item.sellPrice)}
        </Text>
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputPrefix}>{item.symbol}</Text>
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
          <Text style={styles.sellBtnText}>Sprzedaj</Text>
        </TouchableOpacity>
      </View>

      {/* Chart toggle */}
      <TouchableOpacity style={styles.chartToggle} onPress={toggleChart} activeOpacity={0.7}>
        <MaterialCommunityIcons name="chart-line" size={16} color={colors.textSecondary} />
        <Text style={styles.chartToggleText}>Wykres 24h</Text>
        <MaterialCommunityIcons
          name={showChart ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Chart */}
      {showChart && (
        <View style={styles.chartContainer}>
          {loadingChart ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : chartData.length > 0 ? (
            <LineChart
              data={{
                labels: chartData.filter((_, i) => i % 4 === 0).map((d) => d.time),
                datasets: [{ data: chartData.map((d) => d.price) }],
              }}
              width={cardWidth - spacing.md * 2 - 8}
              height={160}
              withInnerLines={false}
              withOuterLines={false}
              withDots={false}
              withShadow={false}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalCount: 2,
                color: () => changeColor,
                labelColor: () => colors.textMuted,
                propsForBackgroundLines: { stroke: 'transparent' },
                propsForLabels: { fontSize: 10 },
                fillShadowGradientFrom: changeColor,
                fillShadowGradientFromOpacity: 0.15,
                fillShadowGradientTo: changeColor,
                fillShadowGradientToOpacity: 0,
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noChartData}>Brak danych wykresu</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

/* ────────────────────────── Screen ────────────────────────── */

export default function CryptoScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { list, loading, error, fromCache } = useAppSelector((s) => s.crypto);
  const { createLoading } = useAppSelector((s) => s.orders);
  const isConnected = useConnectivity();

  const cardWidth = width - spacing.md * 2;

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
    ({ item, index }: { item: CryptoItem; index: number }) => (
      <CryptoCard
        item={item}
        onOrder={handleOrder}
        creating={createLoading}
        index={index}
        cardWidth={cardWidth}
      />
    ),
    [handleOrder, createLoading, cardWidth]
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
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
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
          <MaterialCommunityIcons name="cloud-off-outline" size={14} color={colors.warning} />
          <Text style={styles.offlineText}>Dane z pamięci podręcznej (offline)</Text>
        </View>
      )}

      {/* Hero header */}
      <View style={styles.heroHeader}>
        <Text style={styles.heroTitle}>Giełda Kryptowalut</Text>
        <Text style={styles.heroSubtitle}>
          Sprzedaj nam swoje kryptowaluty po najlepszych cenach na rynku
        </Text>
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

/* ────────────────────────── Styles ────────────────────────── */

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: { elevation: 4 },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: 15,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  offlineBanner: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  offlineText: { color: colors.warning, fontSize: 12, fontWeight: '500' },

  /* Hero header */
  heroHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },

  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...cardShadow,
  },
  decorCircle: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.6,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardMiddle: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  symbol: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  /* Change badge */
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  changeText: { fontSize: 13, fontWeight: '700' },

  /* Price block */
  priceBlock: {
    marginBottom: spacing.md,
  },
  priceMain: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  priceSub: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },

  /* Input row */
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputPrefix: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  sellBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellBtnDisabled: { opacity: 0.6 },
  sellBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  /* Chart toggle */
  chartToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  chartToggleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  /* Chart */
  chartContainer: {
    marginTop: 4,
    alignItems: 'center',
    minHeight: 160,
  },
  chartLoading: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  noChartData: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 40,
  },

  loadingContainer: { padding: spacing.xl, alignItems: 'center' },
});
