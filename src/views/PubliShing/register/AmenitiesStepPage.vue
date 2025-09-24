// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/AmenitiesStepPage.vue
<script lang="ts" setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const newLanguage = ref('');
const showInput = ref(false);

const addLanguage = () => {
  if (!newLanguage.value.trim()) return;
  store.addLanguage(newLanguage.value);
  newLanguage.value = '';
  showInput.value = false;
};

const goPrev = () => router.push('/publishing/register/images');
const goNext = () => router.push('/publishing/register/policy');
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
    <div>
      <p style="font-size: 24px;" class="font-bold items-center text-center
       text-blue-400 dark:text-gray-200 mb-2">편의시설 제공리스트</p>
      <div>
        <label v-for="(a, idx) in store.amenities" :key="idx" class="flex items-center gap-2">
          <input type="checkbox" v-model="a.checked" class="w-4 h-4" />
          <p style="font-size: 18px; margin-top: 5px; margin-bottom:5px;" class=" text-gray-700 dark:text-gray-200">{{ a.name }}</p>
        </label>
      </div>
    </div>



    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>

