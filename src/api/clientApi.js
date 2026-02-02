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

export const getSocketURL = () => {
  return API_BASE_URL.replace('/api', '');
};

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

export const clientLogin = (email, password) => api.post('/auth/client/login', { email, password }).then(r => r.data);
export const clientSignup = (payload) => api.post('/auth/client/signup', payload).then(r => r.data);
export const clientVerifyEmail = (token) => api.get(`/auth/verify-email/${token}`).then(r => r.data);
export const clientForgotPassword = (email) => api.post('/auth/client/forgot-password', { email }).then(r => r.data);
export const clientResetPassword = (payload) => api.post('/auth/client/reset-password', payload).then(r => r.data);

export const clientFetchProducts = () => api.get('/products').then((r) => r.data);
export const clientFetchCart = () => api.get('/cart').then((r) => r.data);
export const clientAddToCart = (productId, variant = null) =>
  api.post('/cart/add', { productId, quantity: 1, variant }).then((r) => r.data);
export const clientUpdateCartItem = (productId, quantity, variantSize = null, variantColor = null) =>
  api.put(`/cart/item/${productId}`, { quantity, variantSize, variantColor }).then((r) => r.data);
export const clientClearCart = () => api.post('/cart/clear').then((r) => r.data);

export const clientCreateOrder = (payload) => api.post('/orders', payload).then((r) => r.data);
export const clientGetOrder = (idOrInvoiceId) =>
  api.get(`/orders/${idOrInvoiceId}`).then((r) => r.data);

export const clientTrackOrderPublic = (idOrInvoiceId, phone) =>
  api.get(`/public/orders/${idOrInvoiceId}`, { params: { phone } }).then((r) => r.data);

export const clientFetchOrdersByPhonePublic = (phone) =>
  api.get('/public/orders', { params: { phone } }).then((r) => r.data);

export const clientFetchOrdersByPhone = (phone) =>
  api.get('/orders', { params: { phone } }).then((r) => r.data);


export const clientFetchSettings = () => api.get('/settings').then((r) => r.data);

export const clientVerifyCoupon = (code) => api.post('/verify-coupon', { code }).then((r) => r.data);

export const clientUploadScreenshot = (invoiceId, screenshot) =>
  api.put(`/orders/${invoiceId}/screenshot`, { screenshot }).then((r) => r.data);

export const clientFetchCoupons = () => api.get('/coupons').then((r) => r.data);
