// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/BasicStepPage.vue
<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const goNext = () => router.push('/publishing/register/rooms');
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-4">
    <div>
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">숙소 이름</p>
      <InputText v-model="store.name" placeholder="숙소 이름" class="w-full" />
    </div>

    <div>
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">숙소 유형</p>
      <select v-model="store.hotelType" class="w-full border rounded p-2">
        <option value="">선택</option>
        <option value="호텔">호텔</option>
        <option value="리조트">리조트</option>
        <option value="게스트하우스">게스트하우스/비앤비</option>
        <option value="아파트">아파트/펜션</option>
        <option value="모텔">모텔</option>
      </select>
    </div>

    <div>
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">설명</p>
      <textarea v-model="store.description" placeholder="설명" class="w-full h-40 border rounded p-2 resize-none" />
    </div>

    <div class="flex justify-end">
      <Button label="다음" icon="pi pi-arrow-right" iconPos="right" @click="goNext" />
    </div>
  </div>
</template>

