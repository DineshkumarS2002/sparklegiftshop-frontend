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

export const clientFetchProducts = () => api.get('/products').then((r) => r.data);
export const clientFetchCart = () => api.get('/cart').then((r) => r.data);
export const clientAddToCart = (productId, variant = null) =>
  api.post('/cart/add', { productId, quantity: 1, variant }).then((r) => r.data);
export const clientUpdateCartItem = (productId, quantity, variantSize = null) =>
  api.put(`/cart/item/${productId}`, { quantity, variantSize }).then((r) => r.data);
export const clientClearCart = () => api.post('/cart/clear').then((r) => r.data);

export const clientCreateOrder = (payload) => api.post('/orders', payload).then((r) => r.data);
export const clientGetOrder = (idOrInvoiceId) =>
  api.get(`/orders/${idOrInvoiceId}`).then((r) => r.data);

export const clientFetchOrdersByPhone = (phone) =>
  api.get('/orders', { params: { phone } }).then((r) => r.data);


export const clientFetchSettings = () => api.get('/settings').then((r) => r.data);

export const clientVerifyCoupon = (code) => api.post('/verify-coupon', { code }).then((r) => r.data);

export const clientUploadScreenshot = (invoiceId, screenshot) =>
  api.put(`/orders/${invoiceId}/screenshot`, { screenshot }).then((r) => r.data);

export const clientFetchCoupons = () => api.get('/coupons').then((r) => r.data);
