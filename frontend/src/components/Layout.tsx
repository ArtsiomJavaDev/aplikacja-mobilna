import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Outlet, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { useAppDispatch } from '../hooks/useAppDispatch';

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kantor Kryptowalut
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Strona główna
          </Button>
          {user?.role === 'ROLE_ADMIN' && (
            <Button color="inherit" onClick={() => navigate('/admin')}>
              Panel administratora
            </Button>
          )}
          <Button color="inherit" onClick={() => navigate('/cart')}>
            Koszyk
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Wyloguj
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 