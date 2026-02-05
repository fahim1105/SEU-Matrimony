import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './Router/Router';
import AuthProvider from './Context/AuthProvider';
import { ThemeProvider } from './Context/ThemeContext';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Import i18n configuration
import './i18n/i18n';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--fallback-b1,oklch(var(--b1)))',
                  color: 'var(--fallback-bc,oklch(var(--bc)))',
                  border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
