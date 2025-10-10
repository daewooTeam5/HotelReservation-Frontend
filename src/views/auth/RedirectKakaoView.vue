<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    // URL에서 code와 state 파라미터 추출
    const code = route.query.code as string;
    const state = route.query.state as string;

    if (!code) {
      console.error('Authorization code가 없습니다.');
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      router.push('/');
      return;
    }

    // 백엔드로 Kakao 로그인 요청
    const redirectUri = `${window.location.origin}/oauth/kakao`;

    const response = await apiClient.post('/v1/auth/kakao', {
      code: code,
      redirectUri: redirectUri
    });

    if (response.data.success) {
      const loginData = response.data.data;

      // 토큰 저장
      if (loginData.accessToken) {
        authStore.setAccessToken(loginData.accessToken);
      }


      alert('Kakao 로그인에 성공했습니다!');
      router.push('/');
    } else {
      throw new Error(response.data.message || '로그인에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('Kakao 로그인 실패:', error);
    const errorMessage = error?.response?.data?.message || error?.message || '로그인에 실패했습니다.';
    alert(errorMessage);
    router.push('/');
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="mb-4">
        <i class="pi pi-spin pi-spinner text-4xl text-yellow-500"></i>
      </div>
      <p class="text-lg text-gray-600">Kakao 로그인 처리 중...</p>
    </div>
  </div>
</template>

<style scoped>
</style>

