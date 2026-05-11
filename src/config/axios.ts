import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trimedh-service.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Ajouter token et tenant_id automatiquement
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const tenantId = localStorage.getItem('tenant_id');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;

  console.log(`[API] ${config.method?.toUpperCase()} ${API_BASE_URL}${config.url}`);

  return config;
});

// Gérer refresh token automatique
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/comptes/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axiosInstance(error.config);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/connexion';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;