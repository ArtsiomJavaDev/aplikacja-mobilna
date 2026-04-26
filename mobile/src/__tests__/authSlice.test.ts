import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login } from '../store/slices/authSlice';

const createStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

describe('authSlice', () => {
  it('should have initial state', () => {
    const store = createStore();
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('should set loading on login.pending', async () => {
    const store = createStore();
    store.dispatch(login({ email: 'a@b.com', password: 'x' }));
    const state = store.getState().auth;
    expect(state.loading).toBe(true);
  });

  it('should clear error on clearError action', () => {
    const store = createStore();
    store.dispatch({ type: 'auth/clearError' });
    expect(store.getState().auth.error).toBeNull();
  });
});
