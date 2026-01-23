import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './components/Providers';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Providers />
    </ErrorBoundary>
  </React.StrictMode>
);