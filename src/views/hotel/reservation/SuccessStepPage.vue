<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import ReservationStep3 from '@/components/hotel/reservation/ReservationStep3.vue';
import { apiClient } from '@/utils/axiosClient.ts';

const route = useRoute();
const router = useRouter();

const reservationId = (route.query.reservationId as string) || '';

onMounted(async () => {
  if (!reservationId) {
    await router.replace({ path: '/places/order', query: { ...route.query } });
  }
  try{
    // TODO: order id 배열로 오는거 처리
    await apiClient.post("v1/payment/confirm",{
      paymentKey: route.query.paymentKey,
      orderId: route.query.orderId[0],
      amount: route.query.amount
    })
  }catch (e:any){
    const title = e?.response?.data?.error?.title || '결제 오류가 발생했어요';
    const detail = e?.response?.data?.error?.detail || '잠시 후 다시 시도해 주세요.';
    await router.replace({
      path: '/places/error',
      query: { ...route.query, title, detail }
    });
  }
});

const goToReservationList = () => {
  router.push('/list');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <ReservationStep3
    :reservation-id="reservationId"
    @go-to-list="goToReservationList"
    @go-to-home="goToHome"
  />
</template>
