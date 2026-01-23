import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '../store';
import { theme } from '../theme';
import { Router } from './Router';

interface ProvidersProps {
  children?: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router />
      </ThemeProvider>
    </Provider>
  );
}; 