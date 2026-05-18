import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color:      '#fff',
            border:     '1px solid #C9A84C',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#000' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </HelmetProvider>
  </React.StrictMode>
);
