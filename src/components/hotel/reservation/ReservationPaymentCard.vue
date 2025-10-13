<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  price: number | undefined; // 원가
  finalPrice?: number | undefined; // 할인된 가격
  roomCount: number | undefined;
  checkIn: string;
  checkOut: string;
  discount?: number; // 쿠폰 할인 금액
  pointsDiscount?: number; // 포인트 할인 금액
}>();

// 숙박 일수 계산
const nights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0;

  const checkInDate = new Date(props.checkIn);
  const checkOutDate = new Date(props.checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// 원가 기준 총액 (할인 전)
const originalTotal = computed(() => {
  const base = (props.price || 0) * nights.value;
  const rooms = props.roomCount ?? 1;
  return base * rooms;
});

// 객실 할인 적용 후 총액 (finalPrice 기준)
const roomDiscountedTotal = computed(() => {
  const base = (props.finalPrice || props.price || 0) * nights.value;
  const rooms = props.roomCount ?? 1;
  return base * rooms;
});

// 객실 자체 할인 금액
const roomDiscount = computed(() => {
  return originalTotal.value - roomDiscountedTotal.value;
});

// 최종 결제 금액 (쿠폰, 포인트 할인 추가 적용)
const grandTotal = computed(() => {
  const coupon = props.discount || 0;
  const points = props.pointsDiscount || 0;
  const total = roomDiscountedTotal.value - coupon - points;
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
          <!-- 할인이 있을 경우에만 원가 표시 -->
          <div v-if="roomDiscount > 0" style="margin-top: 4px; margin-bottom: 4px;" class="flex justify-between items-center text-sm">
            <span class="text-gray-600">객실 요금 (원가)</span>
            <div class="text-right">
              <span class="font-medium text-gray-500 line-through">{{ formatCurrency(price || 0) }}</span>
            </div>
          </div>

          <!-- 할인된 객실 요금 -->
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">객실 요금{{ roomDiscount > 0 ? ' (할인적용)' : '' }}</span>
            <div class="text-right">
              <span class="font-medium" :class="roomDiscount > 0 ? 'text-green-600' : ''">{{ formatCurrency(finalPrice || price || 0) }}</span>
              <span v-if="roomDiscount > 0" class="text-xs text-red-500 ml-1">
                ({{ Math.round(((roomDiscount / originalTotal) * 100)) }}% 할인)
              </span>
            </div>
          </div>

          <div style="margin-top: 4px; margin-bottom: 4px;" class="flex justify-between items-center text-sm">
            <span class="text-gray-600">숙박 일수</span>
            <span class="font-medium">{{ nights }}박 × {{ roomCount }}객실</span>
          </div>

          <!-- 객실 할인이 있는 경우만 표시 -->
          <div v-if="roomDiscount > 0" class="flex justify-between items-center text-sm text-red-600">
            <span class="">객실 할인</span>
            <span class="font-medium">-{{ formatCurrency(roomDiscount) }}</span>
          </div>

          <!-- 소계 (할인 적용 여부에 따라 조건부 표시) -->
          <div v-if="roomDiscount > 0 || (discount || 0) > 0 || (pointsDiscount || 0) > 0" style="margin-top: 4px; margin-bottom: 4px;" class="flex justify-between items-center text-sm">
            <span class="text-gray-600">소계 (객실 할인 적용)</span>
            <span class="font-medium">{{ formatCurrency(roomDiscountedTotal) }}</span>
          </div>

          <!-- 쿠폰 할인 -->
          <div v-if="(discount || 0) > 0" class="flex justify-between items-center text-sm text-blue-700">
            <span class="">쿠폰 할인</span>
            <span class="font-medium">-{{ formatCurrency(discount || 0) }}</span>
          </div>

          <!-- 포인트 할인 -->
          <div v-if="(pointsDiscount || 0) > 0" class="flex justify-between items-center text-sm text-purple-700">
            <span class="">포인트 할인</span>
            <span class="font-medium">-{{ formatCurrency(pointsDiscount || 0) }}</span>
          </div>

          <div class="border-t border-gray-200 my-2"></div>

          <!-- 총 결제 금액 -->
          <div style="margin-bottom: 4px;" class="flex justify-between items-center pt-2">
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
              <p>• 예약 시 전액 결제가 진행됩니다.</p>
              <p>• 결제 완료 후에는 숙소의 취소 및 환불 정책이 적용됩니다.</p>
              <p>• 모든 금액은 세금 및 봉사료가 포함된 최종 요금입니다.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
</style>
