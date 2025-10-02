<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch, onMounted } from 'vue';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { Page } from '@/types/Page.ts';
import type { ReservationPayment } from '@/types/reservation.ts';
import PaymentCard from '@/components/payment/PaymentCard.vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const queryClient = useQueryClient();

// URL ?page= 과 동기화되는 페이지 상태 (1-based)
const page = ref<number>(Number(route.query.page) > 0 ? Number(route.query.page) : 1);

watch(page, (p) => {
  if (Number(route.query.page) !== p) {
    router.replace({ query: { ...route.query, page: String(p) } });
  }
});

watch(
  () => route.query.page,
  (qp) => {
    const n = Number(qp);
    if (!Number.isNaN(n) && n > 0 && n !== page.value) page.value = n;
  }
);

const { isLoading, isError, error, data } = useQuery<ApiResult<Page<ReservationPayment>>>({
  queryKey: computed(() => ['v1', 'users', 'my', `payments?page=${page.value}`]),
  queryFn: httpFetcher
});

const pageData = computed(() => data.value?.data);
const items = computed(() => pageData.value?.content ?? []);
const isFirst = computed(() => pageData.value?.first ?? page.value === 1);
const isLast = computed(() => pageData.value?.last ?? false);
const totalPages = computed(() => pageData.value?.totalPages ?? 1);

const prev = () => { if (!isFirst.value) page.value -= 1; };
const next = () => { if (!isLast.value) page.value += 1; };

onMounted(() => {
  // normalize invalid page
  if (page.value < 1) page.value = 1;
});

// 상세 이동
const goDetails = (id: number) => {
  router.push({ name: 'profile-payment-detail', params: { paymentId: String(id) } });
};

// 취소 뮤테이션
const cancelMutation = useMutation({
  mutationKey: ['v1', 'payment', 'cancel'],
  mutationFn: async (paymentKey: string) => {
    const res = await apiClient.post<ApiResult<unknown>>(`/v1/payment/${paymentKey}/cancel`);
    return res.data;
  },
  onSuccess: async (res) => {
    if (!res?.success) {
      const title = res?.error?.title || '취소 실패';
      const detail = res?.error?.detail || res?.message || '알 수 없는 오류가 발생했습니다.';
      toast.add({ severity: 'error', summary: title, detail, life: 3000 });
      return;
    }
    toast.add({ severity: 'success', summary: '취소 완료', detail: '결제가 취소되었습니다.', life: 2500 });
    await queryClient.invalidateQueries({ queryKey: ['v1', 'users', 'my'] });
  },
  onError: (err: any) => {
    const title = err?.response?.data?.error?.title || '취소 실패';
    const detail = err?.response?.data?.error?.detail || err?.response?.data?.message || err?.message || '요청에 실패했습니다.';
    toast.add({ severity: 'error', summary: title, detail, life: 3500 });
  }
});

const cancelPayment = (paymentKey: string) => {
  if (cancelMutation.isPending) return;
  if (!window.confirm('해당 결제를 취소하시겠습니까?')) return;
  if (!paymentKey) return;
  cancelMutation.mutate(paymentKey);
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- 헤더 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">결제 내역</h1>
      <p class="text-gray-600 mt-1">예약 및 결제 정보를 확인하실 수 있습니다.</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="border rounded-lg p-4 bg-white">
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="isError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2 text-red-800">
        <i class="pi pi-exclamation-triangle"></i>
        <span class="font-medium">오류 발생</span>
      </div>
      <p class="text-red-700 mt-1">
        {{ (error as Error)?.message || '결제 내역을 불러오지 못했습니다.' }}
      </p>
    </div>

    <!-- 데이터 표시 -->
    <div v-else>
      <!-- 빈 상태 -->
      <div v-if="items.length === 0" class="text-center py-12">
        <i class="pi pi-credit-card text-4xl text-gray-400 mb-3"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-1">결제 내역이 없습니다</h3>
        <p class="text-gray-600">아직 결제한 내역이 없습니다.</p>
      </div>

      <!-- 결제 내역 리스트 -->
      <div v-else class="space-y-4">
        <PaymentCard
          v-for="payment in items"
          :key="payment.paymentId"
          :payment="payment"
          :showActions="true"
          @details="goDetails"
          @cancelled="queryClient.invalidateQueries({ queryKey: ['v1', 'users', 'my'] })"
        />
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
        <button
          @click="prev"
          :disabled="isFirst"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="pi pi-chevron-left text-xs"></i>
          이전
        </button>

        <span class="text-sm text-gray-700">
          {{ page }} / {{ totalPages }}
        </span>

        <button
          @click="next"
          :disabled="isLast"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
          <i class="pi pi-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
