import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer, { fetchCrypto } from '../store/slices/cryptoSlice';

const createStore = () =>
  configureStore({
    reducer: { crypto: cryptoReducer },
  });

describe('cryptoSlice', () => {
  it('should have initial state', () => {
    const store = createStore();
    const state = store.getState().crypto;
    expect(state.list).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set loading on fetchCrypto.pending', () => {
    const store = createStore();
    store.dispatch(fetchCrypto());
    expect(store.getState().crypto.loading).toBe(true);
  });
});
