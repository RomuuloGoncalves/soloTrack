import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const isProduction = import.meta.env.PROD;

const api: AxiosInstance = axios.create({
  baseURL: isProduction ? 'https://solotrack-backend-1kb9.onrender.com/api' : '/api'
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = Cookies.get('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    config.headers['Content-Type'] = 'application/json';
    config.headers['ngrok-skip-browser-warning'] = '69420';

    return config;
  },
  (error: any) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      localStorage.removeItem('usuario');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;