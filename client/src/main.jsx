import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D1318',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              color: '#fff',
            },
            success: {
              borderColor: '#00F0FF',
            },
            error: {
              borderColor: '#FF4757',
            },
          }}
        />
        {/* Noise texture overlay */}
        <div className="noise-overlay" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);