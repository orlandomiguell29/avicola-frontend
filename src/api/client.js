import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://avicola-backend-5d7t.onrender.com/api',
  withCredentials: true
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export default api;
