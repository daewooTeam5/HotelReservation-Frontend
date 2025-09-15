// stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // state
  const accessToken = ref<string | null>(null);
  const otpEmail = ref<string | null>(null);

  // getters (computed)
  const getAccessToken = computed(() => accessToken.value);
  const getOtpEmail = computed(() => otpEmail.value);

  // actions (setter)
  const setAccessToken = (token: string | null) => {
    accessToken.value = token;
  };
  const setOtpEmail = (email: string | null) => {
    otpEmail.value = email;
  };

  return {
    accessToken,
    otpEmail,
    getAccessToken,
    getOtpEmail,
    setAccessToken,
    setOtpEmail
  };
});
