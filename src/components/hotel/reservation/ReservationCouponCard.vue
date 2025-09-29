<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { AvailablePlaceCoupon } from '@/types/coupon';
import { useAuthStore } from '@/stores/authStore.ts'; // ✅ 추가
import SignInModal from '@/components/auth/SignInModal.vue';

const props = defineProps<{
  placeId?: number;
  orderAmount: number;
}>();

const emit = defineEmits<{
  'coupon-change': [coupon: AvailablePlaceCoupon | null]
}>();

// ✅ 로그인 상태 체크
const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.userAuth);

const { data, isLoading, isError, error } = useQuery<
  ApiResult<AvailablePlaceCoupon[]>
>({
  queryKey: ['v1', 'places', String(props.placeId ?? ''), 'available', 'coupons'],
  queryFn: httpFetcher,
  enabled: !!props.placeId && isLoggedIn.value // 로그인 안 돼 있으면 쿠폰 조회 안 함
});

const coupons = computed(() => data.value?.data ?? []);
const eligibleCoupons = computed(() => coupons.value || []);

const selectedId = ref<string>('');
const selectedCoupon = computed<AvailablePlaceCoupon | null>(() => {
  const id = Number(selectedId.value);
  if (!id) return null;
  return eligibleCoupons.value.find((c) => c.id === id) || null;
});

const onSelect = () => {
  emit('coupon-change', selectedCoupon.value);
};

watch(
  () => [eligibleCoupons.value.length, props.orderAmount, props.placeId],
  () => {
    const coupon = selectedCoupon.value;
    if (!coupon) return;
    const stillEligible = eligibleCoupons.value.some(
      (c) => String(c.id) === selectedId.value
    );
    if (!stillEligible) {
      selectedId.value = '';
      emit('coupon-change', null);
    }
  }
);

const showLoginModal = ref(false);
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-ticket text-blue-500" />
          쿠폰 선택
        </h3>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-3">
        <div v-if="!isLoggedIn" class="text-sm text-gray-600">
          <span>
            <button class="login-link" @click="showLoginModal = true">로그인</button>하면 더 많은 혜택을 이용하세요 😊
          </span>
          <SignInModal :visible="showLoginModal" @close="showLoginModal = false" @success="showLoginModal = false" />
        </div>
        <div v-else>
          <div v-if="isLoading" class="text-sm text-gray-500">쿠폰을 불러오는 중…</div>
          <div v-else-if="isError" class="text-sm text-red-600">
            쿠폰 로딩 실패: {{ (error as Error)?.message }}
          </div>
          <div v-else>
            <div class="space-y-2">
              <label
                class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
              >
                <input
                  type="radio"
                  name="coupon-radio"
                  value=""
                  v-model="selectedId"
                  @change="onSelect"
                />
                <span class="text-sm">적용 안 함</span>
              </label>
              <div v-if="eligibleCoupons.length === 0" class="text-sm text-gray-500 px-2">
                사용 가능한 쿠폰이 없습니다.
              </div>
              <label
                v-for="c in eligibleCoupons"
                :key="c.id"
                class="flex items-center gap-3 p-3 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="coupon-radio"
                  :value="String(c.id)"
                  v-model="selectedId"
                  @change="onSelect"
                />
                <span class="flex-1">
                  <span class="flex justify-between items-center">
                    <span class="font-medium">{{ c.couponName }}</span>
                    <span class="text-blue-600 font-bold">
                      <template v-if="c.couponType === 'rate'">{{ c.amount }}%</template>
                      <template v-else>-{{ c.amount.toLocaleString() }}원</template>
                    </span>
                  </span>
                  <span class="block text-xs text-gray-600 mt-1">
                    - 최소 주문금액: {{ c.minOrderAmount.toLocaleString() }}원
                  </span>
                  <span v-if="c.maxOrderAmount" class="block text-xs text-gray-600">
                    - 최대 주문금액: {{ c.maxOrderAmount.toLocaleString() }}원
                  </span>
                  <span class="block text-xs text-gray-600">
                    - 만료일: {{ new Date(c.expiredAt).toLocaleDateString() }}
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
.login-link {
  color: #42b883;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.login-link:hover {
  text-decoration: underline;
  color: #369870;
}
</style>
