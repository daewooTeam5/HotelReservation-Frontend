import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';
import { useRouter } from 'vue-router';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

apiClient.interceptors.request.use(
  (config) => {
    const {accessToken} = useAuthStore();
    console.log('Request Interceptor:', accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // 요청 오류가 있는 경우 수행할 작업
  }
);
apiClient.interceptors.response.use(
  (response) => {
    // 2xx 범위의 상태 코드는 여기를 통과
    return response;
  },
  async (error) => {
    // 2xx 외의 상태 코드는 여기를 통과
    const originalRequest = error.config;
    const router = useRouter();

    // 401 에러이고, 재시도한 요청이 아닐 경우에만 실행
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정 (무한 재발급 방지)

      try {
        const res = await apiClient.post('../auth/token');
        console.log(res);

        const newAccessToken = res.data.data.accessToken; // 실제 응답 구조에 맞게 수정

        // 2. 스토어와 헤더에 새 액세스 토큰 저장
        const { setAccessToken } = useAuthStore();
        setAccessToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        console.log('토큰 재발급 성공! 원래 요청을 다시 시도합니다.');

        // 3. 실패했던 원래 요청을 새 토큰으로 다시 실행
        return apiClient(originalRequest);

      } catch (refreshError) {
        // 리프레시 토큰마저 만료된 경우 (재발급 실패)
        console.error('리프레시 토큰 만료! 로그아웃 처리합니다.', refreshError);
        await router.push('/auth/login'); // 로그인 페이지로 리다이렉트
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
