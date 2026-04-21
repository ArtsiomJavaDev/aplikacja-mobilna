import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchNews, triggerNewsRefresh } from '../../src/api/news';
import type { NewsItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Teraz';
  }

  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NewsCard({ item, onOpen }: { item: NewsItem; onOpen: (url: string) => void }): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onOpen(item.url)}>
      <View style={styles.cardHeader}>
        <View style={styles.sourceBadge}>
          <MaterialCommunityIcons name="newspaper-variant-outline" size={16} color={colors.primary} />
          <Text style={styles.sourceText}>{item.source || 'News'}</Text>
        </View>
        <Text style={styles.timeText}>{formatPublishedAt(item.publishedAt)}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.summary}>{item.summary}</Text>

      {item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag) => (
            <View key={`${item.id}-${tag}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.readMore}>Czytaj dalej</Text>
        <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function NewsScreen(): React.JSX.Element {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      let items = await fetchNews();

      if (items.length === 0) {
        await triggerNewsRefresh();
        await wait(mode === 'initial' ? 1800 : 2200);
        items = await fetchNews();
      }

      setNews(items);
      setError(null);
    } catch {
      setError('Nie udalo sie pobrac newsow. Sprobuj ponownie.');
    } finally {
      if (mode === 'initial') {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const handleRefresh = useCallback(() => {
    void loadNews('refresh');
  }, [loadNews]);

  const handleOpen = useCallback(async (url: string) => {
    if (!url) {
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: NewsItem }) => <NewsCard item={item} onOpen={handleOpen} />,
    [handleOpen]
  );

  const keyExtractor = useCallback((item: NewsItem) => item.id, []);

  const contentContainerStyle = useMemo(
    () => ({
      padding: spacing.md,
      paddingBottom: 100,
      flexGrow: news.length === 0 ? 1 : undefined,
    }),
    [news.length]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ladowanie newsow...</Text>
      </View>
    );
  }

  if (error && news.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => void loadNews()}>
          <Text style={styles.retryButtonText}>Sprobuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Crypto News</Text>
        <Text style={styles.heroSubtitle}>Najnowsze wiadomosci dla aplikacji mobilnej</Text>
      </View>

      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="newspaper-remove-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Brak newsow</Text>
            <Text style={styles.emptyText}>Pociagnij w dol, aby odswiezyc liste.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.error,
    fontSize: 15,
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sourceText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  summary: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.primary + '14',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMore: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
