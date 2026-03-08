import { configureStore } from '@reduxjs/toolkit';
import ordersReducer, { fetchMyOrders, createOrder } from '../store/slices/ordersSlice';

const createStore = () =>
  configureStore({
    reducer: { orders: ordersReducer },
  });

describe('ordersSlice', () => {
  it('should have initial state', () => {
    const store = createStore();
    const state = store.getState().orders;
    expect(state.myOrders).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.createLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set loading on fetchMyOrders.pending', () => {
    const store = createStore();
    store.dispatch(fetchMyOrders());
    expect(store.getState().orders.loading).toBe(true);
  });

  it('should set createLoading on createOrder.pending', () => {
    const store = createStore();
    store.dispatch(createOrder({ currencyCode: 'BTC', amount: 0.1 }));
    expect(store.getState().orders.createLoading).toBe(true);
  });
});
