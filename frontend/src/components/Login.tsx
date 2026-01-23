import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { useAppDispatch } from '../hooks/useAppDispatch';
import type { LoginCredentials } from '../types';
import { handleApiError } from '../utils/errorHandler';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    if (!formData.email.trim()) {
      setValidationError('Email jest wymagany');
      return false;
    }
    if (!formData.password) {
      setValidationError('Hasło jest wymagane');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('Nieprawidłowy email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
    } catch (err) {
      const errorMessage = handleApiError(err);
      setValidationError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setValidationError(null); // Resetowanie błędu przy zmianie pola
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Logowanie
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!validationError && !formData.email.trim()}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Hasło"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!validationError && !formData.password}
              disabled={loading}
            />
            {validationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationError}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Zaloguj się'
              )}
            </Button>
            <Button
              component={Link}
              to="/register"
              fullWidth
              sx={{ textAlign: 'center' }}
              disabled={loading}
            >
              Nie masz konta? Zarejestruj się
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 