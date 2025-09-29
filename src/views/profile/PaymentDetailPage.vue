<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ApiResult } from '@/types/ApiResult';
import type { PaymentDetail } from '@/types/reservation';
import { httpFetcher } from '@/utils/httpFetcher';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();
const qc = useQueryClient();

const paymentId = computed(() => String(route.params.paymentId || ''));

const { isLoading, isError, error, data } = useQuery<ApiResult<PaymentDetail>>({
  queryKey: computed(() => ['v1', 'users', 'my', 'payments', paymentId.value]),
  queryFn: httpFetcher
});

const payment = computed(() => data.value?.data ?? null);

// 쿠폰 토글 상태
const couponOpen = ref(false);

// 요청사항 모달 상태 및 오픈 핸들러
const requestDialogVisible = ref(false);
const openRequest = () => {
  const req = (payment.value?.request ?? '').trim();
  if (!req) {
    toast.add({ severity: 'info', summary: '요청사항', detail: '요청사항이 없습니다.', life: 2000 });
    return;
  }
  requestDialogVisible.value = true;
};

const nights = computed(() => {
  if (!payment.value?.resevStart || !payment.value?.resevEnd) return 1;
  const start = new Date(payment.value.resevStart);
  const end = new Date(payment.value.resevEnd);
  const ms = end.getTime() - start.getTime();
  const d = Math.round(ms / (1000 * 60 * 60 * 24));
  return d > 0 ? d : 1;
});

const statusLabel = computed(() => {
  const s = (payment.value?.status || '').toLowerCase();
  if (s.includes('cancel')) return '취소됨';
  if (s === 'paid' || s === 'success') return '결제 완료';
  if (s === 'pending' || s === 'ready') return '결제 대기';
  if (s === 'failed' || s === 'fail') return '결제 실패';
  return payment.value?.status || '상태 확인 필요';
});

// 쿠폰 타입/금액 파생값 및 표시 문자열
const couponTypeRaw = computed(() => (payment.value?.couponType || '').toLowerCase());
const couponIsRate = computed(() => couponTypeRaw.value === 'rate' || couponTypeRaw.value === 'percentage');
const couponIsFixed = computed(() => couponTypeRaw.value === 'amount' || couponTypeRaw.value === 'fixed');
const couponAmountDeclared = computed<number | null>(() => {
  const val = (payment.value as any)?.couponAmount;
  return typeof val === 'number' && !isNaN(val) ? val : null;
});
const couponRate = computed<number | null>(() => {
  const base = payment.value?.baseAmount || 0;
  const disc = payment.value?.couponDiscountAmount || 0;
  if (!base || !disc) return null;
  return Math.round((disc / base) * 100);
});
const couponLabel = computed<string | null>(() => {
  if (!payment.value?.couponDiscountAmount) return null;
  if (couponIsRate.value) {
    const v = couponAmountDeclared.value ?? couponRate.value;
    return v != null ? `${v}% 할인` : '쿠폰 할인';
  }
  if (couponIsFixed.value) {
    const v = couponAmountDeclared.value ?? payment.value.couponDiscountAmount;
    return v != null ? `${v.toLocaleString()}원 할인` : '쿠폰 할인';
  }
  return '쿠폰 할인';
});
const couponExpiry = computed<string | null>(() => payment.value?.couponExpiredAt || (payment.value as any)?.coupon?.expiredAt || null);

const isCancelable = computed(() => (payment.value?.status || '').toLowerCase() === 'paid');
console.log(payment.value?.status);

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
    await qc.invalidateQueries({ queryKey: ['v1', 'users', 'my', 'payments', paymentId.value] });
  },
  onError: (err: any) => {
    const title = err?.response?.data?.error?.title || '취소 실패';
    const detail = err?.response?.data?.error?.detail || err?.response?.data?.message || err?.message || '요청에 실패했습니다.';
    toast.add({ severity: 'error', summary: title, detail, life: 3500 });
  }
});

const cancel = () => {
  if (!cancelMutation.isPending || !paymentId.value) return;
  if (!window.confirm('해당 결제를 취소하시겠습니까?')) return;
  if(!payment?.value?.paymentKey) return;
  cancelMutation.mutate(payment?.value.paymentKey);
};

const copy = async (val?: string, label?: string) => {
  if (!val) return;
  try {
    await navigator.clipboard?.writeText?.(val);
    toast.add({ severity: 'info', summary: '복사됨', detail: `${label || '값'}이(가) 복사되었습니다.`, life: 1800 });
  } catch {
    toast.add({ severity: 'warn', summary: '복사 실패', detail: '클립보드 권한을 확인해주세요.', life: 2200 });
  }
};
</script>

<template>
  <section class="max-w-6xl mx-auto p-4 md:p-6">

    <!-- Loading / Error -->
    <div v-if="isLoading" class="space-y-4">
      <Skeleton height="14rem" />
      <Skeleton height="2.5rem" />
      <Skeleton height="12rem" />
    </div>
    <div v-else-if="isError" class="p-4 border rounded text-red-600 bg-red-50">
      {{ (error as Error)?.message || '결제 상세를 불러오지 못했습니다.' }}
    </div>

    <!-- Content -->
    <div v-else-if="payment" class="space-y-6">
      <!-- Hero -->
      <PrimeCard class="overflow-hidden shadow-sm border border-gray-200">
        <template #content>
          <div class="flex flex-col md:flex-row">
            <img
              v-if="payment.firstImageUrl"
              :src="payment.firstImageUrl"
              alt="place image"
              class="w-full md:w-72 h-48 md:h-48 object-cover rounded md:rounded-none"
            />
            <div class="flex-1 p-4 space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-xl md:text-2xl font-bold">{{ payment.placeName }}</h2>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500 hidden sm:inline">결제일시: {{ new Date(payment.transactionDate).toLocaleString() }}</span>
                  <PrimeButton size="small" severity="secondary" outlined label="요청사항 보기" @click="openRequest" />
                </div>
              </div>
              <div class="sm:hidden text-xs text-gray-500">결제일시: {{ new Date(payment.transactionDate).toLocaleString() }}</div>
              <div class="text-sm text-gray-700">객실: {{ payment.roomType }} (ID: {{ payment.roomId }})</div>
              <div class="text-sm text-gray-700">예약 기간: {{ payment.resevStart }} ~ {{ payment.resevEnd }} ({{ nights }}박)</div>
              <div class="text-sm text-gray-500">주문번호: {{ payment.orderId }} <button class="text-blue-600 hover:underline ml-1" @click="copy(payment.orderId, '주문번호')">복사</button></div>
              <div class="text-sm text-gray-500">결제키: <span class="truncate inline-block align-bottom max-w-xs">{{ payment.paymentKey }}</span> <button class="text-blue-600 hover:underline ml-1" @click="copy(payment.paymentKey, '결제키')">복사</button></div>
            </div>
          </div>
        </template>
      </PrimeCard>

      <!-- 요청사항 모달 -->
      <Dialog v-model:visible="requestDialogVisible" modal header="요청사항" :style="{ width: '30rem' }">
        <div class="whitespace-pre-wrap text-sm text-gray-800">{{ payment.request }}</div>
      </Dialog>

      <!-- Full-width stacked cards -->
      <div class="space-y-6">
        <!-- Price breakdown -->
        <PrimeCard class="shadow-sm border border-gray-200">
          <template #header>
            <div class="p-4 border-b text-lg font-semibold">결제 금액</div>
          </template>
          <template #content>
            <div class="p-4 space-y-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">기본 금액</span>
                <span>{{ payment.baseAmount.toLocaleString() }}원</span>
              </div>

              <!-- Compact coupon row with amount and toggle -->
              <button
                v-if="payment.couponDiscountAmount"
                type="button"
                class="w-full text-left rounded px-2 py-2 hover:bg-blue-50"
                @click="couponOpen = !couponOpen"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-ticket text-blue-600"></i>
                    <span class="text-gray-800 font-medium">쿠폰 할인</span>
                    <span v-if="payment.couponName" class="text-xs text-gray-500">({{ payment.couponName }})</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-700 font-semibold">-{{ payment.couponDiscountAmount.toLocaleString() }}원</span>
                    <i class="pi" :class="couponOpen ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                  </div>
                </div>
              </button>

              <!-- Coupon ticket details (toggle view) -->
              <div
                v-if="payment.couponDiscountAmount && couponOpen && couponLabel"
                class="relative flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50"
              >
                <div class="flex items-center gap-4">
                  <i class="pi pi-ticket text-blue-600 text-3xl"></i>
                  <div>
                    <div class="text-2xl font-extrabold text-blue-700 leading-tight">{{ couponLabel }}</div>
                    <div v-if="payment.couponName" class="text-base text-gray-700 mt-0.5">{{ payment.couponName }}</div>
                  </div>
                </div>
                <div v-if="couponExpiry" class="text-right">
                  <div class="text-xs text-gray-500">만료일</div>
                  <div class="text-sm font-semibold text-gray-800">{{ new Date(couponExpiry as string).toLocaleDateString() }}</div>
                </div>
              </div>

              <!-- Other discounts -->
              <div class="flex justify-between" v-if="payment.fixedDiscountAmount">
                <span class="text-gray-600">프로모션 할인</span>
                <span class="text-blue-700">-{{ payment.fixedDiscountAmount.toLocaleString() }}원</span>
              </div>
              <div class="flex justify-between" v-if="payment.pointDiscountAmount">
                <span class="text-gray-600">포인트 사용</span>
                <span class="text-blue-700">-{{ payment.pointDiscountAmount.toLocaleString() }}원</span>
              </div>

              <div class="h-px bg-gray-200" />
              <div class="flex justify-between text-base font-bold">
                <span>최종 결제금액</span>
                <span class="text-red-600">{{ payment.finalAmount.toLocaleString() }}원</span>
              </div>
              <div class="text-xs text-gray-500">표시 금액은 실제 결제된 금액과 일치합니다.</div>
            </div>
          </template>
        </PrimeCard>

        <!-- Payment meta -->
        <PrimeCard class="shadow-sm border border-gray-200">
          <template #header>
            <div class="p-4 border-b text-lg font-semibold">결제 정보</div>
          </template>
          <template #content>
            <div class="p-4 space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-600">결제 수단</span><span class="font-medium">{{ payment.method }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">결제 상태</span><span class="font-medium">{{ statusLabel }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">결제 일시</span><span>{{ new Date(payment.transactionDate).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Payment ID</span><span>{{ payment.paymentId }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Reservation ID</span><span>{{ payment.reservationId }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Place</span><span>{{ payment.placeName }} ({{ payment.placeId }})</span></div>
            </div>
          </template>
        </PrimeCard>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <PrimeButton label="주문번호 복사" icon="pi pi-copy" severity="secondary" @click="copy(payment.orderId, '주문번호')" />
        <PrimeButton label="결제키 복사" icon="pi pi-copy" severity="secondary" @click="copy(payment.paymentKey, '결제키')" />
        <PrimeButton v-if="isCancelable" label="결제 취소" icon="pi pi-times" severity="danger" :loading="!cancelMutation.isPending" @click="cancel" />
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
