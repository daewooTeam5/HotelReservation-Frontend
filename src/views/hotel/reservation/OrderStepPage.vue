<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import ReservationStep1 from '@/components/hotel/reservation/ReservationStep1.vue';
import type { ApiResult } from '@/types/ApiResult';
import type { RoomInfo } from '@/types/room';

const route = useRoute();
const router = useRouter();

// derive props from query
const hotelId = computed(() => (route.query.hotelId as string) || '');
const roomId = computed(() => (route.query.roomId as string) || '');
const checkIn = computed(() => (route.query.checkIn as string) || '');
const checkOut = computed(() => (route.query.checkOut as string) || '');
const adults = computed(() => (route.query.adults as string) || '');
const children = computed(() => (route.query.children as string) || '');
const rooms = computed(() => (route.query.rooms as string) || '');

console.log(roomId.value);
// fetch room info for step1
const { isLoading, isError, error, data } = useQuery<ApiResult<RoomInfo>>({
  queryKey: [
    'v1',
    'rooms',
    roomId.value + `?checkIn=${checkIn.value}&checkOut=${checkOut.value}`
  ],
  queryFn: httpFetcher,
  enabled: computed(() => !!rooms.value && !!checkIn.value && !!checkOut.value).value
});

const handleNextStep = (reservationId: string, orderId?: string, couponId?: number) => {
  const query: Record<string, any> = { ...route.query, reservationId, orderId };
  if (couponId != null) query.couponId = String(couponId);
  router.push({
    path: '/places/payment',
    query
  });
};
</script>

<template>
  <div v-if="isLoading">loading...</div>
  <div v-else-if="isError">{{ error }}</div>
  <div v-else-if="!data || !data.data">no data</div>
  <div v-else>
    <ReservationStep1
      :hotel-id="hotelId"
      :room-id="roomId"
      :room-info="data?.data || undefined"
      :check-in="checkIn"
      :check-out="checkOut"
      :adults="adults"
      :children="children"
      :rooms="rooms"
      @next-step="handleNextStep"
    />
  </div>
</template>
