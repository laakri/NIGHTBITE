import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

// Providers
import { GameProvider } from './contexts/GameContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import App from './App';

// Styles
import './index.css';

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 p-4">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <pre className="text-sm bg-gray-800 p-4 rounded-lg overflow-auto max-w-lg">
        {error.message}
      </pre>
    </div>
  </div>
);

// Root element type assertion
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create root and render app
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GameProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </GameProvider>
    </ErrorBoundary>
  </StrictMode>
);
