<script setup lang="ts">
import { computed } from 'vue';
import PrimeCard from 'primevue/card';

const props = defineProps<{
  // 회원, 비회원 상세 정보를 모두 받을 수 있도록 타입을 유연하게 설정
  reservation: any;
}>();

// 숙박일수 계산
const nights = computed(() => {
  if (!props.reservation.resevStart || !props.reservation.resevEnd) return 0;
  const start = new Date(props.reservation.resevStart);
  const end = new Date(props.reservation.resevEnd);
  // getTime()을 통해 밀리초 단위 시간차를 구하고, 일 단위로 변환
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
});

// '성 + 이름' 형식으로 조합
const fullGuestName = computed(() => {
  // reservation 객체나 lastName이 없을 경우 빈 문자열 반환
  if (!props.reservation || !props.reservation.lastName) return '';
  return `${props.reservation.lastName} ${props.reservation.firstName}`;
});
</script>

<template>
  <div class="space-y-6">
    <PrimeCard>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-building text-xl"></i>
          <span>숙소 정보</span>
        </div>
      </template>
      <template #content>
        <div class="flex items-start gap-4">
          <img :src="reservation.firstImageUrl || '/placeholder.png'" class="w-24 h-24 object-cover rounded-md" alt="숙소 이미지"/>
          <div class="text-sm space-y-1">
            <p class="font-bold text-base">{{ reservation.placeName }}</p>
            <p>{{ reservation.roomType }}</p>
            <p><b>체크인:</b> {{ reservation.resevStart }} {{ reservation.checkIn }}</p>
            <p><b>체크아웃:</b> {{ reservation.resevEnd }}</p>
            <p>({{ nights }}박)</p>
          </div>
        </div>
      </template>
    </PrimeCard>

    <PrimeCard>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-user text-xl"></i>
          <span>예약자 정보</span>
        </div>
      </template>
      <template #content>
        <ul class="text-sm space-y-2">
          <li class="flex justify-between"><span>이름</span><span>{{ fullGuestName }}</span></li>
          <li class="flex justify-between"><span>이메일</span><span>{{ reservation.email }}</span></li>
          <li v-if="reservation.request" class="flex justify-between items-start">
            <span class="flex-shrink-0">요청사항</span>
            <span class="text-right ml-4">{{ reservation.request }}</span>
          </li>
        </ul>
      </template>
    </PrimeCard>

    <PrimeCard>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-credit-card text-xl"></i>
          <span>결제 정보</span>
        </div>
      </template>
      <template #content>
        <ul style="margin-top: 3px; margin-bottom: 3px;" class="text-sm space-y-2">
          <li class="flex justify-between"><span>예약 번호</span><span>#{{ reservation.reservationId }}</span></li>
          <li class="flex justify-between"><span>주문 번호</span><span>{{ reservation.orderId }}</span></li>
          <li class="flex justify-between border-t pt-2 mt-2"><span>상품 금액</span><span>{{ reservation.baseAmount.toLocaleString() }}원</span></li>
          <li v-if="reservation.couponDiscountAmount > 0" class="flex justify-between text-blue-500"><span>쿠폰 할인</span><span>-{{ reservation.couponDiscountAmount.toLocaleString() }}원</span></li>
          <li v-if="reservation.pointDiscountAmount > 0" class="flex justify-between text-blue-500"><span>포인트 사용</span><span>-{{ reservation.pointDiscountAmount.toLocaleString() }}원</span></li>
          <li class="flex justify-between font-bold border-t pt-2 mt-2"><span>총 결제 금액</span><span>{{ reservation.finalAmount.toLocaleString() }}원</span></li>
          <li class="flex justify-between text-gray-500"><span>결제 수단</span><span>{{ reservation.method }}</span></li>
          <li class="flex justify-between text-gray-500"><span>결제 일시</span><span>{{ new Date(reservation.transactionDate).toLocaleString() }}</span></li>
        </ul>
      </template>
    </PrimeCard>
  </div>
</template>
