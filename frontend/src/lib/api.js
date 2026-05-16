import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });

const adminApi = axios.create({ baseURL: '/api/v1/admin' });

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
