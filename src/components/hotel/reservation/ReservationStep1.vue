<template>
  <div class="space-y-4">
    <ReservationGuideCard />

    <div class="flex gap-4">
      <!-- 왼쪽 -->
      <div class="flex-2 space-y-4">
        <ReservationForm
          @data-change="handleReservationDataChange"
          @submit="handleReservationSubmit"
        />
        <ReservationRequestCard @request-change="handleRequestChange" />
        <ReservationAgreementCard @agreement-change="handleAgreementChange" />
      </div>

      <!-- 오른쪽 -->
      <div class="flex-1 space-y-4">
        <ReservationHotelCard :hotel-id="Number(hotelId) || 1" />
        <ReservationScheduleCard :check-in="checkIn" :check-out="checkOut" />
        <ReservationPaymentCard
          :room-count="parseInt(rooms)"
          :price="roomInfo?.finalPrice"
          :check-in="checkIn"
          :check-out="checkOut"
        />
      </div>
    </div>

    <!-- 하단 결제 -->
    <div>
      <PrimeCard class="shadow-md border-t-4 border-t-blue-500">
        <template #content>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-lg font-bold">
                총 결제 금액:
                <span class="text-red-600">₩{{ calculateAmount.toLocaleString() }}</span>
              </p>
              <p class="text-xs text-gray-600 mt-1">
                위 정보를 확인한 후 다음 단계로 이동하세요.
              </p>
            </div>
            <PrimeButton
              severity="success"
              size="large"
              :disabled="!isReservationValid"
              :loading="isProcessing"
              @click="completeStep1"
              class="px-8 py-2 font-semibold"
            >
              <i class="pi pi-arrow-right mr-2"></i>
              다음 단계로
            </PrimeButton>
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ReservationHotelCard from '@/components/hotel/reservation/ReservationHotelCard.vue';
import ReservationGuideCard from '@/components/hotel/reservation/ReservationGuideCard.vue';
import ReservationForm from '@/components/hotel/reservation/ReservationForm.vue';
import ReservationScheduleCard from '@/components/hotel/reservation/ReservationScheduleCard.vue';
import ReservationRequestCard from '@/components/hotel/reservation/ReservationRequestCard.vue';
import ReservationPaymentCard from '@/components/hotel/reservation/ReservationPaymentCard.vue';
import ReservationAgreementCard from '@/components/hotel/reservation/ReservationAgreementCard.vue';
import { ref, computed, defineProps, defineEmits } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import type { RoomInfo } from '@/types/room';

// Props from parent
const props = defineProps<{
  hotelId: string;
  roomId: string;
  roomInfo?: RoomInfo;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  rooms: string;
}>();

// Emits to parent
const emit = defineEmits<{
  'next-step': [reservationId: string, orderId?: string]
}>();

// 예약자 정보 타입
interface ReservationUserInfo {
  lastName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
}

// 예약 데이터 상태
const reservationData = ref<ReservationUserInfo | null>(null);
const specialRequest = ref<string>('');
const agreementsValid = ref<boolean>(false);
const isProcessing = ref<boolean>(false);

// 예약 폼에서 데이터 변경 시
const handleReservationDataChange = (data: ReservationUserInfo) => {
  reservationData.value = data;
  console.log('예약 데이터 변경:', data);
};

// 요청사항 변경 시
const handleRequestChange = (request: string) => {
  specialRequest.value = request;
  console.log('요청사항 변경:', request);
};

// 약관 동의 변경 시
const handleAgreementChange = (isValid: boolean) => {
  agreementsValid.value = isValid;
  console.log('약관 동의 상태:', isValid);
};

// 예약 유효성 검사
const isReservationValid = computed(() => {
  const hasUserInfo =
    reservationData.value &&
    reservationData.value.lastName &&
    reservationData.value.firstName &&
    reservationData.value.email &&
    reservationData.value.phoneNumber;

  const hasAgreements = agreementsValid.value;

  return hasUserInfo && hasAgreements;
});

// ✅ 결제 금액 계산 (computed로 변경)
const calculateAmount = computed(() => {
  const info = props.roomInfo;
  if (!info) {
    return 0;
  }
  if (!info?.finalPrice || !props.checkIn || !props.checkOut) {
    return 0;
  }

  const checkInDate = new Date(props.checkIn);
  const checkOutDate = new Date(props.checkOut);
  const nightCount = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return info.finalPrice * nightCount;
});

// 1단계 완료 및 다음 단계로 이동
const completeStep1 = async () => {
  if (!isReservationValid.value) {
    alert('필수 정보를 모두 입력하고 필수 약관에 동의해주세요.');
    return;
  }

  try {
    isProcessing.value = true;

    // 백엔드에 예약 정보 저장 요청
    const response = await apiClient.post('/v1/payment/process', {
      firstName: reservationData.value?.firstName,
      lastName: reservationData.value?.lastName,
      email: reservationData.value?.email,
      phone: reservationData.value?.phoneNumber,
      checkIn: props.checkIn,
      checkOut: props.checkOut,
      paymentAmount: calculateAmount.value,
      request: specialRequest.value,
      roomId: props.roomId,
      roomCount: props.rooms
    });

    // 예약 ID를 부모 컴포넌트로 전달
    const reservationId = response.data.data.reservationId || 'temp-id-123';
    const orderId = response.data.data.orderId as string | undefined;
    console.log('예약 ID:', reservationId);

    // 다음 단계로 이동 이벤트 발생 (orderId 함께 전달)
    emit('next-step', reservationId, orderId);
  } catch (err) {
    console.error('예약 정보 저장 실패:', err);
    alert('예약 정보 저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
  } finally {
    isProcessing.value = false;
  }
};

// 예약 폼 제출 시
const handleReservationSubmit = (data: ReservationUserInfo) => {
  if (!agreementsValid.value) {
    alert('필수 약관에 모두 동의해주세요.');
    return;
  }

  reservationData.value = data;
  console.log('예약 제출 데이터:', data);
  console.log('요청사항:', specialRequest.value);

  completeStep1();
};
</script>

<style scoped>
</style>
