<script setup lang="ts">
import type { ReservationPayment } from '@/types/reservation';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';
import type { ApiResult } from '@/types/ApiResult';

const props = defineProps<{ payment: ReservationPayment; showActions?: boolean }>();
const emit = defineEmits<{ (e: 'details', id: number): void; (e: 'cancelled'): void }>();

const toast = useToast();
const queryClient = useQueryClient();

// 상태별 뱃지 색상
const statusClass = (s: ReservationPayment['status']) => {
  if (s === 'paid') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  return 'bg-red-100 text-red-800 border border-red-200';
};

// 상태 텍스트
const statusText = (s: ReservationPayment['status']) => {
  if (s === 'paid') return '결제완료';
  if (s === 'pending') return '결제대기';
  return '취소됨';
};

// 취소 뮤테이션 (PaymentDetailPage와 동일한 로직)
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
    emit('cancelled'); // 부모 컴포넌트에게 취소 완료 알림
  },
  onError: (err: any) => {
    const title = err?.response?.data?.error?.title || '취소 실패';
    const detail = err?.response?.data?.error?.detail || err?.response?.data?.message || err?.message || '요청에 실패했습니다.';
    toast.add({ severity: 'error', summary: title, detail, life: 3500 });
  }
});

// 취소 함수 (PaymentDetailPage와 동일한 로직)
const handleCancel = () => {
  if (cancelMutation.isPending) return;
  if (!window.confirm('해당 결제를 취소하시겠습니까?')) return;
  if (!props.payment?.paymentKey) return;
  cancelMutation.mutate(props.payment.paymentKey);
};
</script>

<template>
  <div
    class="mb-2! border border-gray-200 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200"
    :class="{ 'opacity-60': payment.status === 'cancelled' }"
  >
    <div class="flex gap-4">
      <!-- 이미지 -->
      <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img
          v-if="payment.firstImageUrl"
          :src="payment.firstImageUrl"
          :alt="payment.placeName"
          class="w-full h-full object-cover"
          :class="{ 'grayscale': payment.status === 'cancelled' }"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          <i class="pi pi-image text-2xl"></i>
        </div>
      </div>

      <!-- 메인 정보 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3 mb-3!">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-lg text-gray-900 truncate mb-1!">
              {{ payment.placeName }}
            </h3>
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="pi pi-tag text-xs"></i>
              {{ payment.roomName }}
            </p>
          </div>
          <span
            class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
            :class="statusClass(payment.status)"
          >
            {{ statusText(payment.status) }}
          </span>
        </div>

        <!-- 핵심 정보 -->
        <div class="space-y-2 text-sm mb-4!">
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-600 flex items-center gap-1.5">
              <i class="pi pi-calendar text-xs"></i>
              기간
            </span>
            <span class="font-medium text-gray-900">{{ payment.resevStart }} ~ {{ payment.resevEnd }}</span>
          </div>
          <div class="flex items-center justify-between py-1 border-t border-gray-100">
            <span class="text-gray-600 flex items-center gap-1.5">
              <i class="pi pi-wallet text-xs"></i>
              결제금액
            </span>
            <span class="font-bold text-lg text-blue-600">{{ payment.amount.toLocaleString() }}원</span>
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-600 flex items-center gap-1.5">
              <i class="pi pi-clock text-xs"></i>
              결제일
            </span>
            <span class="text-gray-700">{{ new Date(payment.transactionDate).toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div v-if="showActions" class="flex gap-2">
          <button
            @click="emit('details', payment.paymentId)"
            class="flex-1 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-file-edit text-xs"></i>
            상세보기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
