<script setup lang="ts">
import type { UserCoupon } from '@/types/coupon';
import { computed } from 'vue';

const props = defineProps<{
  coupon: UserCoupon;
  // 외부에서 비활성화 여부를 명시적으로 전달할 수 있음
  inactive?: boolean;
}>();

const isExpired = computed(() => new Date(props.coupon.expiredAt).getTime() < Date.now());
const isUsed = computed(() => props.coupon.isUsed);

// 전달받은 inactive 우선, 없으면 만료/사용됨 기준으로 처리
const isInactive = computed(() => props.inactive ?? (isExpired.value || isUsed.value));

const discountText = computed(() =>
  props.coupon.couponType === 'rate'
    ? `${props.coupon.amount}%`
    : `${props.coupon.amount.toLocaleString()}원`
);

const minText = computed(() => `${props.coupon.minOrderAmount.toLocaleString()}원`);

const statusText = computed(() => {
  if (isUsed.value) return '사용됨';
  if (isExpired.value) return '만료';
  return '미사용';
});
</script>

<template>
  <PrimeCard :pt="{ root: { class: isInactive ? 'opacity-60 grayscale' : '' } }">
    <template #title>
      <div class="flex items-center gap-2" :class="isInactive ? 'line-through text-gray-400' : ''">
        <i class="pi pi-ticket" />
        <span>{{ coupon.couponName }}</span>
      </div>
    </template>
    <template #subtitle>
      <div :class="['text-sm', isInactive ? 'line-through text-gray-400' : 'text-gray-500']">
        {{ coupon.placeName }}
      </div>
    </template>
    <template #content>
      <div class="text-sm flex flex-col gap-1" :class="isInactive ? 'line-through text-gray-400' : ''">
        <div>
          할인: <b>{{ discountText }}</b>
        </div>
        <div>최소 주문 금액: {{ minText }}</div>
        <div>만료일: {{ new Date(coupon.expiredAt).toLocaleDateString() }}</div>
        <div>
          상태:
          <span :class="[
            'inline-block px-2 py-0.5 rounded text-xs',
            isUsed ? 'bg-gray-200 text-gray-700' : isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          ]">{{ statusText }}</span>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
/* 추가적인 커스텀 스타일이 필요하면 여기에 */
</style>

