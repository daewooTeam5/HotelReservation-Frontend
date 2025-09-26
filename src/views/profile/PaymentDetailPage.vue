<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ApiResult } from '@/types/ApiResult';
import type { ReservationPayment } from '@/types/reservation';
import { httpFetcher } from '@/utils/httpFetcher';
import PaymentCard from '@/components/payment/PaymentCard.vue';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const qc = useQueryClient();

const paymentId = computed(() => String(route.params.paymentId || ''));

const { isLoading, isError, error, data } = useQuery<ApiResult<ReservationPayment>>({
  queryKey: computed(() => ['v1', 'users', 'my', `payments/${paymentId.value}`]),
  queryFn: httpFetcher
});

const payment = computed(() => data.value?.data ?? null);

const cancelMutation = useMutation({
  mutationKey: ['v1', 'payment', 'cancel'],
  mutationFn: async (id: string) => {
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
    await qc.invalidateQueries({ queryKey: ['v1', 'users', 'my'] });
    await qc.invalidateQueries({ queryKey: ['v1', 'users', 'my', `payments/${paymentId.value}`] });
  },
  onError: (err: any) => {
    const title = err?.response?.data?.error?.title || '취소 실패';
    const detail = err?.response?.data?.error?.detail || err?.response?.data?.message || err?.message || '요청에 실패했습니다.';
    toast.add({ severity: 'error', summary: title, detail, life: 3500 });
  }
});

const cancel = () => {
  if (cancelMutation.isPending || !paymentId.value) return;
  if (!window.confirm('해당 결제를 취소하시겠습니까?')) return;
  cancelMutation.mutate(paymentId.value);
};

const goBack = () => router.push({ name: 'payments' });
</script>

<template>
  <section class="max-w-5xl mx-auto p-4">
    <div class="mb-4 flex items-center justify-between">
      <PrimeButton label="목록으로" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
      <PrimeButton
        v-if="payment"
        label="취소하기"
        icon="pi pi-times"
        severity="danger"
        :disabled="payment.status === 'canceled'"
        :loading="cancelMutation.isPending"
        @click="cancel"
      />
    </div>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton height="10rem" />
      <Skeleton height="2rem" />
    </div>

    <div v-else-if="isError" class="p-4 border rounded text-red-600 bg-red-50">
      {{ (error as Error)?.message || '결제 상세를 불러오지 못했습니다.' }}
    </div>

    <div v-else>
      <PaymentCard v-if="payment" :payment="payment" />

      <div v-if="payment" class="mt-4 p-4 border rounded">
        <div class="text-sm text-gray-600">추가 정보</div>
        <div class="mt-2 grid grid-cols-2 gap-y-1 text-sm">
          <div class="text-gray-500">Payment ID</div>
          <div>{{ payment.paymentId }}</div>
          <div class="text-gray-500">Payment Key</div>
          <div class="truncate">{{ payment.paymentKey }}</div>
          <div class="text-gray-500">Order ID</div>
          <div>{{ payment.orderId }}</div>
          <div class="text-gray-500">Place</div>
          <div>{{ payment.placeName }} (ID: {{ payment.placeId }})</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
