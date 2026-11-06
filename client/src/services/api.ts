import axios, { AxiosError } from 'axios';
import { ENV } from '../config/env';

export const apiClient = axios.create({
  baseURL: ENV.EXPRESS_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorData = error.response?.data as { message?: string } | undefined;
    const message = errorData?.message || error.message || 'Unknown network error';
    console.error(`[API Error] ${error.config?.method?.toUpperCase() || 'REQ'} ${error.config?.url || ''}:`, message);
    return Promise.reject(error);
  }
);

export default apiClient;
