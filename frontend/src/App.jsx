import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentInfo = lazy(() => import('./pages/PaymentInfo'));
const Orders = lazy(() => import('./pages/Orders'));
const Cashback = lazy(() => import('./pages/Cashback'));

// Admin pages (loaded only when accessed)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const PaymentVerify = lazy(() => import('./pages/admin/PaymentVerify'));

function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Routes>
                    {/* Customer routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/:orderId" element={<PaymentInfo />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/cashback" element={<Cashback />} />

                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/payments" element={<PaymentVerify />} />
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;
