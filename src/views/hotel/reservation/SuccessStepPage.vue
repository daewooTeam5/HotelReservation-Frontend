<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import ReservationStep3 from '@/components/hotel/reservation/ReservationStep3.vue';
import { apiClient } from '@/utils/axiosClient.ts';
import ProgressSpinner from 'primevue/progressspinner';

const route = useRoute();
const router = useRouter();

const reservationId = (route.query.reservationId as string) || '';
const isConfirming = ref(true);

onMounted(async () => {
  if (!reservationId) {
    await router.replace({ path: '/places/order', query: { ...route.query } });
    return;
  }
  try {
    // orderId가 배열로 올 수 있어 안전 처리
    const orderIdRaw = route.query.orderId as string | string[] | undefined;
    const orderId = Array.isArray(orderIdRaw) ? orderIdRaw[0] : orderIdRaw;

    await apiClient.post('v1/payment/confirm', {
      paymentKey: route.query.paymentKey,
      orderId,
      amount: route.query.amount
    });
  } catch (e: any) {
    const title = e?.response?.data?.error?.title || '결제 오류가 발생했어요';
    const detail = e?.response?.data?.error?.detail || '잠시 후 다시 시도해 주세요.';
    await router.replace({
      path: '/places/error',
      query: { ...route.query, title, detail }
    });
  } finally {
    isConfirming.value = false;
  }
});

const goToReservationList = () => {
  router.push('/profile/payments');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div v-if="isConfirming" class="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" />
    <div class="text-sm text-gray-600">예약을 확인하는 중입니다...</div>
  </div>
  <ReservationStep3
    v-else
    :reservation-id="reservationId"
    @go-to-list="goToReservationList"
    @go-to-home="goToHome"
  />
</template>
