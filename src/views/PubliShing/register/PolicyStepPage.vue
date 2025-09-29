// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/PolicyStepPage.vue
<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const goPrev = () => router.push('/publishing/register/amenities');
const goNext = () => router.push('/publishing/register/address');
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="w-full p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
      <h2 class="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">이용 수칙</h2>

      <div class="space-y-4 mx-auto ">
        <div style="margin-top:8px; margin-bottom:8px;">
          <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 인 시간</p>
          <input
            type="time"
            v-model="store.checkIn"
            class="w-[60%] border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div class="mx-auto">
          <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 아웃 시간</p>
          <input
            type="time"
            v-model="store.checkOut"
            class="w-[60%] border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>





      <div class="flex justify-between pt-4">
        <Button label="이전" severity="secondary" @click="goPrev" />
        <Button label="다음" @click="goNext" />
      </div>
    </div>
  </div>
</template>

