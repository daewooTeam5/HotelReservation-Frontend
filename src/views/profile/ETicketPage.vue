<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, onMounted, nextTick } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { ApiResult } from '@/types/ApiResult';
import type { PaymentDetail } from '@/types/reservation';
import { httpFetcher } from '@/utils/httpFetcher';
import QRCode from 'qrcode';

const route = useRoute();
const paymentId = computed(() => String(route.params.paymentId || ''));

const { isLoading, isError, error, data } = useQuery<ApiResult<PaymentDetail>>({
  queryKey: computed(() => ['v1', 'users', 'my', 'payments', paymentId.value]),
  queryFn: httpFetcher
});

const payment = computed(() => data.value?.data ?? null);
const qrCanvas = ref<HTMLCanvasElement | null>(null);

// QR 코드 생성 함수
const generateQR = async () => {
  await nextTick(); // DOM 렌더링 대기

  if (!payment.value?.reservationId) {
    console.warn('예약 ID가 없습니다:', payment.value);
    return;
  }

  if (!qrCanvas.value) {
    console.warn('QR Canvas가 준비되지 않았습니다');
    return;
  }

  const reservationId = String(payment.value.orderId).trim();

  if (!reservationId || reservationId === '') {
    console.error('유효하지 않은 예약 ID:', reservationId);
    return;
  }

  try {
    await QRCode.toCanvas(qrCanvas.value, reservationId, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    console.log('QR 코드 생성 완료:', reservationId);
  } catch (error) {
    console.error('QR 코드 생성 실패:', error);
    console.error('예약 ID 값:', reservationId, '타입:', typeof reservationId);
  }
};

// 데이터 로드 후 QR 생성
onMounted(() => {
  const interval = setInterval(() => {
    if (payment.value?.reservationId && qrCanvas.value) {
      generateQR();
      clearInterval(interval);
    }
  }, 100);

  // 5초 후에도 안되면 인터벌 정리
  setTimeout(() => clearInterval(interval), 5000);
});

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

const printTicket = () => {
  window.print();
};

const goBack = () => {
  window.history.back();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <!-- 로딩 -->
    <div v-if="isLoading" class="max-w-4xl mx-auto px-4">
      <Skeleton height="600px" />
    </div>

    <!-- 에러 -->
    <div v-else-if="isError" class="max-w-4xl mx-auto px-4">
      <div class="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {{ (error as Error)?.message || '티켓 정보를 불러오지 못했습니다.' }}
      </div>
    </div>

    <!-- E-티켓 -->
    <div v-else-if="payment" class="max-w-4xl mx-auto px-4">
      <!-- 액션 버튼 (인쇄시 숨김) -->
      <div class="flex justify-between items-center mb-6 no-print">
        <Button label="뒤로 가기" icon="pi pi-arrow-left" @click="goBack" severity="secondary" />
        <Button label="인쇄하기" icon="pi pi-print" @click="printTicket" severity="primary" />
      </div>

      <!-- 티켓 디자인 -->
      <div class="ticket-container bg-white shadow-2xl">
        <!-- 헤더 섹션 -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-xl">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold mb-2">{{ payment.placeName }}</h1>
              <p class="text-blue-100 text-lg">숙박 예약 확인증</p>
            </div>
            <div class="text-right">
              <Tag :value="statusTag.label" :severity="statusTag.severity"
                   class="text-xl px-5 py-2" />
            </div>
          </div>
        </div>

        <!-- 메인 티켓 바디 -->
        <div class="bg-white p-10 border-x-2 border-dashed border-gray-300">
          <!-- 예약 번호 & QR 코드 -->
          <div class="mb-10 pb-8 border-b-2 border-dashed border-gray-300">
            <div
              class="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <!-- 예약번호 -->
              <div class="text-center md:text-left mb-6 md:mb-0">
                <div class="text-sm text-gray-500 mb-2">예약번호</div>
                <div class="text-4xl font-bold text-gray-900 tracking-wider font-mono">
                  {{ payment.reservationId }}
                </div>
                <div class="text-xs text-gray-500 mt-2">QR 코드로 빠르게 체크인 할수 있어요</div>
              </div>

              <!-- QR 코드 -->
              <div class="flex flex-col items-center justify-center">
                <canvas
                  ref="qrCanvas"
                  class="border border-gray-200 rounded-xl p-3 bg-white shadow-sm transition-transform duration-200 hover:scale-105"
                ></canvas>
              </div>
            </div>
          </div>

          <!-- 체크인/체크아웃 정보 -->
          <div class="grid grid-cols-3 gap-6 mb-10 items-center mt-4!">
            <!-- 체크인 -->
            <div class="text-center">
              <div class="text-sm text-gray-500 mb-3">체크인</div>
              <div class="text-3xl font-bold text-gray-900">
                {{ new Date(payment.resevStart).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              }) }}
              </div>
              <div class="text-base text-gray-600 mt-1">
                {{ new Date(payment.resevStart).toLocaleDateString('ko-KR', { weekday: 'short' }) }}
              </div>
              <div class="text-sm text-gray-500 mt-2">15:00</div>
            </div>

            <!-- 중간 아이콘 -->
            <div class="text-center">
              <div class="flex items-center justify-center gap-3">
                <div class="h-px bg-gray-300 flex-1"></div>
                <div class="bg-blue-100 rounded-full p-4">
                  <i class="pi pi-home text-blue-600 text-2xl"></i>
                </div>
                <div class="h-px bg-gray-300 flex-1"></div>
              </div>
              <div class="text-base text-gray-600 mt-3">{{ nights }}박</div>
            </div>

            <!-- 체크아웃 -->
            <div class="text-center">
              <div class="text-sm text-gray-500 mb-3">체크아웃</div>
              <div class="text-3xl font-bold text-gray-900">
                {{ new Date(payment.resevEnd).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              }) }}
              </div>
              <div class="text-base text-gray-600 mt-1">
                {{ new Date(payment.resevEnd).toLocaleDateString('ko-KR', { weekday: 'short' }) }}
              </div>
              <div class="text-sm text-gray-500 mt-2">11:00</div>
            </div>
          </div>

          <!-- 투숙객 정보 -->
          <div class="grid grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
            <div>
              <div class="flex items-center gap-3 mb-5">
                <i class="pi pi-user text-blue-600 text-xl"></i>
                <span class="font-semibold text-gray-700 text-lg">투숙객 정보</span>
              </div>
              <div class="space-y-3">
                <div class="flex">
                  <span class="text-gray-500 w-24">이름</span>
                  <span class="font-medium text-gray-900">{{ payment.reserverName }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-500 w-24">연락처</span>
                  <span class="text-gray-900">{{ payment.reserverPhone }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-500 w-24">이메일</span>
                  <span class="text-gray-900">{{ payment.reserverEmail }}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center gap-3 mb-5">
                <i class="pi pi-building text-purple-600 text-xl"></i>
                <span class="font-semibold text-gray-700 text-lg">객실 정보</span>
              </div>
              <div class="space-y-3">
                <div class="flex">
                  <span class="text-gray-500 w-24">객실명</span>
                  <span class="font-medium text-gray-900">{{ payment.roomType }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-500 w-24">투숙인원</span>
                  <span class="text-gray-900">{{ payment.guestCount || 2 }}명</span>
                </div>
                <div class="flex">
                  <span class="text-gray-500 w-24">주문번호</span>
                  <span class="text-gray-900 font-mono text-sm">{{ payment.orderId }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 결제 정보 -->
          <div class="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <div class="flex items-center gap-3 mb-4">
              <i class="pi pi-credit-card text-blue-600 text-xl"></i>
              <span class="font-semibold text-gray-700 text-lg">결제 정보</span>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">기본 금액</span>
                  <span class="text-gray-900 font-medium">{{ payment.baseAmount.toLocaleString()
                    }}원</span>
                </div>
                <div class="flex justify-between" v-if="payment.couponDiscountAmount">
                  <span class="text-gray-600">쿠폰 할인</span>
                  <span
                    class="text-red-600 font-medium">-{{ payment.couponDiscountAmount.toLocaleString()
                    }}원</span>
                </div>
                <div class="flex justify-between" v-if="payment.fixedDiscountAmount">
                  <span class="text-gray-600">프로모션 할인</span>
                  <span
                    class="text-red-600 font-medium">-{{ payment.fixedDiscountAmount.toLocaleString()
                    }}원</span>
                </div>
                <div class="flex justify-between" v-if="payment.pointDiscountAmount">
                  <span class="text-gray-600">포인트 사용</span>
                  <span
                    class="text-red-600 font-medium">-{{ payment.pointDiscountAmount.toLocaleString()
                    }}원</span>
                </div>
              </div>
              <div class="border-l-2 border-blue-200 pl-6 flex flex-col justify-center">
                <div class="text-sm text-gray-600 mb-2">최종 결제금액</div>
                <div class="text-4xl font-bold text-blue-600">
                  {{ payment.finalAmount.toLocaleString() }}<span class="text-xl">원</span></div>
                <div class="text-sm text-gray-500 mt-2">{{ payment.method }}</div>
              </div>
            </div>
          </div>

          <!-- 요청사항 -->
          <div v-if="payment.request"
               class="mt-8 p-5 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div class="flex items-start gap-3">
              <i class="pi pi-info-circle text-yellow-600 text-lg mt-1"></i>
              <div class="flex-1">
                <div class="font-semibold text-gray-700 mb-2">요청사항</div>
                <div class="text-gray-600 whitespace-pre-wrap">{{ payment.request }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 푸터 -->
        <div
          class="bg-gray-100 p-8 rounded-b-xl border-x-2 border-b-2 border-dashed border-gray-300">
          <div class="grid grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <div class="font-semibold mb-3 text-gray-700">예약 정보</div>
              <div class="space-y-1">
                <div>예약 ID: {{ payment.reservationId }}</div>
                <div>결제 ID: {{ payment.paymentId }}</div>
                <div>예약일시: {{ new Date(payment.transactionDate).toLocaleString() }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold mb-3 text-gray-700">문의</div>
              <div class="space-y-1">
                <div>{{ payment.placeName }}</div>
                <div>이메일: support@hotel.com</div>
                <div>전화: 1588-0000</div>
              </div>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
            <i class="pi pi-info-circle mr-2"></i>
            본 확인증은 체크인 시 제시하여 주시기 바랍니다. 예약 변경 및 취소는 체크인 24시간 전까지 가능합니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-container {
  font-family: 'Noto Sans KR', sans-serif;
}

/* 인쇄 시 색상 유지 */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .no-print {
    display: none !important;
  }

  body {
    background: white;
  }

  .ticket-container {
    box-shadow: none !important;
  }

  .bg-gradient-to-r {
    background: linear-gradient(to right, #2563eb, #6b46c1) !important;
  }

  .bg-gradient-to-br {
    background: linear-gradient(to bottom right, #eff6ff, #f7d7ff) !important;
  }

  @page {
    margin: 1cm;
  }
}
</style>
