import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const data = localStorage.getItem('gestao_user');
  if (data) {
    const { token } = JSON.parse(data);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gestao_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
