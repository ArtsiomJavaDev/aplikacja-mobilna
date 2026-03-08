import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { offlineCache } from '../../cache/offlineCache';
import type { CryptoItem } from '../../types';

interface CryptoState {
  list: CryptoItem[];
  loading: boolean;
  error: string | null;
  fromCache?: boolean;
}

const initialState: CryptoState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchCrypto = createAsyncThunk(
  'crypto/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<CryptoItem[]>('/api/crypto');
      await offlineCache.setCrypto(data);
      return { data, fromCache: false };
    } catch (e) {
      const cached = await offlineCache.getCrypto();
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return { data: cached as CryptoItem[], fromCache: true };
      }
      return rejectWithValue(e instanceof Error ? e.message : 'Błąd pobierania kryptowalut');
    }
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrypto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrypto.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.fromCache = action.payload.fromCache;
        state.error = null;
      })
      .addCase(fetchCrypto.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Błąd';
      });
  },
});

export default cryptoSlice.reducer;
