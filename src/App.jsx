import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import './App.css';
import { clientFetchSettings } from './api/clientApi';

// ============ PERFORMANCE OPTIMIZATION: CODE SPLITTING ============
// Lazy load heavy components to reduce initial bundle size

// Client Routes - Lazy loaded
const ClientApp = lazy(() => import('./routes/ClientApp'));
const ClientOrder = lazy(() => import('./routes/ClientOrder'));
const ClientBill = lazy(() => import('./routes/ClientBill'));
const ShippingLabel = lazy(() => import('./routes/ShippingLabel'));
const OrderDetails = lazy(() => import('./routes/OrderDetails'));
const TrackOrder = lazy(() => import('./routes/TrackOrder'));

// Admin Routes - Lazy loaded (heavy component)
const AdminApp = lazy(() => import('./routes/AdminApp'));
const AdminTracking = lazy(() => import('./routes/AdminTracking'));

// Auth Routes - Lazy loaded
const Login = lazy(() => import('./routes/Login'));
const AdminLogin = lazy(() => import('./routes/AdminLogin'));
const Signup = lazy(() => import('./routes/Signup'));
const AdminSignup = lazy(() => import('./routes/AdminSignup'));
const ForgotPassword = lazy(() => import('./routes/ForgotPassword'));
const ResetPassword = lazy(() => import('./routes/ResetPassword'));

// Components
const WhatsAppWidget = lazy(() => import('./components/WhatsAppWidget'));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading...</p>
    </div>
  </div>
);

const ClientProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sparkle_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sparkle_token');
  const userString = localStorage.getItem('sparkle_user');
  const user = userString ? JSON.parse(userString) : {};

  if (!token) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem('sparkle_settings');
    return cached ? JSON.parse(cached) : {};
  });
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const s = await clientFetchSettings();
        if (s) {
          setSettings(s);
          localStorage.setItem('sparkle_settings', JSON.stringify(s));

          if (s.storeName) document.title = `${s.storeName} | Personalized Gifts`;
          if (s.logoUrl) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = s.logoUrl;
          }
        }
      } catch (err) {
        console.error("Failed to fetch global settings", err);
      }
    })();
  }, []);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />

          {/* Client Routes */}
          <Route path="/" element={<ClientApp />} />
          <Route path="/client/order/:invoiceId" element={<ClientProtectedRoute><ClientOrder /></ClientProtectedRoute>} />
          <Route path="/client/order/:invoiceId/bill" element={<ClientProtectedRoute><ClientBill /></ClientProtectedRoute>} />
          <Route path="/client/order/:invoiceId/label" element={<ClientProtectedRoute><ShippingLabel /></ClientProtectedRoute>} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/order-details/:invoiceId" element={<ClientProtectedRoute><OrderDetails /></ClientProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminProtectedRoute><AdminApp /></AdminProtectedRoute>} />
          <Route path="/admin/tracking/:orderId" element={<AdminProtectedRoute><AdminTracking /></AdminProtectedRoute>} />

          {/* Defaults */}
          <Route path="/sparkle-management-portal/*" element={<Navigate to="/admin" replace />} />
          <Route path="/owner/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {location.pathname === '/' && (
          <WhatsAppWidget phone={settings.whatsappNumber || '916381830479'} />
        )}
      </Suspense>
    </>
  );
}
