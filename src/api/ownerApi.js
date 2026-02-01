import axios from 'axios';

const getBaseURL = () => {
  // Use Render URL if on production Netlify domain
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://sparklegiftshop-backend.onrender.com/api';
  }
  // Otherwise use environment variable (usually localhost:4000/api)
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};

export const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const ownerFetchProducts = () => api.get('/products').then((r) => r.data);
export const ownerCreateProduct = (payload) => api.post('/products', payload).then((r) => r.data);
export const ownerUpdateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data);
export const ownerDeleteProduct = (id) => api.delete(`/products/${id}`);

export const ownerFetchOrders = () => api.get('/orders').then((r) => r.data);
export const ownerGetOrder = (idOrInvoiceId) => api.get(`/orders/${idOrInvoiceId}`).then((r) => r.data);
export const ownerDeleteOrder = (id) => api.delete(`/orders/${id}`);
export const ownerToggleDispatch = (id, dispatched) => api.patch(`/orders/${id}/dispatch`, { dispatched }).then(r => r.data);
export const ownerTogglePayment = (id, isPaid) => api.patch(`/orders/${id}/payment`, { isPaid }).then(r => r.data);

export const ownerFetchReportPdf = (range) =>
  api.get('/reports/export', { params: { range, format: 'pdf' }, responseType: 'blob' }).then((r) => r.data);
export const ownerFetchReportSummary = (range) =>
  api.get('/reports/summary', { params: { range } }).then((r) => r.data);

export const ownerBuildWhatsAppLink = (payload) =>
  api.post('/whatsapp-link', payload).then((r) => r.data.url);

export const ownerFetchSettings = () => api.get('/settings').then((r) => r.data);
export const ownerUpdateSettings = (payload) => api.put('/settings', payload).then((r) => r.data);

export const ownerFetchCoupons = () => api.get('/coupons').then((r) => r.data);
export const ownerCreateCoupon = (payload) => api.post('/coupons', payload).then((r) => r.data);
export const ownerDeleteCoupon = (id) => api.delete(`/coupons/${id}`);
