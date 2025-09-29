<template>
  <div class="flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">결제 관리</h1>
    </div>

    <!-- 검색 필터 -->
    <div class="flex flex-wrap gap-4 items-center">
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
      <Button label="검색" @click="fetchPayments" />
    </div>

    <!-- 결제 리스트 -->
    <DataTable
      :value="payments"
      responsiveLayout="scroll"
      class="mt-4"
      @row-click="onRowClick"
    >
      <Column field="id" header="결제 ID" style="min-width: 80px" />
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PrimeSelect from 'primevue/select';

const router = useRouter();

// 결제 리스트 데이터
const payments = ref<any[]>([]);
const filters = ref({
  orderId: '',
  paymentKey: '',
  status: '',
});

// 상태 옵션
const statusOptions = [
  { label: "결제 완료", value: "paid" },
  { label: "취소됨", value: "cancelled" },
  { label: "환불됨", value: "refunded" },
];

const fetchPayments = async () => {
  try {
    const res = await apiClient.get('/v1/payment/all', {
      params: {
        orderId: filters.value.orderId || undefined,
        paymentKey: filters.value.paymentKey || undefined,
        status: filters.value.status || undefined,
      },
    });
    payments.value = res.data;
  } catch (err) {
    console.error("결제 리스트 불러오기 실패:", err);
  }
};

// row 클릭 → 상세 페이지 이동
const onRowClick = (event: any) => {
  const paymentId = event.data.id;
  router.push({ name: "admin-payment-detail", params: { id: paymentId } });
};

// 상태 색상
const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-yellow-100 text-yellow-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

// 상태 한글 번역
const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    paid: '결제 완료',
    cancelled: '취소됨',
    refunded: '환불됨',
  };
  return map[status] || status;
};

// 날짜 포맷터
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString();
};

// 페이지 로드 시 자동 실행
fetchPayments();
</script>
