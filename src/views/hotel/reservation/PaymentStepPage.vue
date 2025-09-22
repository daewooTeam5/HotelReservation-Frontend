<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import ReservationStep2 from '@/components/hotel/reservation/ReservationStep2.vue';
import type { ApiResult } from '@/types/ApiResult.ts';
import type { RoomInfo } from '@/types/room';

const route = useRoute();
const router = useRouter();

// read from query
const reservationId = computed(() => (route.query.reservationId as string) || '');
const orderId = computed(() => (route.query.orderId as string) || undefined);
const checkIn = computed(() => (route.query.checkIn as string) || '');
const checkOut = computed(() => (route.query.checkOut as string) || '');
const rooms = computed(() => (route.query.rooms as string) || '');

// fetch room info to get amount
const { isLoading, isError, error, data } = useQuery<ApiResult<RoomInfo>>({
  queryKey: [
    'v1',
    'rooms',
    rooms.value + `?checkIn=${checkIn.value}&checkOut=${checkOut.value}`
  ],
  queryFn: httpFetcher,
  enabled: !!rooms.value && !!checkIn.value && !!checkOut.value
});

const amount = computed(() => data?.value?.data?.finalPrice || 0);

onMounted(() => {
  if (!reservationId.value) {
    router.replace({ path: '/places/order', query: { ...route.query } });
  }
});

const handlePaymentComplete = (id: string) => {
  router.push({
    path: '/places/success',
    query: {reservationId: id }
  });
};
</script>

<template>
  <div v-if="isLoading">loading...</div>
  <div v-else-if="isError">{{ error }}</div>
  <div v-else>
    <ReservationStep2
      :reservation-id="reservationId"
      :amount="amount"
      :order-id="orderId"
      @payment-complete="handlePaymentComplete"
    />
  </div>
</template>
