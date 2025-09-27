<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  price: number | undefined;
  roomCount:number |undefined;
  checkIn: string;
  checkOut: string;
  discount?: number; // 총 할인 금액(쿠폰 등)
}>();

// 숙박 일수 계산
const nights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0;

  const checkInDate = new Date(props.checkIn);
  const checkOutDate = new Date(props.checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// 총 결제 금액(할인 전)
const subtotal = computed(() => {
  const base = (props.price || 0) * nights.value;
  const rooms = props.roomCount ?? 1;
  return base * rooms;
});

// 할인 적용 후 금액
const grandTotal = computed(() => {
  const discount = props.discount || 0;
  const total = subtotal.value - discount;
  return total > 0 ? total : 0;
});

// 금액 포맷팅 (원화)
const formatCurrency = (amount: number): string => {
  return '₩' + amount.toLocaleString('ko-KR');
};
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-credit-card text-blue-500"></i>
          결제 정보
        </h3>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-4">
        <!-- 요금 세부 내역 -->
        <div class="space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">객실 요금</span>
            <span class="font-medium">{{ formatCurrency(price || 0) }}</span>
          </div>

          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">숙박 일수</span>
            <span class="font-medium">{{ nights }}박 (객실수 {{props.roomCount}})</span>
          </div>

          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">소계</span>
            <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
          </div>

          <div v-if="(discount || 0) > 0" class="flex justify-between items-center text-sm text-blue-700">
            <span class="">쿠폰 할인</span>
            <span class="font-medium">-{{ formatCurrency(discount || 0) }}</span>
          </div>

          <div class="border-t border-gray-200 my-2"></div>

          <!-- 총 결제 금액 -->
          <div class="flex justify-between items-center pt-2">
            <span class="font-semibold text-lg">총 결제 금액</span>
            <span class="font-bold text-xl text-red-600">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>

        <!-- 결제 안내 메시지 -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-gray-500 mt-0.5"></i>
            <div class="text-xs text-gray-600">
              <p class="font-medium mb-1">결제 안내</p>
              <p>• 현장에서 결제가 진행됩니다.</p>
              <p>• 부가세 및 봉사료가 포함된 금액입니다.</p>
              <p>• 결제는 체크아웃 시 진행됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
</style>
