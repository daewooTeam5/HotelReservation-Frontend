import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';


export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Request interceptor
apiClient.interceptors.request.use(config => {
  const { accessToken } = useAuthStore();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshClient = axios.create({
          baseURL: apiClient.defaults.baseURL,
          withCredentials: true
        });
        const res = await refreshClient.post('../auth/token');
        const newAccessToken = res.data.data.accessToken;

        const { setAccessToken } = useAuthStore();
        setAccessToken(newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('리프레시 토큰 만료! 로그아웃 처리');

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
