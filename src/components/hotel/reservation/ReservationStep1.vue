<template>
  <div class="md:space-y-4 ">
    <div class="mb-4!">
      <ReservationGuideCard />
    </div>

    <div class="flex flex-col lg:flex-row gap-4 lg:gap-8">

      <div class="w-full lg:flex-2 space-y-4 gap-4 flex flex-col">
        <ReservationForm
          ref="formRef"
          @data-change="handleReservationDataChange"
          @submit="handleReservationSubmit"
        />
        <ReservationRequestCard @request-change="handleRequestChange" />
        <ReservationAgreementCard @agreement-change="handleAgreementChange" />
      </div>

      <div class="w-full lg:flex-1 space-y-4 gap-4 flex flex-col">
        <ReservationHotelCard :hotel-id="Number(hotelId) || 1" />
        <ReservationScheduleCard :check-in="checkIn" :check-out="checkOut" />
        <ReservationCouponCard
          :place-id="roomInfo?.placeId"
          :order-amount="subtotal"
          @coupon-change="onCouponChange"
        />
        <ReservationPointCard
          :order-amount="subtotal"
          :max-usable-points="maxUsablePoints"
          @point-change="onPointChange"
        />
        <ReservationPaymentCard
          :room-count="parseInt(rooms)"
          :price="roomInfo?.price"
          :final-price="roomInfo?.finalPrice"
          :check-in="checkIn"
          :check-out="checkOut"
          :discount="discount"
          :points-discount="usedPoints"
        />
      </div>
    </div>

    <div class="sticky bottom-0 z-50 w-full bg-white shadow-t-lg border-t border-gray-100 border-t-4 rounded-tr-2.5! rounded-tr-2.5! border-t-blue-400">
      <div class="w-full mx-auto px-4 md:px-6 py-4">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div class="w-full sm:w-auto text-center sm:text-left">
            <p class="text-lg font-bold">
              총 결제 금액:
              <span class="text-red-600">₩{{ finalAmount.toLocaleString() }}</span>
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
            class="px-8 py-2 font-semibold w-full sm:w-auto"
          >
            <i class="pi pi-arrow-right mr-2"></i>
            다음 단계로
          </PrimeButton>
        </div>
      </div>
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
import ReservationCouponCard from '@/components/hotel/reservation/ReservationCouponCard.vue';
import ReservationPointCard from '@/components/hotel/reservation/ReservationPointCard.vue';
import { ref, computed, defineProps, defineEmits } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import type { RoomInfo } from '@/types/room';
import type { AvailablePlaceCoupon } from '@/types/coupon';

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
  'next-step': [reservationId: string, orderId?: string, couponId?: number]
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
const selectedCoupon = ref<AvailablePlaceCoupon | null>(null);
const usedPoints = ref<number>(0);

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

// 쿠폰 선택 변경
const onCouponChange = (coupon: AvailablePlaceCoupon | null) => {
  selectedCoupon.value = coupon;
};

// 쿠폰/프로모션 할인 적용 후 결제금액의 10%까지만 포인트 사용 가능
const maxUsablePoints = computed(() => {
  // 쿠폰/프로모션 할인 적용 후 금액
  const discounted = subtotal.value - discount.value;
  // 10% 계산, 소수점 버림
  return Math.floor(discounted * 0.1);
});

// 포인트 사용 변경 (10% 초과 입력 시 자동 조정)
const onPointChange = (points: number) => {
  const max = maxUsablePoints.value;
  usedPoints.value = Math.min(points, max);
};

// 예약 유효성 검사
const isReservationValid = computed(() => {
  const hasUserInfo =
    reservationData.value &&
    reservationData.value.lastName &&
    reservationData.value.firstName &&
    reservationData.value.email &&
    reservationData.value.phoneNumber;

  const phone = reservationData.value?.phoneNumber ?? '';
  const isPhoneOk = /^\d+$/.test(phone);

  const hasAgreements = agreementsValid.value;

  return hasUserInfo && isPhoneOk && hasAgreements;
});

// ✅ 금액 계산
const nightCount = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0;
  const checkInDate = new Date(props.checkIn);
  const checkOutDate = new Date(props.checkOut);
  return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
});

// 소계(할인 전): 1박 요금 × 박수 × 객실 수
const subtotal = computed(() => {
  const info = props.roomInfo;
  if (!info || !info.finalPrice || nightCount.value <= 0) return 0;
  const roomCount = parseInt(props.rooms || '1');
  return info.finalPrice * nightCount.value * (isNaN(roomCount) ? 1 : roomCount);
});

// 원가(할인 전): price × 박수 × 객실 수
const totalOrigin = computed(() => {
  const info = props.roomInfo;
  if (!info || !info.price || nightCount.value <= 0) return 0;
  const roomCount = parseInt(props.rooms || '1');
  return info.price * nightCount.value * (isNaN(roomCount) ? 1 : roomCount);
});

// 쿠폰 할인 금액
const discount = computed(() => {
  const coupon = selectedCoupon.value;
  const base = subtotal.value;
  if (!coupon || base <= 0) return 0;
  const raw = coupon.couponType === 'rate' ? Math.floor((base * coupon.amount) / 100) : coupon.amount;
  return Math.min(raw, base);
});

// 최종 결제 금액
const finalAmount = computed(() => {
  const total = subtotal.value - discount.value;
  return Math.max(total - usedPoints.value, 0);
});

// 전체 할인 금액 (원가 - 최종 결제 금액)
const discountAmount = computed(() => {
  return totalOrigin.value - finalAmount.value;
});

// 폼 ref (노출 메서드 타입 정의)
type ReservationFormExpose = { validateAndFocus: () => boolean };
const formRef = ref<ReservationFormExpose | null>(null);

// 1단계 완료 및 다음 단계로 이동
const completeStep1 = async () => {
  // 버튼 클릭 시 폼 내부 유효성 검사 + 포커스 이동
  const ok = formRef.value?.validateAndFocus?.();
  if (!ok) return;

  if (!isReservationValid.value) {
    // 내부 필드 중 포커스 처리로 안내되므로 추가 얼럿은 생략
    return;
  }

  try {
    isProcessing.value = true;
    console.log(discount);

    // 백엔드에 예약 정보 저장 요청 (couponId는 바디에 포함, 가격 대신 숙박일수 전달)
    const response = await apiClient.post('/v1/payment/process', {
      firstName: reservationData.value?.firstName,
      lastName: reservationData.value?.lastName,
      email: reservationData.value?.email,
      phone: reservationData.value?.phoneNumber,
      checkIn: props.checkIn,
      checkOut: props.checkOut,
      nights: nightCount.value,
      request: specialRequest.value,
      roomId: props.roomId,
      roomCount: props.rooms,
      couponId: selectedCoupon.value?.id,
      usedPoints: usedPoints.value,
      discountAmount: discountAmount.value // <-- 전체 할인 금액 전달
    });

    // 예약 ID를 부모 컴포넌트로 전달 (couponId도 함께 전달)
    const reservationId = response.data.data.reservationId || 'temp-id-123';
    const orderId = response.data.data.orderId as string | undefined;
    const couponId = selectedCoupon.value?.id;
    console.log('예약 ID:', reservationId);

    // 다음 단계로 이동 이벤트 발생 (orderId, couponId 함께 전달)
    emit('next-step', reservationId, orderId, couponId);
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
