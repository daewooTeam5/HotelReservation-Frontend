import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';

// 환경 변수 값 확인 (디버깅용)
console.log(import.meta.env.VITE_SERVER_URL);

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_MODE === 'development'
    ? "http://localhost:8080/api"
    : import.meta.env.VITE_SERVER_URL,
  // 기본 Content-Type 설정은 여기서 삭제합니다.
  withCredentials: true,
});

// 1. 요청 인터셉터 (Request Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    // 액세스 토큰이 있으면 헤더에 추가
    if (authStore.getAccessToken) {
      config.headers.Authorization = `Bearer ${authStore.getAccessToken}`;
    }

    // [핵심 수정] 데이터가 FormData가 아닐 경우에만 Content-Type을 'application/json'으로 설정
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // FormData일 경우, axios가 자동으로 Content-Type을 설정하도록 아무것도 하지 않음

    return config;
  },
  (error) => {
    // 요청 오류 처리
    return Promise.reject(error);
  }
);

// 2. 응답 인터셉터 (Response Interceptor)
apiClient.interceptors.response.use(
  (res) => res, // 정상 응답은 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // 특정 URL(예: /auth/code)에서는 재시도 로직을 실행하지 않음
    if (originalRequest.url?.includes('/auth/code')) {
      return Promise.reject(error);
    }

    // 401 에러이고, 재시도한 요청이 아닐 경우 토큰 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        // 토큰 재발급을 위한 별도의 axios 인스턴스 생성
        const refreshClient = axios.create({
          baseURL: apiClient.defaults.baseURL,
          withCredentials: true,
        });

        // 리프레시 토큰으로 새 액세스 토큰 요청
        const res = await refreshClient.post('../auth/token');
        const newAccessToken = res.data.data.accessToken;

        // Pinia 스토어에 새 액세스 토큰 저장
        const { setAccessToken } = useAuthStore();
        setAccessToken(newAccessToken);

        // 원래 요청 헤더에 새 토큰을 설정하여 재요청
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // 리프레시 토큰마저 만료된 경우 (로그아웃 처리 필요)
        console.error('리프레시 토큰 만료! 로그아웃 처리');
        // 여기서 로그아웃 로직을 호출할 수 있습니다.
        // const { logout } = useAuthStore();
        // logout();

        return Promise.reject(refreshError);
      }
    }

    // 그 외의 모든 에러는 그대로 반환
    return Promise.reject(error);
  }
);
