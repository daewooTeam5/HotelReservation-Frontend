// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/AddressStepPage.vue
<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const goPrev = () => router.push('/publishing/register/pricing');
const goNext = () => router.push('/publishing/register/confirm');
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-3">
    <InputText v-model="store.address.sigungu" placeholder="시/군/구" class="w-full" />
    <InputText v-model="store.address.sido" placeholder="시/도" class="w-full" />
    <InputText v-model="store.address.roadName" placeholder="도로명" class="w-full" />
    <InputText v-model="store.address.postalCode" placeholder="우편번호" class="w-full" />
    <InputText v-model="store.address.detailAddress" placeholder="상세주소" class="w-full" />

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>

