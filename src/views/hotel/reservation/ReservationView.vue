<script lang="ts" setup>
import ReservationStep1 from '@/components/hotel/reservation/ReservationStep1.vue';
import ReservationStep2 from '@/components/hotel/reservation/ReservationStep2.vue';
import ReservationStep3 from '@/components/hotel/reservation/ReservationStep3.vue';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { RoomInfo } from '@/types/room';
import type { ApiResult } from '@/types/ApiResult.ts';

const route = useRoute();
const router = useRouter();

// 스텝 관리
const activeStep = ref('1');
const reservationId = ref<string | null>(null);
const orderId = ref<string | null>(null);

// 쿼리 파라미터 받기
const queryParams = ref({
  hotelId: route.query.hotelId as string,
  roomId: route.query.roomId as string,
  checkIn: route.query.checkIn as string,
  checkOut: route.query.checkOut as string,
  adults: route.query.adults as string,
  children: route.query.children as string,
  rooms: route.query.rooms as string
});

// 경로 <-> 스텝 매핑
const pathForStep = (step: string) => {
  if (step === '2') return '/places/payment';
  if (step === '3') return '/places/success';
  return '/places/order';
};
const stepForPath = (path: string) => {
  if (path.endsWith('/payment')) return '2';
  if (path.endsWith('/success')) return '3';
  return '1';
};

// 초기 동기화
activeStep.value = stepForPath(route.path);
reservationId.value = (route.query.reservationId as string) || null;
orderId.value = (route.query.orderId as string) || null;
// vue-query 호출
const { isLoading, data, isError, error } = useQuery<ApiResult<RoomInfo>>({
  queryKey: [
    'v1',
    'rooms',
    queryParams.value.roomId +
    `?checkIn=${queryParams.value.checkIn}&checkOut=${queryParams.value.checkOut}`
  ],
  queryFn: httpFetcher
});


// 스텝 변경 시 라우팅 (URL 동기화)
watch(activeStep, (newStep) => {
  const targetPath = pathForStep(newStep);
  if (route.path !== targetPath) {
    router.push({
      path: targetPath,
      query: {
        ...route.query,
        hotelId: queryParams.value.hotelId,
        roomId: queryParams.value.roomId,
        checkIn: queryParams.value.checkIn,
        checkOut: queryParams.value.checkOut,
        adults: queryParams.value.adults,
        children: queryParams.value.children,
        rooms: queryParams.value.rooms,
        reservationId: reservationId.value || undefined,
        orderId: orderId.value || undefined
      }
    });
  }
});

// 라우트 변경 시 스텝/예약아이디 동기화
watch(
  () => route.fullPath,
  () => {
    const nextStep = stepForPath(route.path);
    if (activeStep.value !== nextStep) {
      activeStep.value = nextStep;
    }
    const rid = route.query.reservationId as string | undefined;
    if (rid && reservationId.value !== rid) {
      reservationId.value = rid;
    }
    const oid = route.query.orderId as string | undefined;
    if (oid && orderId.value !== oid) {
      orderId.value = oid;
    }
    // step2/3는 reservationId 필요
    if ((nextStep === '2' || nextStep === '3') && !reservationId.value) {
      activeStep.value = '1';
    }
  }
);

// 단계 완료 핸들러
const handleNextStep = (id: string, oid?: string) => {
  reservationId.value = id;
  orderId.value = oid || null;
  activeStep.value = '2';
};

const handlePaymentComplete = (id: string) => {
  reservationId.value = id;
  activeStep.value = '3';
};

const goToReservationList = () => {
  router.push('/list');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div v-if="isLoading">loading...</div>
  <div v-else-if="isError">{{ error }}</div>
  <div v-else-if="!data">no data</div>
  <div v-else class="space-y-8 px-2 pt-2">
    <!-- ✅ PrimeVue Stepper 올바른 구조 -->
    <Stepper v-model:value="activeStep">
      <!-- Step Labels -->
      <StepList>
        <Step value="1">고객 정보 입력</Step>
        <Step value="2">결제</Step>
        <Step value="3">예약 완료</Step>
      </StepList>

      <!-- Step Panels -->
      <StepPanels>
        <StepPanel value="1">
          <ReservationStep1
            :hotel-id="queryParams.hotelId"
            :room-id="queryParams.roomId"
            :room-info="data?.data!"
            :check-in="queryParams.checkIn"
            :check-out="queryParams.checkOut"
            :adults="queryParams.adults"
            :children="queryParams.children"
            :rooms="queryParams.rooms"
            @next-step="handleNextStep"
          />
        </StepPanel>

        <StepPanel value="2">
          <ReservationStep2
            :reservation-id="reservationId || ''"
            :amount="data?.data?.finalPrice || 0"
            :order-id="orderId || undefined"
            @payment-complete="handlePaymentComplete"
          />
          <div class="flex py-6 gap-2">
            <Button label="이전" severity="secondary" @click="activeStep = '1'" />
          </div>
        </StepPanel>

        <StepPanel value="3">
          <ReservationStep3
            :reservation-id="reservationId || ''"
            @go-to-list="goToReservationList"
            @go-to-home="goToHome"
          />
          <div class="py-6">
            <Button label="이전" severity="secondary" @click="activeStep = '2'" />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
