import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import axiosInstance from '../api/axios';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  marketPrice: number;
  sellPrice: number;
}

interface CryptoCardProps {
  crypto: Crypto;
  onSell: (amount: number) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onSell }) => {
  const [amount, setAmount] = useState<string>('');
  const discount = ((crypto.marketPrice - crypto.sellPrice) / crypto.marketPrice * 100).toFixed(1);

  const handleSell = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSell(numAmount);
      setAmount('');
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {crypto.name} ({crypto.symbol})
          </Typography>
          <Chip 
            label={`-${discount}%`} 
            color="success" 
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Cena rynkowa: ${crypto.marketPrice.toLocaleString()}
        </Typography>
        
        <Typography variant="h6" color="success.main" gutterBottom>
          Nasza cena skupu: ${crypto.sellPrice.toLocaleString()}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            size="small"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{crypto.symbol}</InputAdornment>
              ),
            }}
            placeholder="Ilość"
            fullWidth
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleSell}
            disabled={!amount || parseFloat(amount) <= 0}
            sx={{ minWidth: '120px' }}
          >
            Sprzedaj nam
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const CryptoList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Pobieranie kryptowalut...');
        const response = await axiosInstance.get<Crypto[]>('/api/crypto');
        console.log('Otrzymano kryptowaluty:', response.data);
        setCryptos(response.data);
      } catch (err: any) {
        console.error('Błąd ładowania kryptowalut:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Błąd podczas ładowania kryptowalut';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const handleSellCrypto = (crypto: Crypto, amount: number) => {
    console.log('Selling crypto:', { crypto, amount });
    const symbolHash = crypto.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cartItem = {
      currencyId: symbolHash,
      code: crypto.symbol,
      amount: amount,
      rate: crypto.sellPrice,
      total: amount * crypto.sellPrice
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
        Skupujemy kryptowaluty
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        💰 Sprzedaj nam swoje kryptowaluty! Płacimy 85% ceny rynkowej.
      </Alert>

      <Grid container spacing={2}>
        {cryptos.map((crypto) => (
          <Grid item xs={12} sm={6} md={4} key={crypto.id}>
            <CryptoCard
              crypto={crypto}
              onSell={(amount) => handleSellCrypto(crypto, amount)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CryptoList; 