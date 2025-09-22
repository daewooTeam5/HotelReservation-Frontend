<template>
  <PrimeCard class="shadow-md">
    <template #header>
      <div class="bg-green-500 text-white py-4 px-6">
        <h2 class="text-2xl font-bold">예약 완료</h2>
      </div>
    </template>
    <template #content>
      <div class="p-4 space-y-6 text-center">
        <i class="pi pi-check-circle text-green-500 text-8xl"></i>

        <h3 class="text-2xl font-bold mt-4">예약이 성공적으로 완료되었습니다!</h3>

        <div class="my-4 py-4 border-y">
          <p class="text-lg">예약 ID: <span class="font-bold">{{ reservationId }}</span></p>
          <p class="text-gray-600 mt-2">예약 상세 정보는 이메일로 발송되었습니다.</p>
        </div>

        <div class="mt-8 flex justify-center">
          <PrimeButton
            severity="info"
            class="px-6 py-2 mr-4"
            @click="goToReservationList"
          >
            <i class="pi pi-list mr-2"></i>
            예약 목록으로
          </PrimeButton>

          <PrimeButton
            severity="secondary"
            class="px-6 py-2"
            @click="goToHome"
          >
            <i class="pi pi-home mr-2"></i>
            홈으로
          </PrimeButton>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

// Props from parent
const props = defineProps<{
  reservationId: string;
}>();

// Emits to parent
const emit = defineEmits<{
  'go-to-list': [];
  'go-to-home': [];
}>();

// 예약 목록으로 이동
const goToReservationList = () => {
  emit('go-to-list');
};

// 홈으로 이동
const goToHome = () => {
  emit('go-to-home');
};

</script>

<style scoped>
</style>
