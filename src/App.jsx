import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import ClientApp from './routes/ClientApp';
import ClientOrder from './routes/ClientOrder';
import ClientBill from './routes/ClientBill';
import AdminApp from './routes/AdminApp';
import TrackOrder from './routes/TrackOrder';
import ShippingLabel from './routes/ShippingLabel';
import OrderDetails from './routes/OrderDetails';
import AdminTracking from './routes/AdminTracking';
import Login from './routes/Login';
import AdminLogin from './routes/AdminLogin';
import Signup from './routes/Signup';
import AdminSignup from './routes/AdminSignup';
import ForgotPassword from './routes/ForgotPassword';
import ResetPassword from './routes/ResetPassword';
import WhatsAppWidget from './components/WhatsAppWidget';
import { clientFetchSettings } from './api/clientApi';

const ClientProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sparkle_token');
  // Return children regardless of role if token exists, 
  // or handle guest access for specific public routes.
  // The redirection for admins to /admin was preventing them from seeing client views.
  if (!token) {
    // Check if it's a route that allows guests (handled by the route element itself or here)
    // For now, if no token, we only allow access if it's not a protected path.
    // But since this IS a protected route wrapper, we redirect to login.
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
    </>
  );
}
