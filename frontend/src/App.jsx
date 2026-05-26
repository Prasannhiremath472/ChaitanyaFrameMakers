import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import useAuthStore from './store/authStore';

// Lazy-loaded pages
const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Orders        = lazy(() => import('./pages/Orders'));
const OrderDetail   = lazy(() => import('./pages/OrderDetail'));
const About         = lazy(() => import('./pages/About'));
const AiChat        = lazy(() => import('./pages/AiChat'));
const Prescription  = lazy(() => import('./pages/Prescription'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// Admin pages
const Dashboard     = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders   = lazy(() => import('./pages/admin/Orders'));
const AdminUsers    = lazy(() => import('./pages/admin/Users'));
const Analytics     = lazy(() => import('./pages/admin/Analytics'));
const AdminOffers   = lazy(() => import('./pages/admin/Offers'));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
    <div className="text-center">
      <div className="w-14 h-14 rounded-full animate-spin mx-auto mb-4"
        style={{ border: '3px solid #f0f0f0', borderTopColor: '#CC0000' }} />
      <p className="font-display text-base font-semibold" style={{ color: '#CC0000' }}>Loading…</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/"             element={<Home />} />
              <Route path="/products"     element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart"         element={<Cart />} />
              <Route path="/login"        element={<Login />} />
              <Route path="/register"     element={<Register />} />
              <Route path="/about"        element={<About />} />
              <Route path="/ai-chat"      element={<AiChat />} />
              <Route path="/customize"    element={<Prescription />} />
              <Route path="/privacy"      element={<PrivacyPolicy />} />

              {/* Protected customer routes */}
              <Route path="/checkout"     element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders"       element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id"   element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index                element={<Dashboard />} />
              <Route path="products"      element={<AdminProducts />} />
              <Route path="orders"        element={<AdminOrders />} />
              <Route path="users"         element={<AdminUsers />} />
              <Route path="analytics"     element={<Analytics />} />
              <Route path="offers"        element={<AdminOffers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}
