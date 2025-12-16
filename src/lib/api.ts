import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string) => api.post('/auth/signup', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const transactions = {
  getAll: () => api.get('/transactions'),
  create: (data: any) => api.post('/transactions', data),
  update: (id: string, data: any) => api.put(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

export const categories = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const debts = {
  getAll: () => api.get('/debts'),
  create: (data: any) => api.post('/debts', data),
  update: (id: string, data: any) => api.put(`/debts/${id}`, data),
  delete: (id: string) => api.delete(`/debts/${id}`),
};

export default api;
