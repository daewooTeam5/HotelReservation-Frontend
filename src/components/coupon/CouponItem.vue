<script setup lang="ts">
import type { UserCoupon } from '@/types/coupon';
import { computed, ref } from 'vue';
import SignInModal from '@/components/auth/SignInModal.vue';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps<{
  coupon: UserCoupon;
  // 외부에서 비활성화 여부를 명시적으로 전달할 수 있음
  inactive?: boolean;
}>();

const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.userAuth);

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

const showLoginModal = ref(false);
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
       <b>{{ discountText }}</b>
    </template>
    <template #content>
      <div class="text-sm flex flex-col gap-1"
           :class="isInactive ? 'line-through text-gray-400' : ''">
        <div>
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
      <div v-if="!isLoggedIn" class="mt-3">
        <button class="text-blue-600 underline text-sm" @click="showLoginModal = true">로그인 후 사용
        </button>
        <SignInModal :visible="showLoginModal" @close="showLoginModal = false"
                     @success="showLoginModal = false" />
      </div>
    </template>
    <template #footer>
      <Divider />
      <div class="flex gap-2">
        <img class="w-24 h-24 rounded-lg" :src="coupon.placeImageUrl"  alt="place"/>
        <div class="flex flex-col">
          <div class="text-xl"> {{coupon.placeName}}</div>


        </div>

      </div>

    </template>


  </PrimeCard>
</template>

<style scoped>
/* 추가적인 커스텀 스타일이 필요하면 여기에 */
</style>
