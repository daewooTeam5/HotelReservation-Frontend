// stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseJwt } from '@/utils/jwtUtils.ts';
import type { User } from '@/types/users.ts';

export const useAuthStore = defineStore('auth', () => {
  // state
  const accessToken = ref<string | null>(null);
  const otpEmail = ref<string | null>(null);
  const userAuth = ref<User|null>(null);

  // getters (computed)
  const getAccessToken = computed(() => accessToken.value);
  const getOtpEmail = computed(() => otpEmail.value);
  const getUserAuth = computed(() => userAuth.value);

  // actions (setter)
  const setAccessToken = (token: string | null) => {
    accessToken.value = token;
    if(token!==null){
      userAuth.value = parseJwt<User>(token);
    }
  };
  const setOtpEmail = (email: string | null) => {
    otpEmail.value = email;
  };

  return {
    accessToken,
    otpEmail,
    userAuth,
    getAccessToken,
    getOtpEmail,
    getUserAuth,
    setAccessToken,
    setOtpEmail
  };
});
