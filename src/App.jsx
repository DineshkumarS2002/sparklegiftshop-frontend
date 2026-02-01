import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import ClientApp from './routes/ClientApp';
import ClientOrder from './routes/ClientOrder';
import ClientBill from './routes/ClientBill';
import OwnerApp from './routes/OwnerApp';
import TrackOrder from './routes/TrackOrder';
import ShippingLabel from './routes/ShippingLabel';
import OrderDetails from './routes/OrderDetails';
import WhatsAppWidget from './components/WhatsAppWidget';
import { clientFetchSettings } from './api/clientApi';

export default function App() {
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem('sparkle_settings');
    return cached ? JSON.parse(cached) : {};
  });
  const location = useLocation();
  const isOwnerPage = location.pathname.startsWith('/owner');

  useEffect(() => {
    (async () => {
      try {
        const s = await clientFetchSettings();
        if (s) {
          setSettings(s);
          localStorage.setItem('sparkle_settings', JSON.stringify(s));

          // Apply branding
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
        <Route path="/" element={<ClientApp />} />
        <Route path="/client" element={<Navigate to="/" replace />} />
        <Route path="/client/order/:invoiceId" element={<ClientOrder />} />
        <Route path="/client/order/:invoiceId/bill" element={<ClientBill />} />
        <Route path="/client/order/:invoiceId/label" element={<ShippingLabel />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/order-details/:invoiceId" element={<OrderDetails />} />
        <Route path="/owner" element={<OwnerApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isOwnerPage && (
        <WhatsAppWidget phone={settings.whatsappNumber || '916381830479'} />
      )}
    </>
  );
}
