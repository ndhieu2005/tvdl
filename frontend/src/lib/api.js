import axios from 'axios';

// Mặc định đi qua proxy (Vite dev / nginx); đặt VITE_API_URL khi backend ở origin khác
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL: API_BASE });

const adminApi = axios.create({ baseURL: `${API_BASE}/admin` });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('tvdl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tvdl_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export { api, adminApi };
