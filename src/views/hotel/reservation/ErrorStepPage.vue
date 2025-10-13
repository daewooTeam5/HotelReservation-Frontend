<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const title = (route.query.title as string) || '결제 오류가 발생했어요';
const detail = (route.query.detail as string) || '잠시 후 다시 시도해 주세요.';

const goToPayment = () => {
  router.push({ path: '/places/payment', query: { ...route.query, title: undefined, detail: undefined } });
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <PrimeCard class="shadow-md">
    <template #header>
      <div class="bg-red-500 text-white py-4 px-6">
        <h2 class="text-2xl font-bold">{{ title }}</h2>
      </div>
    </template>
    <template #content>
      <div class="p-6 space-y-6">
        <p class="text-gray-700 whitespace-pre-line">{{ detail }}</p>
        <div class="flex gap-3">
          <PrimeButton severity="secondary" @click="goToPayment">결제 화면으로</PrimeButton>
          <PrimeButton severity="info" @click="goHome">홈으로</PrimeButton>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

