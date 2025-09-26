<script setup lang="ts">
import type { ReservationPayment } from '@/types/reservation';

const props = defineProps<{ payment: ReservationPayment; showActions?: boolean }>();
const emit = defineEmits<{ (e: 'details', id: number): void; (e: 'cancel', id: number): void }>();

// 상태별 뱃지 색상
const statusClass = (s: ReservationPayment['status']) => {
  if (s === 'paid') return 'bg-emerald-100 text-emerald-700';
  if (s === 'pending') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

// 투숙객 이름 합치기
const guestName = (p: ReservationPayment) => `${p.guestFirstName} ${p.guestLastName}`.trim();

// 상태별 스타일
const cardAccentClass = () => {
  if (props.payment.status === 'cancelled') return 'opacity-60';
  if (props.payment.status === 'pending') return 'border-l-4 border-amber-300';
  return 'border-l-4 border-emerald-300';
};
const textStyle = () => (props.payment.status === 'cancelled' ? 'line-through text-gray-400' : '');
const thumbStyle = () => (props.payment.status === 'cancelled' ? 'grayscale' : '');
</script>

<template>
  <PrimeCard :pt="{ root: { class: ['w-full', cardAccentClass()] } }">
    <template #content>
      <div class="flex gap-4 items-stretch">
        <!-- Thumbnail -->
        <div :class="['w-40 h-28 shrink-0 overflow-hidden rounded bg-gray-100 flex items-center justify-center', thumbStyle()]">
          <img v-if="payment.firstImageUrl" :src="payment.firstImageUrl" alt="place" class="h-full w-full object-cover" />
          <i v-else class="pi pi-image text-3xl text-gray-400" />
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="font-bold! truncate text-lg " :class="textStyle()">{{ payment.placeName }} · {{ payment.roomType }}</div>
            <span class="text-xs px-2 py-0.5 rounded whitespace-nowrap" :class="statusClass(payment.status)">
              {{ payment.status }}
            </span>
          </div>

          <div :class="textStyle()">예약 ID#{{ payment.reservationId}}</div>
          <div class="mt-2 text-sm grid grid-cols-2 gap-x-6 gap-y-1" :class="textStyle()">
            <div class="text-gray-500">체크인 ~ 체크아웃</div>
            <div>{{ payment.resevStart }} ~ {{ payment.resevEnd }}</div>
            <div class="text-gray-500">결제금액</div>
            <div><b>{{ payment.amount.toLocaleString() }}원</b></div>
            <div class="text-gray-500">결제수단</div>
            <div>{{ payment.method }}</div>
            <div class="text-gray-500">거래일시</div>
            <div>{{ new Date(payment.transactionDate).toLocaleString() }}</div>
            <div class="text-gray-500">투숙객</div>
            <div>{{ guestName(payment) }}</div>
          </div>

          <div class="mt-2 text-xs text-gray-500 truncate" :class="textStyle()">주문번호: {{ payment.orderId }}</div>

          <div v-if="showActions" class="mt-3 flex justify-end gap-2">
            <PrimeButton
              label="상세보기"
              size="small"
              icon="pi pi-search"
              @click="emit('details', payment.paymentId)"
            />
            <PrimeButton
              :disabled="payment.status === 'cancelled'"
              :class="payment.status === 'cancelled'
                ? 'opacity-50 cursor-not-allowed !bg-gray-300 !border-gray-300 !text-gray-500'
                : ''"
              label="취소하기"
              size="small"
              icon="pi pi-times"
              severity="danger"
              @click="emit('cancel', payment.paymentKey)"
            />
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
</style>
