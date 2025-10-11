<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

onMounted(async () => {
  try {
    // URL에서 code와 state 파라미터 추출
    const code = route.query.code as string;
    const state = route.query.state as string;

    if (!code) {
      console.error('Authorization code가 없습니다.');
      toast.add({
        severity: 'error',
        summary: '로그인 실패',
        detail: '로그인에 실패했습니다. 다시 시도해주세요.',
        life: 3000
      });
      router.push('/');
      return;
    }

    // 백엔드로 Google 로그인 요청
    const redirectUri = `${window.location.origin}/oauth/google`;

    const response = await apiClient.post('/v1/auth/google', {
      code: code,
      redirectUri: redirectUri
    });

    if (response.data.success) {
      const loginData = response.data.data;

      // 토큰 저장
      if (loginData.accessToken) {
        authStore.setAccessToken(loginData.accessToken);
      }

      toast.add({
        severity: 'success',
        summary: '로그인 성공',
        detail: 'Google 로그인에 성공했습니다.',
        life: 2000
      });

      router.push('/');
    } else {
      throw new Error(response.data.message || '로그인에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('Google 로그인 실패:', error);
    const errorMessage = error?.response?.data?.message || error?.message || '로그인에 실패했습니다.';
    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: errorMessage,
      life: 3000
    });
    router.push('/');
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="mb-4">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
      </div>
      <p class="text-lg text-gray-600">Google 로그인 처리 중...</p>
    </div>
  </div>
</template>

<style scoped>
</style>
