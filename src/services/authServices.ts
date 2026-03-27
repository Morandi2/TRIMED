/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from '../config/axios';

const jwtDecode = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur décodage token:', error);
    return null;
  }
};

export const authService = {
  async login(email: string, password: string) {
    const response = await axiosInstance.post('/auth/login/', { email, password });
    const { access, refresh, user } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwtDecode(access);
    if (decoded && decoded.tenant_id) {
      localStorage.setItem('tenant_id', decoded.tenant_id);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
    localStorage.clear();
  },

  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};