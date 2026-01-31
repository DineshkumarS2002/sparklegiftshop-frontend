import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sparklegiftshop-backend.onrender.com/api';

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
