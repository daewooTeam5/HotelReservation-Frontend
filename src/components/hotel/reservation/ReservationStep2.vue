<template>
  <PrimeCard class="shadow-xl rounded-xl overflow-hidden border border-gray-200">
    <!-- 헤더 -->
    <template #header>
      <div class="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-5 px-6">
        <h2 class="text-2xl font-bold tracking-wide">결제 정보</h2>
      </div>
    </template>

    <!-- 콘텐츠 -->
    <template #content>
      <div class="p-6 space-y-5">
        <div class="text-lg font-bold">
          {{reservationData?.room.place.name}} ({{reservationData?.room.roomType }}-{{reservationData?.room.bedType}})
        </div>

        <!-- 투숙객 정보 토글 섹션 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleGuestInfo"
            class="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex justify-between items-center transition-colors duration-200"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="font-semibold text-gray-700">투숙객 정보</span>
              <span v-if="reservationData?.guest.users" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">회원</span>
              <span v-else class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">비회원</span>
            </div>
            <svg
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': showGuestInfo }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <div
            v-if="showGuestInfo"
            class="px-4 py-3 bg-white border-t border-gray-200 space-y-3 transition-all duration-200"
          >
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">이름</span>
              <span class="text-sm font-medium text-gray-800">{{ reservationData?.guest.firstName }} {{ reservationData?.guest.lastName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">이메일</span>
              <span class="text-sm font-medium text-gray-800">{{ reservationData?.guest.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">전화번호</span>
              <span class="text-sm font-medium text-gray-800">{{ reservationData?.guest.phone }}</span>
            </div>
          </div>
        </div>

        <!-- 예약 기본 정보 -->
        <div class="border-t border-gray-200 pt-4"></div>

        <div class="flex justify-between pb-3">
          <span class="font-semibold text-gray-700">예약 ID</span>
          <span class="text-gray-800 font-medium">{{ reservationData?.orderId || props.orderId }}</span>
        </div>

        <div class="flex justify-between pb-3">
          <span class="font-semibold text-gray-700">숙박</span>
          <div class="text-right">
            <span class="text-red-600 font-bold">{{ nights }}박 × {{ rooms }}객실</span>
            <div class="text-gray-500 text-sm mt-1">{{ reservationData?.resevStart }} ~ {{ reservationData?.resevEnd }}</div>
          </div>
        </div>

        <!-- 금액 정보 -->
        <div class="flex justify-between pb-2">
          <span class="font-semibold text-gray-700">기본 금액</span>
          <span class="font-bold text-gray-800">₩{{ reservationData?.baseAmount.toLocaleString() }}</span>
        </div>

        <div class="border-t border-gray-200 pt-4"></div>

        <!-- 쿠폰 할인 -->
        <div class="flex justify-between items-center text-green-600">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            <span class="font-semibold">쿠폰 할인</span>
          </div>
          <span class="font-bold">-₩{{ reservationData?.couponDiscountAmount.toLocaleString() || 0 }}</span>
        </div>

        <!-- 포인트 할인 -->
        <div class="flex justify-between items-center text-green-600 mt-1">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
            </svg>
            <span class="font-semibold">포인트 할인</span>
          </div>
          <span class="font-bold">-₩{{ reservationData?.pointDiscountAmount.toLocaleString() || 0 }}</span>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 my-4"></div>

        <!-- 최종 결제 금액 -->
        <div class="flex justify-between py-2">
          <span class="font-semibold text-lg text-gray-700">최종 결제 금액</span>
          <span class="text-red-600 font-bold text-lg">₩{{ reservationData?.finalAmount.toLocaleString() }}</span>
        </div>

        <!-- Toss 위젯 -->
        <div id="payment" class="mt-4"></div>
        <div id="agreement" class="mt-2"></div>

        <!-- 결제 버튼 -->
        <div class="mt-6 flex justify-center">
          <PrimeButton
            severity="success"
            size="large"
            class="w-full px-10 py-3 text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            @click="completePayment"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            결제하기
          </PrimeButton>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, watch, ref, onMounted, computed } from 'vue';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { apiClient } from '@/utils/axiosClient.ts';
import { useRoute } from 'vue-router';
import type { ApiResult } from '@/types/ApiResult.ts';

const route = useRoute();
const reservationData = ref<any | null>(null);
const showGuestInfo = ref(false);

// Props
const props = defineProps<{
  reservationId: string;
  amount: number;
  orderId?: string;
}>();

// Emits
const emit = defineEmits<{
  'payment-complete': [reservationId: string];
}>();

// Toss 위젯 저장용 전역 변수
let widgets: any = null;

// 투숙객 정보 토글
const toggleGuestInfo = () => {
  showGuestInfo.value = !showGuestInfo.value;
};

// 결제 완료 처리
const completePayment = async () => {
  if (!widgets) {
    alert('결제 위젯이 아직 준비되지 않았습니다 🥲');
    return;
  }

  // Toss 결제 요청
  await widgets.requestPayment({
    orderId: reservationData?.value?.orderId,
    orderName: '호텔 예약 결제',
    successUrl: `${window.location.origin}/places/success?reservationId=${encodeURIComponent(props.reservationId)}&orderId=${encodeURIComponent(reservationData?.value?.orderId || '')}`,
    failUrl: `${window.location.origin}/places/payment?status=fail&reservationId=${encodeURIComponent(props.reservationId)}&orderId=${encodeURIComponent(reservationData?.value?.orderId || '')}`
  });

  // (옵션) 성공 시 부모 컴포넌트로 이벤트 emit
  emit('payment-complete', props.reservationId);
};

const couponDiscount = ref(0);
const pointDiscount = ref(0);

// Reservation ID 바뀔 때 위젯 세팅 (즉시 실행)
onMounted(
  async () => {
    const result = await apiClient.get<ApiResult<any>>(`/v1/payment/reservation/${props.reservationId}`);

    const customerKey = result.data.data.guest.users
      ? result.data.data.guest.users.userId
      : result.data.data.firstName +
      result.data.data.guest.firstName +
      result.data.data.guest.lastName +
      result.data.data.guest.email;
    console.log(customerKey);

    const tossPayments = await loadTossPayments('test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm');
    reservationData.value = result.data.data;

    // 전달된 orderId가 있다면 우선 사용
    if (props.orderId) {
      reservationData.value.orderId = props.orderId;
    }

    // 🔥 전역 변수에 Toss widgets 저장
    widgets = tossPayments.widgets({ customerKey });

    await widgets.setAmount({
      currency: 'KRW',
      value: result.data.data.finalAmount
    });

    await Promise.all([
      widgets.renderPaymentMethods({
        selector: '#payment',
        variantKey: 'DEFAULT'
      }),
      widgets.renderAgreement({
        selector: '#agreement',
        variantKey: 'DEFAULT'
      })
    ]);
  }
);

// 숙박일수 계산 (checkIn, checkOut 차이)
const nights = computed(() => {
  const checkIn = route.query.checkIn as string | undefined;
  const checkOut = route.query.checkOut as string | undefined;

  if (!checkIn || !checkOut) return 1; // 기본 1박

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays > 0 ? diffDays : 1;
});

// 객실 수
const rooms = computed(() =>
  parseInt((route.query.rooms as string) ?? '1')
);
</script>

<style scoped>
</style>
