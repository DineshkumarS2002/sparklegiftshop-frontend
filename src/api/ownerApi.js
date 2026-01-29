import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sparklegiftshop-backend.onrender.com/api',
});

export const ownerFetchProducts = () => api.get('/products').then((r) => r.data);
export const ownerCreateProduct = (payload) => api.post('/products', payload).then((r) => r.data);
export const ownerUpdateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data);
export const ownerDeleteProduct = (id) => api.delete(`/products/${id}`);

export const ownerFetchOrders = () => api.get('/orders').then((r) => r.data);
export const ownerGetOrder = (idOrInvoiceId) => api.get(`/orders/${idOrInvoiceId}`).then((r) => r.data);
export const ownerDeleteOrder = (id) => api.delete(`/orders/${id}`);
export const ownerToggleDispatch = (id, dispatched) => api.patch(`/orders/${id}/dispatch`, { dispatched }).then(r => r.data);

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
