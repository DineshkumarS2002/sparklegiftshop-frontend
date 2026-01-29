import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import ClientApp from './routes/ClientApp';
import ClientOrder from './routes/ClientOrder';
import ClientBill from './routes/ClientBill';
import OwnerApp from './routes/OwnerApp';
import TrackOrder from './routes/TrackOrder';
import ShippingLabel from './routes/ShippingLabel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientApp />} />
      <Route path="/client" element={<Navigate to="/" replace />} />
      <Route path="/client/order/:invoiceId" element={<ClientOrder />} />
      <Route path="/client/order/:invoiceId/bill" element={<ClientBill />} />
      <Route path="/client/order/:invoiceId/label" element={<ShippingLabel />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/owner" element={<OwnerApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
