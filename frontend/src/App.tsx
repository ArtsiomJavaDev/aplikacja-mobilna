import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, CircularProgress, Box } from '@mui/material';
import { checkAuth } from './store/slices/authSlice';
import { loadCart } from './store/slices/cartSlice';
import type { RootState } from './store';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import CurrencyList from './components/CurrencyList';
import CryptoList from './components/CryptoList';
import Cart from './components/Cart';
import Orders from './components/Orders';
import AdminPanel from './components/AdminPanel';
import OrderHistory from './components/OrderHistory';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { BadRequest, Unauthorized, Forbidden, NotFound, InternalServerError } from './components/ErrorPages';
import axiosInstance from './api/axios';
import { useAppDispatch } from './hooks/useAppDispatch';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, isAdmin } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch(checkAuth())
        .then(() => {
          // Успешная авторизация
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          delete axiosInstance.defaults.headers.common['Authorization'];
        });
    }
    dispatch(loadCart());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Strony błędów */}
        <Route path="/error/400" element={<BadRequest />} />
        <Route path="/error/401" element={<Unauthorized />} />
        <Route path="/error/403" element={<Forbidden />} />
        <Route path="/error/404" element={<NotFound />} />
        <Route path="/error/500" element={<InternalServerError />} />
        
        <Route element={<Layout />}>
          <Route index element={<PrivateRoute element={<Home />} />} />
          <Route path="/crypto" element={<PrivateRoute element={<CryptoList />} />} />
          <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
          <Route path="/orders" element={<PrivateRoute element={<Orders />} />} />
          <Route path="/admin" element={<AdminRoute element={<AdminPanel />} />} />
          <Route path="/admin/history" element={<AdminRoute element={<OrderHistory />} />} />
        </Route>
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Container>
  );
};

export default App; 