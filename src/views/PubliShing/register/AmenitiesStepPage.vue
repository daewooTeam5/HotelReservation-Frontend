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
      <p class="font-semibold text-gray-700 dark:text-gray-200 mb-2">편의시설</p>
      <div class="grid grid-cols-2 gap-2">
        <label v-for="(a, idx) in store.amenities" :key="idx" class="flex items-center gap-2">
          <input type="checkbox" v-model="a.checked" />
          <span class="text-gray-700 dark:text-gray-200">{{ a.name }}</span>
        </label>
      </div>
    </div>

    <div>
      <p class="font-semibold text-gray-700 dark:text-gray-200 mb-2">제공 언어</p>
      <div class="flex flex-col gap-2">
        <label v-for="(l, idx) in store.languages" :key="idx" class="flex items-center gap-2">
          <input type="checkbox" v-model="l.checked" />
          <span class="text-gray-700 dark:text-gray-200">{{ l.types }}</span>
        </label>
      </div>
      <div class="mt-3 flex items-center gap-2" v-if="showInput">
        <InputText v-model="newLanguage" placeholder="언어 입력" class="flex-1" />
        <Button label="추가" size="small" @click="addLanguage" />
        <Button label="취소" size="small" severity="secondary" @click="showInput = false" />
      </div>
      <div class="mt-2">
        <Button label="언어 추가" size="small" @click="showInput = true" />
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>

