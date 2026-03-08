import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineCache } from '../cache/offlineCache';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('offlineCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCrypto returns null when storage is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await offlineCache.getCrypto();
    expect(result).toBeNull();
  });

  it('setCrypto calls AsyncStorage.setItem', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    await offlineCache.setCrypto([{ id: '1', symbol: 'BTC' }]);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
