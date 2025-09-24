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
  <div class="flex justify-center w-full">
    <div class="w-full p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
      <h2 class="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">이용 수칙</h2>

      <div class="space-y-4 mx-auto ">
        <div style="margin-top:8px; margin-bottom:8px;">
          <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 인 시간</p>
          <input
            type="time"
            v-model="store.rooms.checkIn"
            class="w-[60%] border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div class="mx-auto">
          <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 아웃 시간</p>
          <input
            type="time"
            v-model="store.rooms.checkOut"
            class="w-[60%] border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      <div style="margin-top: 8px;" class="w-[60%] mx-auto border p-4 rounded-md border-gray-300 dark:border-gray-600 space-y-4">
        <div style="margin-bottom: 8px;" class="flex flex-col gap-2">
          <p class="text-gray-700 dark:text-gray-200">반려동물 동반 여부</p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <input type="radio"/>
              <label  class="text-gray-700 dark:text-gray-200">가능</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="radio"/>
              <label  class="text-gray-700 dark:text-gray-200">불가능</label>
            </div>
          </div>
        </div>

        <hr class="border-gray-200 dark:border-gray-700" />

        <div style="margin-top: 8px;" class="flex flex-col gap-2">
          <p class="text-gray-700 dark:text-gray-200">외부음식 반입 여부</p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <input type="radio"/>
              <label  class="text-gray-700 dark:text-gray-200">가능</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="radio" />
              <label  class="text-gray-700 dark:text-gray-200">불가능</label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between pt-4">
        <Button label="이전" severity="secondary" @click="goPrev" />
        <Button label="다음" @click="goNext" />
      </div>
    </div>
  </div>
</template>

