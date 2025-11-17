<template>
  <div class="p-0 lg:p-8 bg-gray-100 min-h-screen">
    <div class="bg-white w-full p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
      <!-- 헤더 -->
      <div class="mb-6!">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2!">결제 내역</h1>
        <p class="text-gray-600 text-sm">예약 및 결제 정보를 확인하실 수 있습니다.</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="space-y-3">
        <Skeleton v-for="i in 3" :key="i" height="8rem" borderRadius="12px"></Skeleton>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="isError">
        <Message severity="error" :closable="false">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-xl"></i>
            <div>
              <p class="font-semibold">오류 발생</p>
              <p class="text-sm mt-1!">{{ (error as Error)?.message || '결제 내역을 불러오지 못했습니다.' }}</p>
            </div>
          </div>
        </Message>
      </div>

      <!-- 데이터 표시 -->
      <div v-else>
        <!-- 빈 상태 -->
        <div v-if="items.length === 0" class="text-center py-16">
          <div class="inline-block p-4 bg-gray-100 rounded-full mb-3! ">
            <i class="pi pi-credit-card text-5xl text-gray-300"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1!">결제 내역이 없습니다</h3>
          <p class="text-gray-500 mb-4! text-sm">아직 결제한 내역이 없습니다.</p>
          <button
            @click="router.push('/')"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            숙소 둘러보기
          </button>
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
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
          <Button
            icon="pi pi-chevron-left"
            :disabled="isFirst"
            @click="prev"
            text
            rounded
            severity="secondary"
            :pt="{ root: { class: 'w-10 h-10' } }"
          />
          <div class="flex items-center gap-1">
            <span class="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-sm">
              {{ page }}
            </span>
            <span class="text-gray-500 text-sm">/</span>
            <span class="text-gray-500 font-medium text-sm">{{ totalPages }}</span>
          </div>
          <Button
            icon="pi pi-chevron-right"
            :disabled="isLast"
            @click="next"
            text
            rounded
            severity="secondary"
            :pt="{ root: { class: 'w-10 h-10' } }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

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
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Button from 'primevue/button';

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
  if (page.value < 1) page.value = 1;
});

const goDetails = (id: number) => {
  router.push({ name: 'profile-payment-detail', params: { paymentId: String(id) } });
};

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

<style scoped>
</style>
