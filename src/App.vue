<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from '@/layout/Header.vue';
import { onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import { useAuthStore } from '@/stores/authStore.ts';

const {setAccessToken} = useAuthStore();

onMounted(async () => {
  // 진입시 최초 토큰 발급
  const result = await apiClient.post("../auth/token")
  if(result.data.success){
    setAccessToken(result.data.data.accessToken);
  }
});
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <Header />
    <div class="flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped></style>
