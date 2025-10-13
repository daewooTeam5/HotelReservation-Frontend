<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ApiResult } from '@/types/ApiResult';
import type { PaymentDetail } from '@/types/reservation';
import { httpFetcher } from '@/utils/httpFetcher';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
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
const ticketDialogVisible = ref(false);

const openRequest = () => {
  const req = (payment.value?.request ?? '').trim();
  if (!req) {
    toast.add({ severity: 'info', summary: '요청사항', detail: '요청사항이 없습니다.', life: 2000 });
    return;
  }
  requestDialogVisible.value = true;
};

const openTicket = () => {
  router.push({ name: 'profile-eticket', params: { paymentId: paymentId.value } });
};

const printTicket = () => {
  window.print();
};

const nights = computed(() => {
  if (!payment.value?.resevStart || !payment.value?.resevEnd) return 1;
  const start = new Date(payment.value.resevStart);
  const end = new Date(payment.value.resevEnd);
  const ms = end.getTime() - start.getTime();
  const d = Math.round(ms / (1000 * 60 * 60 * 24));
  return d > 0 ? d : 1;
});

const statusTag = computed(() => {
  const s = (payment.value?.status || '').toLowerCase();
  if (s.includes('cancel')) return { label: '취소됨', severity: 'danger' };
  if (s === 'paid' || s === 'success') return { label: '결제 완료', severity: 'success' };
  if (s === 'pending' || s === 'ready') return { label: '결제 대기', severity: 'info' };
  if (s === 'failed' || s === 'fail') return { label: '결제 실패', severity: 'warning' };
  return { label: payment.value?.status || '상태 확인 필요', severity: 'secondary' };
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

// 프로모션 할인률 계산 (반올림)
const promoDiscountPercent = computed(() => {
  if (!payment.value?.fixedDiscountAmount || !payment.value?.baseAmount) return null;
  return Math.round((payment.value.fixedDiscountAmount / payment.value.baseAmount) * 100);
});
</script>

<template>
  <section class=" mx-auto p-4 md:p-6">

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
      <PrimeCard class="overflow-hidden shadow-sm border border-gray-200 mb-2!">
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
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm text-gray-500 hidden sm:inline">결제일시: {{ new Date(payment.transactionDate).toLocaleString() }}</span>
                  <PrimeButton size="small" severity="info" outlined label="E-티켓 보기" icon="pi pi-ticket" @click="openTicket" />
                  <PrimeButton size="small" severity="secondary" outlined label="요청사항 보기" @click="openRequest" />
                </div>
              </div>
              <div class="sm:hidden text-xs text-gray-500">결제일시: {{ new Date(payment.transactionDate).toLocaleString() }}</div>
              <div class="text-sm text-gray-700">객실: {{ payment.roomType }} (ID: {{ payment.roomId }})</div>
              <div class="text-sm text-gray-700">예약 기간: {{ payment.resevStart }} ~ {{ payment.resevEnd }} ({{ nights }}박)</div>
              <div class="text-sm text-gray-500">주문번호: {{ payment.orderId }} <button class="text-blue-600 hover:underline ml-1" @click="copy(payment.orderId, '주문번호')">복사</button></div>
            </div>
          </div>
        </template>
      </PrimeCard>

      <!-- 요청사항 모달 -->
      <Dialog v-model:visible="requestDialogVisible" modal header="요청사항" :style="{ width: '30rem' }">
        <div class="whitespace-pre-wrap text-sm text-gray-800">{{ payment.request }}</div>
      </Dialog>

      <!-- 티켓 모달 -->
      <Dialog v-model:visible="ticketDialogVisible" modal :style="{ width: '50rem' }" :closable="true">
        <template #header>
          <div class="flex items-center gap-2">
            <i class="pi pi-ticket text-2xl text-blue-600"></i>
            <span class="text-xl font-bold">전자 예약 확인증 (E-Ticket)</span>
          </div>
        </template>

        <!-- 티켓 디자인 -->
        <div class="ticket-container">
          <!-- 헤더 섹션 -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold mb-2!">{{ payment.placeName }}</h2>
                <p class="text-blue-100">숙박 예약 확인증</p>
              </div>
              <div class="text-right">
                <Tag :value="statusTag.label" :severity="statusTag.severity" class="text-lg px-4 py-2" />
              </div>
            </div>
          </div>

          <!-- 메인 티켓 바디 -->
          <div class="bg-white p-8 border-x-2 border-dashed border-gray-300">
            <!-- 예약 번호 -->
            <div class="text-center mb-8! pb-6 border-b-2 border-dashed border-gray-300">
              <div class="text-sm text-gray-500 mb-2!">예약번호</div>
              <div class="text-3xl font-bold text-gray-900 tracking-wider font-mono">{{ payment.reservationId }}</div>
            </div>

            <!-- 체크인/체크아웃 정보 (비행기 티켓 스타일) -->
            <div class="grid grid-cols-3 gap-4 mb-8! items-center">
              <!-- 체크인 -->
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-2!">체크인</div>
                <div class="text-2xl font-bold text-gray-900">{{ new Date(payment.resevStart).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) }}</div>
                <div class="text-sm text-gray-600">{{ new Date(payment.resevStart).toLocaleDateString('ko-KR', { weekday: 'short' }) }}</div>
                <div class="text-xs text-gray-500 mt-1">15:00</div>
              </div>

              <!-- 중간 아이콘 -->
              <div class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <div class="h-px bg-gray-300 flex-1"></div>
                  <div class="bg-blue-100 rounded-full p-3">
                    <i class="pi pi-home text-blue-600 text-xl"></i>
                  </div>
                  <div class="h-px bg-gray-300 flex-1"></div>
                </div>
                <div class="text-sm text-gray-600 mt-2">{{ nights }}박</div>
              </div>

              <!-- 체크아웃 -->
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-2!">체크아웃</div>
                <div class="text-2xl font-bold text-gray-900">{{ new Date(payment.resevEnd).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) }}</div>
                <div class="text-sm text-gray-600">{{ new Date(payment.resevEnd).toLocaleDateString('ko-KR', { weekday: 'short' }) }}</div>
                <div class="text-xs text-gray-500 mt-1">11:00</div>
              </div>
            </div>

            <!-- 투숙객 정보 -->
            <div class="grid grid-cols-2 gap-6 mb-6! p-4 bg-gray-50 rounded-lg">
              <div>
                <div class="flex items-center gap-2 mb-4!">
                  <i class="pi pi-user text-blue-600"></i>
                  <span class="font-semibold text-gray-700">투숙객 정보</span>
                </div>
                <div class="space-y-2">
                  <div class="flex">
                    <span class="text-gray-500 w-20 text-sm">이름</span>
                    <span class="font-medium text-gray-900">{{ payment.reserverName }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-20 text-sm">연락처</span>
                    <span class="text-gray-900">{{ payment.reserverPhone }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-20 text-sm">이메일</span>
                    <span class="text-gray-900 text-sm">{{ payment.reserverEmail }}</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2 mb-4!">
                  <i class="pi pi-building text-purple-600"></i>
                  <span class="font-semibold text-gray-700">객실 정보</span>
                </div>
                <div class="space-y-2">
                  <div class="flex">
                    <span class="text-gray-500 w-20 text-sm">객실명</span>
                    <span class="font-medium text-gray-900">{{ payment.roomType }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-20 text-sm">투숙인원</span>
                    <span class="text-gray-900">{{ payment.guestCount || 2 }}명</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-500 w-20 text-sm">주문번호</span>
                    <span class="text-gray-900 text-sm font-mono">{{ payment.orderId }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 결제 정보 -->
            <div class="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div class="flex items-center gap-2 mb-3!">
                <i class="pi pi-credit-card text-blue-600"></i>
                <span class="font-semibold text-gray-700">결제 정보</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">기본 금액</span>
                    <span class="text-gray-900">{{ payment.baseAmount.toLocaleString() }}원</span>
                  </div>
                  <div class="flex justify-between text-sm" v-if="payment.couponDiscountAmount">
                    <span class="text-gray-600">쿠폰 할인</span>
                    <span class="text-red-600">-{{ payment.couponDiscountAmount.toLocaleString() }}원</span>
                  </div>
                  <div class="flex justify-between text-sm" v-if="payment.fixedDiscountAmount">
                    <span class="text-gray-600">프로모션 할인</span>
                    <span class="text-red-600">-{{ payment.fixedDiscountAmount.toLocaleString() }}원</span>
                  </div>
                  <div class="flex justify-between text-sm" v-if="payment.pointDiscountAmount">
                    <span class="text-gray-600">포인트 사용</span>
                    <span class="text-red-600">-{{ payment.pointDiscountAmount.toLocaleString() }}원</span>
                  </div>
                </div>
                <div class="border-l pl-4 flex flex-col justify-center">
                  <div class="text-sm text-gray-600 mb-1!">최종 결제금액</div>
                  <div class="text-3xl font-bold text-blue-600">{{ payment.finalAmount.toLocaleString() }}<span class="text-lg">원</span></div>
                  <div class="text-xs text-gray-500 mt-1">{{ payment.method }}</div>
                </div>
              </div>
            </div>

            <!-- 요청사항 -->
            <div v-if="payment.request" class="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div class="flex items-start gap-2">
                <i class="pi pi-info-circle text-yellow-600 mt-1"></i>
                <div class="flex-1">
                  <div class="font-semibold text-gray-700 mb-1!">요청사항</div>
                  <div class="text-sm text-gray-600 whitespace-pre-wrap">{{ payment.request }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 푸터 -->
          <div class="bg-gray-100 p-6 rounded-b-xl border-x-2 border-b-2 border-dashed border-gray-300">
            <div class="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <div class="font-semibold mb-2! text-gray-700">예약 정보</div>
                <div>예약 ID: {{ payment.reservationId }}</div>
                <div>결제 ID: {{ payment.paymentId }}</div>
                <div>예약일시: {{ new Date(payment.transactionDate).toLocaleString() }}</div>
              </div>
              <div class="text-right">
                <div class="font-semibold mb-2! text-gray-700">문의</div>
                <div>{{ payment.placeName }}</div>
                <div>이메일: support@hotel.com</div>
                <div>전화: 1588-0000</div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <i class="pi pi-info-circle mr-1"></i>
              본 확인증은 체크인 시 제시하여 주시기 바랍니다. 예약 변경 및 취소는 체크인 24시간 전까지 가능합니다.
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <Button label="닫기" icon="pi pi-times" @click="ticketDialogVisible = false" severity="secondary" />
            <Button label="인쇄하기" icon="pi pi-print" @click="printTicket" severity="primary" />
          </div>
        </template>
      </Dialog>

      <!-- Full-width stacked cards -->
      <div class="space-y-6">
        <!-- Price breakdown -->
        <PrimeCard class="shadow-sm border border-gray-200 mb-2!">
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
                <span class="text-gray-600">프로모션 할인
                  <span v-if="promoDiscountPercent !== null" class="ml-1 text-xs text-blue-500 font-semibold">({{ promoDiscountPercent }}%)</span>
                </span>
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
              <div class="flex justify-between"><span class="text-gray-600">결제 상태</span>
                <span class="font-medium">
                  <Tag :value="statusTag.label" :severity="statusTag.severity" rounded class="px-3 py-1 text-base" />
                </span>
              </div>
              <div class="flex justify-between"><span class="text-gray-600">결제 일시</span><span>{{ new Date(payment.transactionDate).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Reservation ID</span><span>{{ payment.reservationId }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Place</span><span>{{ payment.placeName }} ({{ payment.placeId }})</span></div>
            </div>
          </template>
        </PrimeCard>
      </div>

      <!-- Actions -->
      <div style="margin-top: 10px; margin-bottom: 10px;" class="flex justify-end gap-3">
        <PrimeButton label="주문번호 복사" icon="pi pi-copy" severity="secondary" @click="copy(payment.orderId, '주문번호')" />
        <PrimeButton v-if="isCancelable" label="결제 취소" icon="pi pi-times" severity="danger" :loading="!cancelMutation.isPending" @click="cancel" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ticket-container {
  font-family: 'Noto Sans KR', sans-serif;
}

.ticket-container .grid {
  grid-template-columns: repeat(3, 1fr);
}

.ticket-container .rounded-xl {
  border-radius: 1rem;
}

.ticket-container .bg-gradient-to-r {
  background: linear-gradient(to right, #2563eb, #6b46c1);
}

.ticket-container .bg-gradient-to-br {
  background: linear-gradient(to bottom right, #eff6ff, #f7d7ff);
}

.ticket-container .text-blue-600 {
  color: #2563eb;
}

.ticket-container .text-purple-600 {
  color: #6b46c1;
}

.ticket-container .text-blue-700 {
  color: #1e40af;
}

.ticket-container .text-purple-700 {
  color: #5b21b6;
}

.ticket-container .text-red-600 {
  color: #dc2626;
}

.ticket-container .bg-blue-100 {
  background-color: #ebf8ff;
}

.ticket-container .bg-purple-100 {
  background-color: #f5f3ff;
}

.ticket-container .border-dashed {
  border-style: dashed;
}

.ticket-container .border-2 {
  border-width: 2px;
}

.ticket-container .p-6 {
  padding: 1.5rem;
}

.ticket-container .p-8 {
  padding: 2rem;
}

.ticket-container .text-3xl {
  font-size: 1.875rem;
}

.ticket-container .text-2xl {
  font-size: 1.5rem;
}

.ticket-container .text-xl {
  font-size: 1.25rem;
}

.ticket-container .text-lg {
  font-size: 1.125rem;
}

.ticket-container .text-sm {
  font-size: 0.875rem;
}

.ticket-container .text-xs {
  font-size: 0.75rem;
}

.ticket-container .font-bold {
  font-weight: 700;
}

.ticket-container .font-semibold {
  font-weight: 600;
}

.ticket-container .font-medium {
  font-weight: 500;
}

.ticket-container .tracking-wider {
  letter-spacing: 0.05em;
}

.ticket-container .whitespace-pre-wrap {
  white-space: pre-wrap;
}

.ticket-container .h-px {
  height: 1px;
}

.ticket-container .rounded-full {
  border-radius: 9999px;
}

.ticket-container .border-l {
  border-left-width: 2px;
}

.ticket-container .pl-4 {
  padding-left: 1rem;
}

.ticket-container .pr-4 {
  padding-right: 1rem;
}

.ticket-container .py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.ticket-container .px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.ticket-container .gap-2 {
  gap: 0.5rem;
}

.ticket-container .gap-4 {
  gap: 1rem;
}

.ticket-container .mb-2 {
  margin-bottom: 0.5rem;
}

.ticket-container .mb-4 {
  margin-bottom: 1rem;
}

.ticket-container .mb-6 {
  margin-bottom: 1.5rem;
}

.ticket-container .mt-1 {
  margin-top: 0.25rem;
}

.ticket-container .mt-2 {
  margin-top: 0.5rem;
}

.ticket-container .mt-3 {
  margin-top: 0.75rem;
}

.ticket-container .mt-4 {
  margin-top: 1rem;
}

.ticket-container .text-center {
  text-align: center;
}

.ticket-container .text-right {
  text-align: right;
}

.ticket-container .border-b {
  border-bottom-width: 2px;
}

.ticket-container .border-t {
  border-top-width: 2px;
}

.ticket-container .border-l-4 {
  border-left-width: 4px;
}

.ticket-container .border-r-4 {
  border-right-width: 4px;
}

.ticket-container .border-t-4 {
  border-top-width: 4px;
}

.ticket-container .border-b-4 {
  border-bottom-width: 4px;
}

.ticket-container .bg-yellow-50 {
  background-color: #fefcbf;
}

.ticket-container .border-yellow-400 {
  border-color: #fbbf24;
}

.ticket-container .text-yellow-600 {
  color: #d97706;
}

.ticket-container .text-gray-900 {
  color: #111827;
}

.ticket-container .text-gray-800 {
  color: #1f2937;
}

.ticket-container .text-gray-700 {
  color: #374151;
}

.ticket-container .text-gray-600 {
  color: #4b5563;
}

.ticket-container .text-gray-500 {
  color: #6b7280;
}

.ticket-container .text-gray-400 {
  color: #9ca3af;
}

.ticket-container .text-gray-300 {
  color: #d1d5db;
}

.ticket-container .text-gray-200 {
  color: #e5e7eb;
}

.ticket-container .text-gray-100 {
  color: #f3f4f6;
}

.ticket-container .bg-gray-50 {
  background-color: #f9fafb;
}

.ticket-container .bg-gray-100 {
  background-color: #f3f4f6;
}

.ticket-container .bg-gray-200 {
  background-color: #e5e7eb;
}

.ticket-container .bg-gray-300 {
  background-color: #d1d5db;
}

.ticket-container .bg-gray-400 {
  background-color: #9ca3af;
}

.ticket-container .bg-gray-500 {
  background-color: #6b7280;
}

.ticket-container .bg-gray-600 {
  background-color: #4b5563;
}

.ticket-container .bg-gray-700 {
  background-color: #374151;
}

.ticket-container .bg-gray-800 {
  background-color: #1f2937;
}

.ticket-container .bg-gray-900 {
  background-color: #111827;
}

/* 인쇄 시 색상 유지 */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .ticket-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .ticket-container .bg-gradient-to-r {
    background: linear-gradient(to right, #2563eb, #6b46c1) !important;
    -webkit-print-color-adjust: exact;
  }

  .ticket-container .bg-gradient-to-br {
    background: linear-gradient(to bottom right, #eff6ff, #f7d7ff) !important;
    -webkit-print-color-adjust: exact;
  }

  .ticket-container .text-blue-600 {
    color: #2563eb !important;
  }

  .ticket-container .text-purple-600 {
    color: #6b46c1 !important;
  }

  .ticket-container .text-blue-700 {
    color: #1e40af !important;
  }

  .ticket-container .text-red-600 {
    color: #dc2626 !important;
  }

  .ticket-container .bg-blue-100 {
    background-color: #ebf8ff !important;
  }

  .ticket-container .bg-gray-50 {
    background-color: #f9fafb !important;
  }

  .ticket-container .bg-gray-100 {
    background-color: #f3f4f6 !important;
  }

  .ticket-container .bg-yellow-50 {
    background-color: #fefcbf !important;
  }

  .ticket-container .border-yellow-400 {
    border-color: #fbbf24 !important;
  }

  .ticket-container .text-yellow-600 {
    color: #d97706 !important;
  }

  .ticket-container .text-white {
    color: #ffffff !important;
  }

  .ticket-container .text-blue-100 {
    color: #dbeafe !important;
  }

  /* 다이얼로그 헤더와 푸터 숨기기 */
  .p-dialog-header,
  .p-dialog-footer {
    display: none !important;
  }

  /* 페이지 여백 조정 */
  @page {
    margin: 1cm;
  }

  /* 배경색 강제 적용 */
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
