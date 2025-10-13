<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { UserCoupon } from '@/types/coupon.ts';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CouponItem from '@/components/coupon/CouponItem.vue';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

// 탭/필터 정의 (아이콘 포함)
const tabs = [
  { label: '전체보기', type: 'all', icon: 'pi-list' },
  { label: '사용가능', type: 'unused', icon: 'pi-check-circle' },
  { label: '만료됨/사용됨', type: 'used_expired', icon: 'pi-ban' }
] as const;

type CouponType = typeof tabs[number]['type'];

const route = useRoute();
const router = useRouter();

// URL ?type= 과 동기화되는 선택 탭 상태
const defaultType: CouponType = 'all';
const selectedType = ref<CouponType>((route.query.type as CouponType) || defaultType);

// 유효하지 않은 type 이면 기본값으로 교정
const isValidType = (t: string | null | undefined): t is CouponType =>
  !!t && tabs.some(tab => tab.type === t);

onMounted(() => {
  if (!isValidType(route.query.type as string)) {
    router.replace({ query: { ...route.query, type: defaultType } });
    selectedType.value = defaultType;
  }
});

watch(
  () => route.query.type,
  (newType) => {
    if (isValidType(newType as string) && selectedType.value !== newType) {
      selectedType.value = newType as CouponType;
    }
  }
);

watch(selectedType, (t) => {
  if (route.query.type !== t) {
    router.replace({ query: { ...route.query, type: t } });
  }
});

// 쿼리 키에 type 을 포함시켜 캐시/리페치 분리
const queryKey = computed(() => ['v1', 'users', 'my', `coupons?type=${selectedType.value}`]);

const { isLoading, isError, data, error } = useQuery<ApiResult<UserCoupon[]>>({
  queryKey,
  queryFn: httpFetcher
});

const coupons = computed(() => data.value?.data ?? []);

// 현재 탭과 쿠폰 상태에 따라 비활성화 여부 결정
const now = () => Date.now();
const isInactive = (c: UserCoupon) => {
  if (selectedType.value === 'unused') return false;
  if (selectedType.value === 'used_expired') return true;
  const expired = new Date(c.expiredAt).getTime() < now();
  return c.isUsed || expired;
};

// 쿠폰 등록 로직
const toast = useToast();
const queryClient = useQueryClient();
const couponCode = ref('');

const issueCouponMutation = useMutation({
  mutationKey: ['v1', 'coupon', 'issue'],
  mutationFn: async (code: string) => {
    const res = await apiClient.post<ApiResult<unknown>>('v1/coupon/issue', { couponCode: code });
    return res.data;
  },
  onSuccess: async (res) => {
    if (!res?.success) {
      const title = res?.error?.title || '쿠폰 등록 실패';
      const detail = res?.error?.detail || res?.message || '알 수 없는 오류가 발생했습니다.';
      toast.add({ severity: 'error', summary: title, detail, life: 3000 });
      return;
    }
    toast.add({ severity: 'success', summary: '쿠폰 등록 완료', detail: '쿠폰이 정상 등록되었습니다.', life: 2500 });
    couponCode.value = '';
    await queryClient.invalidateQueries({ queryKey: ['v1', 'users', 'my'] });
  },
  onError: (err: any) => {
    const title = err?.response?.data?.error?.title || '쿠폰 등록 실패';
    const detail = err?.response?.data?.error?.detail || err?.response?.data?.message || err?.message || '요청에 실패했습니다.';
    toast.add({ severity: 'error', summary: title, detail, life: 3500 });
  }
});

const submitCoupon = () => {
  const code = couponCode.value.trim();
  if (!code) {
    toast.add({ severity: 'warn', summary: '코드 없음', detail: '쿠폰 코드를 입력하세요.', life: 2000 });
    return;
  }
  issueCouponMutation.mutate(code);
};
</script>

<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <div class="bg-white w-full p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
      <!-- 헤더 -->
      <div class="mb-6!">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2!">내 쿠폰</h1>
        <p class="text-gray-600 text-sm">보유한 쿠폰을 확인하고 새로운 쿠폰을 등록하세요.</p>
      </div>

      <!-- 쿠폰 등록 폼 카드 -->
      <div class="mb-6! p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4 mb-4!">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <i class="pi pi-gift text-white text-2xl"></i>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-purple-800 mb-1!">쿠폰 등록하기</h3>
            <p class="text-purple-700 text-sm">
              보유하신 쿠폰 코드를 입력하여 할인 혜택을 받으세요!
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <PrimeInputText
            v-model="couponCode"
            placeholder="쿠폰 코드 입력 (예: WELCOME2024)"
            :disabled="!issueCouponMutation.isPending"
            class="flex-1"
          >
            <template #prefix>
              <i class="pi pi-ticket text-purple-600"></i>
            </template>
          </PrimeInputText>
          <PrimeButton
            label="등록하기"
            icon="pi pi-plus-circle"
            :loading="!issueCouponMutation.isPending"
            :disabled="!couponCode || !issueCouponMutation.isPending"
            @click="submitCoupon"
            severity="help"
            size="large"
            class="sm:w-auto w-full"
          />
        </div>
      </div>

      <!-- Tabs: 헤더에 아이콘 + 라벨 -->
      <PrimeTabs :value="selectedType">
        <PrimeTabList>
          <PrimeTab
            class="flex items-center flex-1"
            v-for="t in tabs"
            :key="t.type"
            :value="t.type"
            @click="selectedType = t.type as any"
          >
            <i :class="['pi', t.icon, 'mr-2']" />
            <span>{{ t.label }}</span>
          </PrimeTab>
        </PrimeTabList>

        <PrimeTabPanels>
          <PrimeTabPanel v-for="t in tabs" :key="t.type" :value="t.type">
            <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton v-for="i in 4" :key="i" height="6rem" />
            </div>

            <div v-else-if="isError">
              <Message severity="error" :closable="false">
                <div class="flex items-center gap-2">
                  <i class="pi pi-exclamation-triangle text-xl"></i>
                  <div>
                    <p class="font-semibold">오류 발생</p>
                    <p class="text-sm mt-1">{{ (error as Error)?.message || '쿠폰을 불러오지 못했습니다.' }}</p>
                  </div>
                </div>
              </Message>
            </div>

            <div v-else>
              <div v-if="coupons.length === 0" class="text-center py-16">
                <div class="inline-block p-4 bg-gray-100 rounded-full mb-3!">
                  <i class="pi pi-ticket text-4xl text-gray-300"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-1!">표시할 쿠폰이 없습니다</h3>
                <p class="text-gray-500 text-sm">
                  {{ selectedType === 'unused' ? '사용 가능한 쿠폰이 없습니다.' : selectedType === 'used_expired' ? '만료되거나 사용된 쿠폰이 없습니다.' : '보유한 쿠폰이 없습니다.' }}
                </p>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CouponItem v-for="c in coupons" :key="c.couponName + c.placeId" :coupon="c" :inactive="isInactive(c)" />
              </div>
            </div>
          </PrimeTabPanel>
        </PrimeTabPanels>
      </PrimeTabs>
    </div>
  </div>
</template>

<style scoped>
/* 간단한 여백/정렬만 유지 */
</style>
