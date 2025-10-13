import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseJwt } from '@/utils/jwtUtils';
import type { User } from '@/types/users';
import { apiClient } from '@/utils/axiosClient.ts';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const otpEmail = ref<string | null>(null);
  const userAuth = ref<User | null>(null);
  const isTokenReady = ref(false);

  const getAccessToken = computed(() => accessToken.value);
  const getOtpEmail = computed(() => otpEmail.value);
  const getUserAuth = computed(() => userAuth.value);

  const setAccessToken = (token: string | null) => {
    accessToken.value = token;
    if (token !== null) {
      userAuth.value = parseJwt<User>(token);
    } else {
      userAuth.value = null;
    }
  };

  const setOtpEmail = (email: string | null) => {
    otpEmail.value = email;
  };

  const issueToken = async () => {
    try {
      const response = await apiClient.post('/v1/auth/token');
      const newAccessToken = response.data.data.accessToken;
      setAccessToken(newAccessToken);
    } catch (error) {
      console.error('토큰 발급 중 에러 발생!', error);
      setAccessToken(null);
    } finally {
      isTokenReady.value = true;
    }
  };

  return {
    accessToken,
    otpEmail,
    userAuth,
    isTokenReady,
    getAccessToken,
    getOtpEmail,
    getUserAuth,
    setAccessToken,
    setOtpEmail,
    issueToken,
  };
});
