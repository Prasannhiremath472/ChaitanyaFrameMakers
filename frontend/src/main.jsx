import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color:      '#1a0000',
              border:     '1.5px solid rgba(0,0,0,0.08)',
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize:   '14px',
              boxShadow:  '0 8px 30px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#CC0000', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
