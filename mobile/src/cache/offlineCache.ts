import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const CACHE_CRYPTO = `${CACHE_PREFIX}crypto`;
const CACHE_ORDERS = `${CACHE_PREFIX}orders`;
const TTL_MS = 5 * 60 * 1000; // 5 min

interface Cached<T> {
  data: T;
  timestamp: number;
}

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed: Cached<T> = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

async function setCached<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // ignore
  }
}

export const offlineCache = {
  getCrypto: () => getCached<unknown[]>(CACHE_CRYPTO),
  setCrypto: (data: unknown[]) => setCached(CACHE_CRYPTO, data),
  getOrders: () => getCached<unknown[]>(CACHE_ORDERS),
  setOrders: (data: unknown[]) => setCached(CACHE_ORDERS, data),
};
