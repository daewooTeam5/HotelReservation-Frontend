<template>
  <PrimeCard class="shadow-md">
    <template #header>
      <div class="bg-blue-500 text-white py-4 px-6">
        <h2 class="text-2xl font-bold">결제 정보</h2>
      </div>
    </template>
    <template #content>
      <div class="p-4 space-y-6">
        <div class="flex justify-between border-b pb-4">
          <span class="font-semibold">예약 ID</span>
          <span>{{ reservationId }}</span>
        </div>

        <div class="flex justify-between border-b pb-4">
          <span class="font-semibold">결제 금액</span>
          <span class="text-red-600 font-bold">₩{{ amount.toLocaleString() }}</span>
        </div>

        <div class="flex justify-between border-b pb-4">
          <span class="font-semibold">결제 방법</span>
          <span>신용카드</span>
        </div>

        <!-- Toss 위젯이 렌더링될 위치 -->
        <div id="payment"></div>
        <div id="agreement"></div>

        <div class="mt-8 flex justify-center">
          <PrimeButton
            severity="success"
            size="large"
            @click="completePayment"
            class="px-8 py-2"
          >
            <i class="pi pi-credit-card mr-2"></i>
            결제하기
          </PrimeButton>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, watch, ref, onMounted } from 'vue';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { apiClient } from '@/utils/axiosClient.ts';

const reservationData = ref<any | null>(null);

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

// 결제 완료 처리
const completePayment = async () => {
  if (!widgets) {
    alert('결제 위젯이 아직 준비되지 않았습니다 🥲');
    return;
  }

  // Toss 결제 요청
  await widgets.requestPayment({
    orderId: reservationData?.value?.orderId, // 주문 고유번호
    orderName: '호텔 예약 결제',
    successUrl: `${window.location.origin}/places/success?reservationId=${encodeURIComponent(props.reservationId)}&orderId=${encodeURIComponent(reservationData?.value?.orderId || '')}`,
    failUrl: `${window.location.origin}/places/payment?status=fail&reservationId=${encodeURIComponent(props.reservationId)}&orderId=${encodeURIComponent(reservationData?.value?.orderId || '')}`
  });

  // (옵션) 성공 시 부모 컴포넌트로 이벤트 emit
  emit('payment-complete', props.reservationId);
};

// Reservation ID 바뀔 때 위젯 세팅 (즉시 실행)
onMounted(
  async () => {

    const result = await apiClient.get(`/v1/payment/reservation/${props.reservationId}`);

    const customerKey = result.data.data.guest.users
      ? result.data.data.guest.users.userId
      : result.data.data.firstName +
        result.data.data.guest.firstName +
        result.data.data.guest.lastName +
        encodeURIComponent(result.data.data.guest.email);

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
  },
);
</script>

<style scoped>
</style>
