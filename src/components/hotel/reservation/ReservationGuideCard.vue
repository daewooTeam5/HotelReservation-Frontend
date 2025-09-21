<script lang="ts" setup>
import { useAuthStore } from '@/stores/authStore.ts';

const { userAuth } = useAuthStore();
</script>

<template>
  <div class="flex-2">
    <PrimeCard class="shadow-sm border border-gray-200">
      <template #content>
        <div class="flex items-center gap-2 p-3 text-sm text-gray-700">
          <template v-if="!userAuth">
            <i class="pi pi-user text-blue-500"></i>
            <span>로그인하면 더 간편하게 예약할 수 있어요 ✨</span>
            <router-link to="/auth/signin">로그인/회원가입</router-link>
          </template>
          <template v-else>
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ userAuth.name }}님, 환영합니다!</span>
          </template>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<style scoped>
</style>

