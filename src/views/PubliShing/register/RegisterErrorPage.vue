// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/RegisterErrorPage.vue
<script lang="ts" setup>
import Button from 'primevue/button';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const title = (route.query.title as string) || '문제가 발생했어요';
const detail = (route.query.detail as string) || '잠시 후 다시 시도해 주세요.';

const goBack = () => router.push('/publishing/register/confirm');
</script>

<template>
  <div class="p-8 bg-white dark:bg-gray-800 rounded-md shadow-sm max-w-xl mx-auto text-center space-y-4">
    <h2 class="text-xl font-bold text-red-600">{{ title }}</h2>
    <p class="text-gray-700 dark:text-gray-200">{{ detail }}</p>
    <div class="pt-4">
      <Button label="돌아가기" severity="secondary" @click="goBack" />
    </div>
  </div>
</template>

