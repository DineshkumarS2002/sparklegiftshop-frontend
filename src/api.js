import axios from 'axios';

const getBaseURL = () => {
  // If explicitly set in environment, use that
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }

  // If running on local machine, use localhost (unless environment variable overrides it)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  }

  // Fallback to production Render URL
  return 'https://sparklegiftshop-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export const fetchProducts = () => api.get('/products').then((res) => res.data);
export const createProduct = (payload) => api.post('/products', payload).then((res) => res.data);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((res) => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const fetchCart = () => api.get('/cart').then((res) => res.data);
export const addToCart = (productId) =>
  api.post('/cart/add', { productId, quantity: 1 }).then((res) => res.data);
export const updateCartItem = (productId, quantity) =>
  api.put(`/cart/item/${productId}`, { quantity }).then((res) => res.data);
export const clearCart = () => api.post('/cart/clear').then((res) => res.data);

export const createOrder = (payload) => api.post('/orders', payload).then((res) => res.data);
export const fetchOrders = () => api.get('/orders').then((res) => res.data);

export const fetchReport = (range) => api.get('/reports/summary', { params: { range } }).then((res) => res.data);
export const exportReport = (range) =>
  api.get('/reports/export', { params: { range }, responseType: 'blob' }).then((res) => res.data);

export const buildWhatsAppLink = (payload) =>
  api.post('/whatsapp-link', payload).then((res) => res.data.url);

export const fetchSettings = () => api.get('/settings').then((res) => res.data);
export const updateSettings = (payload) => api.put('/settings', payload).then((res) => res.data);
