<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">결제 관리</h1>
    </div>

    <div class="flex flex-wrap gap-4 items-center">
      <InputText v-model="filters.name" placeholder="사용자 이름" />
      <InputText v-model="filters.orderId" placeholder="주문번호" />
      <InputText v-model="filters.paymentKey" placeholder="결제 키" />
      <PrimeSelect
        v-model="filters.status"
        :options="[{ label: '선택 없음', value: '' }, ...statusOptions]"
        optionLabel="label"
        optionValue="value"
        placeholder="상태 선택"
        class="w-40"
      />
      <Button label="검색" icon="pi pi-search" @click="fetchPayments" />
    </div>

    <DataTable
      :value="payments"
      responsiveLayout="scroll"
      class="mt-4 cursor-pointer"
      rowHover
      @row-click="onRowClick"
    >
      <Column field="id" header="결제 ID" style="min-width: 80px" />
      <Column field="userName" header="사용자 이름" style="min-width: 120px" />
      <Column field="orderId" header="주문번호" style="min-width: 120px" />
      <Column field="paymentKey" header="결제키" style="min-width: 150px" />
      <Column field="amount" header="금액" style="min-width: 100px">
        <template #body="slotProps">
          {{ slotProps.data.amount?.toLocaleString() }} 원
        </template>
      </Column>
      <Column field="transactionDate" header="결제일" style="min-width: 180px">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.transactionDate) }}
        </template>
      </Column>
      <Column field="method" header="결제수단" style="min-width: 100px" />
      <Column header="상태" style="min-width: 100px">
        <template #body="slotProps">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getStatusClass(slotProps.data.status)"
          >
            {{ translateStatus(slotProps.data.status) }}
          </span>
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-6">
          결제 내역이 없습니다.
        </div>
      </template>
    </DataTable>
  </div>

  <PrimeDialog v-model:visible="isHistoryModalVisible" modal header="결제 상세 내역" :style="{ width: '50vw' }">
    <div v-if="isHistoryLoading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>상세 내역을 불러오는 중...</p>
    </div>
    <div v-else-if="paymentHistory" class="space-y-6">
      <div v-if="paymentHistory.paymentInfo">
        <h3 class="font-bold text-lg border-b pb-2 mb-3">주문 정보 ({{ paymentHistory.paymentInfo.orderId }})</h3>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <p><strong>결제 키:</strong> {{ paymentHistory.paymentInfo.paymentKey }}</p>
          <p><strong>상태:</strong> {{ paymentHistory.paymentInfo.status }}</p>
          <p><strong>결제 수단:</strong> {{ paymentHistory.paymentInfo.method }} ({{ paymentHistory.paymentInfo.easyPay?.provider }})</p>
          <p><strong>총액:</strong> {{ paymentHistory.paymentInfo.totalAmount?.toLocaleString() }}원</p>
          <p><strong>요청 시간:</strong> {{ formatDate(paymentHistory.paymentInfo.requestedAt) }}</p>
          <p><strong>승인 시간:</strong> {{ formatDate(paymentHistory.paymentInfo.approvedAt) }}</p>
          <p v-if="paymentHistory.paymentInfo.card"><strong>카드 번호:</strong> {{ paymentHistory.paymentInfo.card.number }}</p>
          <p v-if="paymentHistory.paymentInfo.receipt?.url">
            <strong>영수증:</strong>
            <a :href="paymentHistory.paymentInfo.receipt.url" target="_blank" class="text-blue-600 hover:underline">
              링크 보기
            </a>
          </p>
        </div>
      </div>

      <div v-if="paymentHistory.payment?.reservation">
        <h3 class="font-bold text-lg border-b pb-2 mb-3">결제 금액 상세</h3>
        <div class="space-y-2 text-sm p-2 bg-gray-50 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">주문 금액</span>
            <span>{{ paymentHistory.payment.reservation.baseAmount?.toLocaleString() }}원</span>
          </div>
          <div v-if="paymentHistory.payment.reservation.couponDiscountAmount > 0" class="flex justify-between items-center text-red-600">
            <span>쿠폰 할인</span>
            <span>- {{ paymentHistory.payment.reservation.couponDiscountAmount?.toLocaleString() }}원</span>
          </div>
          <div v-if="paymentHistory.payment.reservation.pointDiscountAmount > 0" class="flex justify-between items-center text-red-600">
            <span>포인트 사용</span>
            <span>- {{ paymentHistory.payment.reservation.pointDiscountAmount?.toLocaleString() }}원</span>
          </div>
          <div class="border-t my-2"></div>
          <div class="flex justify-between items-center font-bold text-base">
            <span>최종 결제 금액</span>
            <span class="text-blue-600">{{ paymentHistory.payment.reservation.finalAmount?.toLocaleString() }}원</span>
          </div>
        </div>
      </div>

    </div>
    <div v-else class="text-center p-4">
      <p>상세 내역을 불러오지 못했습니다.</p>
    </div>
  </PrimeDialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PrimeSelect from 'primevue/select';
import PrimeDialog from 'primevue/dialog';

// --- 상태 변수 ---
const payments = ref<any[]>([]);
// [MODIFIED] filters 객체에 name 속성 추가
const filters = ref({ orderId: '', paymentKey: '', status: '', name: '' });
const statusOptions = [
  { label: "결제 완료", value: "paid" },
  { label: "취소됨", value: "cancelled" },
  { label: "환불됨", value: "refunded" },
];

const isHistoryModalVisible = ref(false);
const isHistoryLoading = ref(false);
const paymentHistory = ref<any | null>(null);

// --- API 호출 ---
const fetchPayments = async () => {
  try {
    // [MODIFIED] API 요청 파라미터에 name 추가
    const res = await apiClient.get('/v1/payment/all', {
      params: {
        orderId: filters.value.orderId || undefined,
        paymentKey: filters.value.paymentKey || undefined,
        status: filters.value.status || undefined,
        name: filters.value.name || undefined,
      },
    });
    payments.value = res.data;
  } catch (err) {
    console.error("결제 리스트 불러오기 실패:", err);
  }
};

const fetchPaymentHistory = async (paymentId: number) => {
  isHistoryLoading.value = true;
  paymentHistory.value = null;
  try {
    const res = await apiClient.get(`/v1/payment/${paymentId}/history`);
    const historyData = res.data;

    if (historyData && historyData.paymentInfo) {
      try {
        historyData.paymentInfo = JSON.parse(historyData.paymentInfo);
      } catch (e) {
        console.error("JSON 파싱 실패:", historyData.paymentInfo, e);
        historyData.paymentInfo = { error: "유효하지 않은 데이터 형식입니다." };
      }
    }
    paymentHistory.value = historyData;

  } catch (err) {
    console.error("결제 상세 내역 불러오기 실패:", err);
  } finally {
    isHistoryLoading.value = false;
  }
};

const onRowClick = (event: any) => {
  const paymentId = event.data.id;
  isHistoryModalVisible.value = true;
  fetchPaymentHistory(paymentId);
};

// --- Helper 함수 ---
const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-yellow-100 text-yellow-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};
const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    paid: '결제 완료',
    cancelled: '취소됨',
    refunded: '환불됨',
  };
  return map[status] || status;
};
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString();
};

// 페이지 로드 시 자동 실행
onMounted(() => {
  fetchPayments();
});
</script>
