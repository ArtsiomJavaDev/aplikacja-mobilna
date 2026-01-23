import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const steps = ['Dane płatności', 'Potwierdzenie'];

const Checkout: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const { items, total } = useSelector((state: RootState) => state.cart);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    // Implement order submission logic
    console.log('Submit order');
  };

  const PaymentForm = () => (
    <Stack spacing={3}>
      <FormControl fullWidth>
        <InputLabel>Metoda płatności</InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          label="Metoda płatności"
        >
          <MenuItem value="card">Karta płatnicza</MenuItem>
          <MenuItem value="blik">BLIK</MenuItem>
        </Select>
      </FormControl>

      {paymentMethod === 'card' && (
        <>
          <TextField
            fullWidth
            label="Numer karty"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1234 5678 9012 3456"
          />
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Data ważności"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="MM/RR"
            />
            <TextField
              fullWidth
              label="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              type="password"
              inputProps={{ maxLength: 3 }}
            />
          </Stack>
        </>
      )}

      {paymentMethod === 'blik' && (
        <TextField
          fullWidth
          label="Kod BLIK"
          type="number"
          inputProps={{ maxLength: 6 }}
          placeholder="Wprowadź 6-cyfrowy kod"
        />
      )}
    </Stack>
  );

  const Confirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Podsumowanie zamówienia
      </Typography>
      
      <Stack spacing={2}>
        {items.map((item) => (
          <Box key={item.currencyId}>
            <Typography>
              {item.amount} {item.code} × {item.rate} PLN = {item.total.toFixed(2)} PLN
            </Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Suma do zapłaty: {total.toFixed(2)} PLN
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        Płatność zostanie zrealizowana przez wybrany system płatności
      </Alert>
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Realizacja zamówienia
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 ? <PaymentForm /> : <Confirmation />}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack}>
            Wstecz
          </Button>
        )}
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Złóż zamówienie' : 'Dalej'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Checkout; 