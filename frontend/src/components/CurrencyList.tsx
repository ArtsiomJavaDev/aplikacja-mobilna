import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import type { Currency } from '../types';
import axiosInstance from '../api/axios';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

interface CurrencyCardProps {
  currency: Currency;
  /**
   * Pass both amount and the effective rate that should be stored in the cart.
   */
  onAddToCart: (amount: number, rate: number) => void;
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({ currency, onAddToCart }) => {
  const [amount, setAmount] = useState<string>('');
  const [externalRate, setExternalRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const isAdmin = useSelector((state: RootState) => state.auth.isAdmin);
  const percent = isAdmin ? 0 : 5;

  useEffect(() => {
    setLoadingRate(true);
    const base = currency.code;
    const target = 'PLN';
    axiosInstance.get(`/api/currencies/external-rate?base=${base}&target=${target}&percent=${percent}`)
      .then(res => setExternalRate(res.data))
      .catch(() => setExternalRate(null))
      .finally(() => setLoadingRate(false));
  }, [currency.code, isAdmin]);

  const handleAddToCart = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      // Prefer the externally fetched rate (which contains the margin for non-admins).
      const rateToUse = externalRate !== null ? externalRate : currency.rate;
      onAddToCart(numAmount, rateToUse);
      setAmount('');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {currency.name} ({currency.code})
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {loadingRate
            ? '...'
            : externalRate !== null
              ? `1 ${currency.code} = ${externalRate.toFixed(4)} PLN`
              : `1 ${currency.code} = ${currency.rate} PLN (lokalny)`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            size="small"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{currency.code}</InputAdornment>
              ),
            }}
            placeholder="Ilość"
          />
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Dodaj do koszyka
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const CurrencyList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<Currency[]>('/api/currencies');
        console.log('Loaded currencies:', response.data);
        setCurrencies(response.data);
      } catch (err: any) {
        console.error('Error loading currencies:', err);
        setError(err.response?.data?.message || 'Błąd podczas ładowania walut');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleAddToCart = (currency: Currency, amount: number, rate: number) => {
    console.log('Adding to cart:', { currency, amount, rate });
    const cartItem = {
      currencyId: currency.id,
      code: currency.code,
      amount,
      rate,
      total: amount * rate,
    };
    console.log('Cart item to add:', cartItem);
    dispatch(addToCart(cartItem));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Dostępne waluty
      </Typography>
      
      <Button
        variant="contained"
        color="success"
        size="large"
        fullWidth
        sx={{ 
          mb: 3, 
          py: 2, 
          fontSize: '18px', 
          fontWeight: 'bold',
          backgroundColor: '#2e7d32',
          '&:hover': {
            backgroundColor: '#1b5e20'
          }
        }}
        onClick={() => navigate('/orders')}
      >
        📋 Moje zamówienia
      </Button>

      <Grid container spacing={2}>
        {currencies.map((currency) => (
          <Grid item xs={12} sm={6} md={4} key={currency.id}>
            <CurrencyCard
              currency={currency}
              onAddToCart={(amount, rate) => handleAddToCart(currency, amount, rate)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CurrencyList; 