import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sparklegiftshop-backend.onrender.com/api',
});

export const clientFetchProducts = () => api.get('/products').then((r) => r.data);
export const clientFetchCart = () => api.get('/cart').then((r) => r.data);
export const clientAddToCart = (productId) =>
  api.post('/cart/add', { productId, quantity: 1 }).then((r) => r.data);
export const clientUpdateCartItem = (productId, quantity) =>
  api.put(`/cart/item/${productId}`, { quantity }).then((r) => r.data);
export const clientClearCart = () => api.post('/cart/clear').then((r) => r.data);

export const clientCreateOrder = (payload) => api.post('/orders', payload).then((r) => r.data);
export const clientGetOrder = (idOrInvoiceId) =>
  api.get(`/orders/${idOrInvoiceId}`).then((r) => r.data);

export const clientFetchSettings = () => api.get('/settings').then((r) => r.data);

export const clientVerifyCoupon = (code) => api.post('/verify-coupon', { code }).then((r) => r.data);
