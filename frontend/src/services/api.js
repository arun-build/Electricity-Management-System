import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eb_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login attempt failure
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('eb_auth_token');
        localStorage.removeItem('eb_auth_user');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  getTariffs: () => api.get('/admin/tariffs'),
  updateTariffs: (tariffData) => api.put('/admin/tariffs', tariffData),
  calculatePreview: (readings) => api.post('/admin/calculate-preview', readings),
  generateBill: (billData) => api.post('/admin/generate-bill', billData),
};

export const consumerAPI = {
  listConsumers: (params) => api.get('/consumers', { params }),
  getConsumer: (id) => api.get(`/consumers/${id}`),
  createConsumer: (data) => api.post('/consumers', data),
  updateConsumer: (id, data) => api.put(`/consumers/${id}`, data),
  toggleStatus: (id) => api.patch(`/consumers/${id}/status`),
};

export const billAPI = {
  getBills: (params) => api.get('/bills', { params }),
  getBillDetail: (id) => api.get(`/bills/${id}`),
  payBill: (id, paymentData) => api.post(`/bills/${id}/pay`, paymentData),
  getAnalytics: (params) => api.get('/bills/analytics', { params }),
};

export default api;
