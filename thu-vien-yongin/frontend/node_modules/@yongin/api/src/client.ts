import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('yongin-auth');
  if (stored) {
    const { accessToken } = JSON.parse(stored);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('yongin-auth');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
