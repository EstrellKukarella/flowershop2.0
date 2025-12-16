import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TelegramProvider } from './context/TelegramContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/index.css';

// Lazy load App
const App = lazy(() => import('./App'));

// Preload critical resources
const link = document.createElement('link');
link.rel = 'preconnect';
link.href = import.meta.env.VITE_API_URL;
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <TelegramProvider>
                <LanguageProvider>
                    <CartProvider>
                        <Suspense fallback={<LoadingSpinner fullScreen />}>
                            <App />
                        </Suspense>
                    </CartProvider>
                </LanguageProvider>
            </TelegramProvider>
        </BrowserRouter>
    </React.StrictMode>
);
