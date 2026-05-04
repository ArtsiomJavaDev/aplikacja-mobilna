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
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import axiosInstance from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  marketPrice: number;
  sellPrice: number;
  priceChangePercent24h: number;
}

interface ChartDataPoint {
  time: string;
  price: number;
}

interface CryptoCardProps {
  crypto: Crypto;
  onSell: (amount: number) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onSell }) => {
  const [amount, setAmount] = useState<string>('');
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const isPositive = crypto.priceChangePercent24h >= 0;
  const progressColor = isPositive ? '#4caf50' : '#f44336';
  const progressBg = isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';

  const handleSell = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSell(numAmount);
      setAmount('');
    }
  };

  const toggleChart = async () => {
    if (!showChart && chartData.length === 0) {
      setLoadingChart(true);
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${crypto.symbol}USDT&interval=1h&limit=24`);
        const data = await response.json();
        const formattedData = data.map((item: any) => {
          const date = new Date(item[0]);
          return {
            time: `${date.getHours().toString().padStart(2, '0')}:00`,
            price: parseFloat(item[4]) // close price
          };
        });
        setChartData(formattedData);
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      } finally {
        setLoadingChart(false);
      }
    }
    setShowChart(!showChart);
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.8)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: progressBg,
        filter: 'blur(30px)',
        zIndex: 0
      }} />

      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              {crypto.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {crypto.symbol}
            </Typography>
          </Box>
          <Chip 
            icon={isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
            label={`${isPositive ? '+' : ''}${crypto.priceChangePercent24h.toFixed(2)}%`}
            sx={{ 
              backgroundColor: progressBg,
              color: progressColor,
              fontWeight: 700,
              borderRadius: 2,
              '& .MuiChip-icon': { color: progressColor }
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            ${crypto.marketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </Typography>
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Skupujemy po: ${crypto.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
          <TextField
            size="small"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{crypto.symbol}</InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.6)' }
            }}
            placeholder="Ilość"
            fullWidth
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleSell}
            disabled={!amount || parseFloat(amount) <= 0}
            sx={{
              minWidth: '110px',
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
              '&:hover': { boxShadow: '0 6px 20px rgba(76, 175, 80, 0.23)' },
            }}
          >
            Sprzedaj
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button 
            size="small" 
            color="inherit" 
            onClick={toggleChart}
            startIcon={<ShowChartIcon />}
            endIcon={<ExpandMoreIcon sx={{ transform: showChart ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
            sx={{ textTransform: 'none', color: 'text.secondary', opacity: 0.8, '&:hover': { opacity: 1 } }}
          >
            Wykres 24h
          </Button>
        </Box>

        <Collapse in={showChart}>
          <Box sx={{ mt: 2, height: 160, width: '100%' }}>
            {loadingChart ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorPrice-${crypto.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={progressColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={progressColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: progressColor, fontWeight: 700 }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cena']}
                    labelStyle={{ color: '#666', fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={progressColor} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#colorPrice-${crypto.symbol})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 6 }}>
                Brak danych wykresu
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const CryptoList: React.FC = () => {
  const dispatch = useDispatch();
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<Crypto[]>('/api/crypto');
        setCryptos(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Błąd podczas ładowania kryptowalut';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const handleSellCrypto = (crypto: Crypto, amount: number) => {
    const symbolHash = crypto.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cartItem = {
      currencyId: symbolHash,
      code: crypto.symbol,
      amount: amount,
      rate: crypto.sellPrice,
      total: amount * crypto.sellPrice
    };
    dispatch(addToCart(cartItem));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" sx={{ fontWeight: 800, letterSpacing: '-1px', mb: 2, background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Giełda Kryptowalut
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Sprzedaj nam swoje kryptowaluty po najlepszych cenach na rynku. Szybko, bezpiecznie i wygodnie.
        </Typography>
      </Box>

      <Grid container spacing={3}>
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