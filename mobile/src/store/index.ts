import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cryptoReducer from './slices/cryptoSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crypto: cryptoReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
