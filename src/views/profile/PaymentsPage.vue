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
  mutationFn: async (id: number) => {
    const res = await apiClient.post<ApiResult<unknown>>(`/v1/payment/${id}/cancel`);
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

const cancelPayment = (id: number) => {
  if (!cancelMutation.isPending) return;
  if (!window.confirm('해당 결제를 취소하시겠습니까?')) return;
  cancelMutation.mutate(id);
};
</script>

<template>
  <section class="max-w-6xl mx-auto p-4">
    <h2 class="text-xl font-semibold mb-4">결제 내역</h2>

    <div v-if="isLoading" class="space-y-4">
      <Skeleton v-for="i in 4" :key="i" height="8rem" class="w-full" />
    </div>

    <div v-else-if="isError" class="p-4 border rounded text-red-600 bg-red-50">
      {{ (error as Error)?.message || '결제 내역을 불러오지 못했습니다.' }}
    </div>

    <div v-else>
      <div v-if="items.length === 0" class="p-6 text-gray-500 border rounded">표시할 내역이 없습니다.</div>

      <div v-else class="space-y-4 flex flex-col gap-3">
        <PaymentCard
          v-for="p in items"
          :key="p.paymentId"
          :payment="p"
          :showActions="true"
          @details="goDetails"
          @cancel="cancelPayment"
        />
      </div>

      <!-- Pager -->
      <div class="mt-6 flex justify-between items-center">
        <PrimeButton label="이전" icon="pi pi-chevron-left" severity="secondary" :disabled="isFirst" @click="prev" />
        <div class="text-sm text-gray-600">{{ page }} / {{ totalPages }}</div>
        <PrimeButton label="다음" iconPos="right" icon="pi pi-chevron-right" :disabled="isLast" @click="next" />
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
