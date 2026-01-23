import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  AppBar, 
  Toolbar, 
  Button,
  Stack
} from '@mui/material';
import { useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { useAppDispatch } from '../hooks/useAppDispatch';
import Cart from './Cart';
import CurrencyList from './CurrencyList';
import AdminPanel from './AdminPanel';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kantor Wymiany Walut
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Wyloguj
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Witaj, {user?.email || 'Użytkowniku'}!
          </Typography>
          
          {/* Przyciski dla nie-adminów */}
          {user?.role !== 'ROLE_ADMIN' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ fontWeight: 'bold', fontSize: 16, flex: 1 }}
                onClick={() => navigate('/orders')}
              >
                📋 Moje zamówienia
              </Button>
              
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  flex: 1,
                  backgroundColor: '#ff9800',
                  '&:hover': {
                    backgroundColor: '#f57c00'
                  }
                }}
                onClick={() => navigate('/crypto')}
              >
                🚀 Sprzedaj Krypto
              </Button>
            </Box>
          )}
          
          {user?.role === 'ROLE_ADMIN' ? (
            <Paper 
              elevation={3} 
              sx={{ p: 3 }}
            >
              <AdminPanel />
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  flex: { md: 2 }
                }}
              >
                <CurrencyList />
              </Paper>
              
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  flex: { md: 1 }
                }}
              >
                <Cart />
              </Paper>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Home; 