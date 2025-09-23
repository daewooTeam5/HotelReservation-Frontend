// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/PolicyStepPage.vue
<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const goPrev = () => router.push('/publishing/register/amenities');
const goNext = () => router.push('/publishing/register/pricing');
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-4">
    <h2 class="text-lg font-semibold">이용 수칙</h2>

    <div>
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 인 시간</p>
      <InputText v-model="store.rooms.checkIn" placeholder="예: 15:00" class="w-full" />
    </div>

    <div>
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 아웃 시간</p>
      <InputText v-model="store.rooms.checkOut" placeholder="예: 11:00" class="w-full" />
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>

