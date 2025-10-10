<template>
  <PrimeCard class="shadow-md">
    <template #header>
      <div style="margin-bottom: 10px;" class="bg-green-500 text-white py-4 px-6">
        <h2 class="text-2xl font-bold">예약 완료</h2>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-6 text-center">


        <h3 style="margin-bottom: 10px;" class="text-2xl font-bold mt-4">
          <i class="pi pi-check-circle text-green-500 text-8xl" style="margin-right: 6px;"></i>예약이 성공적으로 완료되었습니다!</h3>

        <!-- 로딩/에러 처리 -->
        <div v-if="isLoading" class="py-4">
          <p class="text-gray-500">예약 정보를 불러오는 중...</p>
        </div>
        <div v-else-if="isError" class="py-4 text-red-500">
          예약 정보를 불러오는데 실패했습니다.
        </div>

        <!-- 예약 상세 정보 -->
        <div v-else class="my-4 py-4 border-y text-left">
          <p class="text-lg">
            예약 ID: <span class="font-bold">{{ reservationData?.reservationId }}</span>
          </p>
          <p class="text-lg">
            주문 번호: <span class="font-bold">{{ reservationData?.orderId }}</span>
          </p>
          <p class="text-gray-600 mt-2">
            예약 상태: <span class="font-semibold">{{ reservationData?.status }}</span>
          </p>
          <p class="text-gray-600 mt-2">
            결제 상태: <span class="font-semibold">{{ reservationData?.paymentStatus }}</span>
          </p>
          <p class="text-gray-600 mt-2">
            예약 기간: {{ reservationData?.resevStart }} ~ {{ reservationData?.resevEnd }}
          </p>
          <p class="text-gray-600 mt-2">
            호텔: {{ reservationData?.room_place_name }}
          </p>
          <p class="text-gray-600 mt-2">
            객실 타입: {{ reservationData?.room_roomType }} / {{ reservationData?.room_bedType }}
          </p>
          <p class="text-gray-600 mt-2">
            인원: {{ reservationData?.room_capacityPeople }}명
          </p>
          <p class="text-gray-600 mt-2">
            결제 금액: <span class="font-semibold">{{ reservationData?.finalAmount.toLocaleString() }}원</span>
          </p>
        </div>

        <!-- 버튼 -->
        <div class="mt-8 flex justify-center gap-4">
          <!-- 로그인 된 경우만 예약 목록 버튼 노출 -->
          <PrimeButton
            v-if="isLoggedIn"
            severity="info"
            class="px-6 py-2"
            @click="goToReservationList"
          >
            <i class="pi pi-list mr-2"></i>
            예약 목록으로
          </PrimeButton>

          <!-- 홈 버튼은 항상 -->
          <PrimeButton
            severity="secondary"
            class="px-6 py-2"
            @click="goToHome"
            style="margin-top: 10px;"
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
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { defineProps, defineEmits } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';


const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.accessToken);

// Props
const props = defineProps<{ reservationId: string }>();

// API 호출
const { isLoading, isError, data, error } = useQuery({
  queryKey: ['v1','payment','reservation','info',props.reservationId],
  queryFn: httpFetcher
});

// reservationData 계산
const reservationData = computed(() => data.value?.data);

// Emits
const emit = defineEmits<{
  'go-to-list': [];
  'go-to-home': [];
}>();

const goToReservationList = () => emit('go-to-list');
const goToHome = () => emit('go-to-home');
</script>

<style scoped>
</style>
