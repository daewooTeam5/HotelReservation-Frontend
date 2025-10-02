<script setup lang="ts">
import type { ReservationPayment } from '@/types/reservation';
import Card from 'primevue/card';
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
  if (s === 'paid') return 'bg-green-100 text-green-800';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// 상태 텍스트
const statusText = (s: ReservationPayment['status']) => {
  if (s === 'paid') return '결제완료';
  if (s === 'pending') return '결제대기';
  return '취소됨';
};

// 카드 스타일
const cardClass = () => {
  if (props.payment.status === 'cancelled') return 'opacity-70';
  return 'hover:shadow-lg transition-shadow';
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
  <Card :class="cardClass()">
    <template #content>
      <div class="flex gap-4">
        <!-- 이미지 -->
        <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            v-if="payment.firstImageUrl"
            :src="payment.firstImageUrl"
            :alt="payment.placeName"
            class="w-full h-full object-cover"
            :class="{ 'grayscale': payment.status === 'cancelled' }"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <i class="pi pi-image text-xl"></i>
          </div>
        </div>

        <!-- 메인 정보 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-900 truncate">
                {{ payment.placeName }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">{{ payment.roomType }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap" :class="statusClass(payment.status)">
              {{ statusText(payment.status) }}
            </span>
          </div>

          <!-- 핵심 정보 -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">기간</span>
              <span class="font-medium">{{ payment.resevStart }} ~ {{ payment.resevEnd }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">결제금액</span>
              <span class="font-semibold text-lg text-gray-900">{{ payment.amount.toLocaleString() }}원</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">결제일</span>
              <span>{{ new Date(payment.transactionDate).toLocaleDateString() }}</span>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div v-if="showActions" class="flex gap-3 mt-4">
            <button
              @click="emit('details', payment.paymentId)"
              class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              상세보기
            </button>
            <button
              v-if="payment.status !== 'cancelled'"
              @click="handleCancel"
              :disabled="cancelMutation.isPending"
              class="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ cancelMutation.isPending ? '처리중...' : '취소' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
</style>
