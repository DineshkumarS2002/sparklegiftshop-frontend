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

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sparkle_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminLogin = (email, password) => api.post('/auth/admin/login', { email, password }).then(r => r.data);
export const adminSignup = (payload) => api.post('/auth/admin/signup', payload).then(r => r.data);
export const adminFetchAdmins = () => api.get('/admin/users').then(r => r.data);
export const adminCreateAdmin = (payload) => api.post('/admin/create-admin', payload).then(r => r.data);
export const adminDeleteAdmin = (id) => api.delete(`/admin/users/${id}`);
export const adminForgotPassword = (email) => api.post('/auth/admin/forgot-password', { email }).then(r => r.data);
export const adminResetPassword = (payload) => api.post('/auth/admin/reset-password', payload).then(r => r.data);

export const ownerFetchProducts = () => api.get('/products').then((r) => r.data);
export const ownerCreateProduct = (payload) => api.post('/admin/products', payload).then((r) => r.data);
export const ownerUpdateProduct = (id, payload) => api.put(`/admin/products/${id}`, payload).then((r) => r.data);
export const ownerDeleteProduct = (id) => api.delete(`/admin/products/${id}`);

export const ownerFetchOrders = () => api.get('/admin/orders').then((r) => r.data);
export const ownerGetOrder = (idOrInvoiceId) => api.get(`/admin/orders/${idOrInvoiceId}`).then((r) => r.data);
export const ownerDeleteOrder = (id) => api.delete(`/admin/orders/${id}`);
export const ownerToggleDispatch = (id, dispatched) => api.patch(`/admin/orders/${id}/dispatch`, { dispatched }).then(r => r.data);
export const ownerToggleDelivered = (id, delivered) => api.patch(`/admin/orders/${id}/delivered`, { delivered }).then(r => r.data);
export const ownerTogglePayment = (id, isPaid) => api.patch(`/admin/orders/${id}/payment`, { isPaid }).then(r => r.data);
export const ownerUpdateOrderTracking = (id, payload) => api.patch(`/admin/orders/${id}/tracking`, payload).then(r => r.data);

export const ownerFetchReportPdf = (range) =>
  api.get('/admin/reports/export', { params: { range, format: 'pdf' }, responseType: 'blob' }).then((r) => r.data);
export const ownerFetchReportSummary = (range) =>
  api.get('/admin/reports/summary', { params: { range } }).then((r) => r.data);

export const ownerBuildWhatsAppLink = (payload) =>
  api.post('/whatsapp-link', payload).then((r) => r.data.url);

export const ownerFetchSettings = () => api.get('/settings').then((r) => r.data);
export const ownerUpdateSettings = (payload) => api.put('/admin/settings', payload).then((r) => r.data);

export const ownerFetchCoupons = () => api.get('/admin/coupons').then((r) => r.data);
export const ownerCreateCoupon = (payload) => api.post('/admin/coupons', payload).then((r) => r.data);
export const ownerDeleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);
