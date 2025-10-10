<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <ConfirmDialog></ConfirmDialog>

    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">할인 관리</h1>
      <p class="text-gray-600 mt-1">숙소에 적용될 기간별 할인을 관리합니다.</p>
    </div>

    <Card>
      <template #title>
        <Toolbar class="mb-4">
          <template #start>
            <Button label="새 할인 생성" icon="pi pi-plus" class="p-button-success mr-2" @click="openCreateDialog" />
          </template>
        </Toolbar>
      </template>
      <template #content>
        <DataTable
          :value="discounts"
          :loading="isLoading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          v-model:selection="selectedDiscount"
          selectionMode="single"
          dataKey="id"
          @row-select="onRowSelect"
          class="cursor-pointer"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold">할인 목록</h2>
              <span class="text-sm text-gray-500">{{ discounts.length }}개 항목</span>
            </div>
          </template>

          <Column field="name" header="할인명" sortable></Column>
          <Column field="discountValue" header="할인율 (%)" sortable>
            <template #body="slotProps">
              {{ slotProps.data.discountValue }}%
            </template>
          </Column>
          <Column field="maxDiscountAmount" header="최대 할인 금액" sortable>
            <template #body="slotProps">
              {{ slotProps.data.maxDiscountAmount ? `${slotProps.data.maxDiscountAmount.toLocaleString()}원` : '무제한' }}
            </template>
          </Column>
          <Column field="startDate" header="시작일" sortable></Column>
          <Column field="endDate" header="종료일" sortable></Column>
          <Column headerStyle="width: 10rem">
            <template #body="slotProps">
              <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click.stop="confirmDelete(slotProps.data.id)" />
            </template>
          </Column>
          <template #empty>
            <div class="text-center py-8">등록된 할인이 없습니다.</div>
          </template>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="isDialogVisible" modal header="새 할인 생성" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 mt-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-1">할인명</label>
          <InputText id="name" v-model="form.name" class="w-full" :class="{'p-invalid': errors.name}" />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>
        <div>
          <label for="discountValue" class="block text-sm font-medium mb-1">할인율 (%)</label>
          <InputNumber id="discountValue" v-model="form.discountValue" class="w-full" :min="1" :max="100" suffix=" %" :class="{'p-invalid': errors.discountValue}" />
          <small v-if="errors.discountValue" class="p-error">{{ errors.discountValue }}</small>
        </div>
        <div>
          <label for="maxDiscountAmount" class="block text-sm font-medium mb-1">최대 할인 금액 (원)</label>
          <InputNumber id="maxDiscountAmount" v-model="form.maxDiscountAmount" class="w-full" mode="currency" currency="KRW" locale="ko-KR" placeholder="미입력 시 무제한" />
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium mb-1">시작일</label>
          <Calendar id="startDate" v-model="form.startDate" dateFormat="yy-mm-dd" class="w-full" :class="{'p-invalid': errors.startDate}" />
          <small v-if="errors.startDate" class="p-error">{{ errors.startDate }}</small>
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium mb-1">종료일</label>
          <Calendar id="endDate" v-model="form.endDate" dateFormat="yy-mm-dd" class="w-full" :minDate="form.startDate" :class="{'p-invalid': errors.endDate}" />
          <small v-if="errors.endDate" class="p-error">{{ errors.endDate }}</small>
        </div>
      </div>
      <template #footer>
        <Button label="취소" icon="pi pi-times" @click="isDialogVisible = false" class="p-button-text" />
        <Button label="저장" icon="pi pi-check" @click="handleSubmit" :loading="isSubmitting" />
      </template>
    </Dialog>

    <Dialog v-model:visible="isDetailDialogVisible" modal :header="detailData?.name" :style="{ width: '40rem' }">
      <div v-if="isDetailLoading" class="text-center p-4">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>
      <div v-else-if="detailData">
        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div class="bg-gray-100 p-3 rounded-md">
            <p class="text-gray-500 font-semibold">총 사용 횟수</p>
            <p class="text-xl font-bold">{{ detailData.usageCount }}회</p>
          </div>
          <div class="bg-gray-100 p-3 rounded-md">
            <p class="text-gray-500 font-semibold">총 할인 금액</p>
            <p class="text-xl font-bold">{{ detailData.totalDiscountAmount.toLocaleString() }}원</p>
          </div>
        </div>

        <h3 class="font-semibold mb-2">일별 사용 현황</h3>
        <Calendar v-model="calendarDate" inline class="w-full shadow-none border">
          <template #date="slotProps">
            <div class="relative w-full h-full flex items-center justify-center">
              <span :class="{ 'font-bold': isToday(slotProps.date) }">{{ slotProps.date.day }}</span>
              <div v-if="getUsageForDate(slotProps.date)"
                   class="absolute bottom-1 w-2 h-2 rounded-full"
                   :style="{ backgroundColor: getUsageColor(getUsageForDate(slotProps.date)) }">
              </div>
            </div>
          </template>
        </Calendar>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Card from 'primevue/card';
import Toolbar from 'primevue/toolbar';

interface Discount {
  id: number;
  name: string;
  discountValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
}

interface DiscountDetail extends Discount {
  usageCount: number;
  totalDiscountAmount: number;
  dailyUsage: { [key: string]: number };
}

const toast = useToast();
const confirm = useConfirm();
const queryClient = useQueryClient();

const isDialogVisible = ref(false);
const isDetailDialogVisible = ref(false);
const isSubmitting = ref(false);
const selectedDiscount = ref<Discount | null>(null);
const calendarDate = ref(new Date());

const form = ref<{
  name: string;
  discountValue: number | null;
  maxDiscountAmount: number | null;
  startDate: Date | null;
  endDate: Date | null;
}>({
  name: '',
  discountValue: 10,
  maxDiscountAmount: null,
  startDate: null,
  endDate: null,
});

const errors = ref({
  name: '',
  discountValue: '',
  startDate: '',
  endDate: '',
});

// Fetch discounts
const { data: discounts, isLoading } = useQuery<Discount[]>({
  queryKey: ['ownerDiscounts'],
  queryFn: async () => {
    const response = await apiClient.get('/v1/owner/discounts');
    return response.data.data;
  },
  initialData: [],
});

// Fetch discount detail
const { data: detailData, isLoading: isDetailLoading, refetch: refetchDetail } = useQuery<DiscountDetail>({
  queryKey: ['ownerDiscountDetail', selectedDiscount],
  queryFn: async () => {
    if (!selectedDiscount.value) return null;
    const response = await apiClient.get(`/v1/owner/discounts/${selectedDiscount.value.id}`);
    return response.data.data;
  },
  enabled: false,
});

// Create mutation
const createMutation = useMutation({
  mutationFn: (newDiscount: any) => apiClient.post('/v1/owner/discounts', newDiscount),
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '새로운 할인이 생성되었습니다.', life: 3000 });
    queryClient.invalidateQueries({ queryKey: ['ownerDiscounts'] });
    isDialogVisible.value = false;
  },
  onError: (error: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: error.response?.data?.error?.detail || '할인 생성에 실패했습니다.', life: 3000 });
  },
  onSettled: () => {
    isSubmitting.value = false;
  }
});

// Delete mutation
const deleteMutation = useMutation({
  mutationFn: (discountId: number) => apiClient.delete(`/v1/owner/discounts/${discountId}`),
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '할인이 삭제되었습니다.', life: 3000 });
    queryClient.invalidateQueries({ queryKey: ['ownerDiscounts'] });
  },
  onError: (error: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: error.response?.data?.error?.detail || '할인 삭제에 실패했습니다.', life: 3000 });
  }
});

const onRowSelect = (event: any) => {
  selectedDiscount.value = event.data;
  calendarDate.value = new Date(event.data.startDate);
  refetchDetail();
  isDetailDialogVisible.value = true;
};

const openCreateDialog = () => {
  form.value = {
    name: '',
    discountValue: 10,
    maxDiscountAmount: null,
    startDate: null,
    endDate: null,
  };
  errors.value = { name: '', discountValue: '', startDate: '', endDate: '' };
  isDialogVisible.value = true;
};

const validateForm = () => {
  let isValid = true;
  errors.value = { name: '', discountValue: '', startDate: '', endDate: '' };

  if (!form.value.name) {
    errors.value.name = '할인명을 입력해주세요.';
    isValid = false;
  }
  if (!form.value.discountValue || form.value.discountValue <= 0) {
    errors.value.discountValue = '할인율은 1% 이상이어야 합니다.';
    isValid = false;
  }
  if (!form.value.startDate) {
    errors.value.startDate = '시작일을 선택해주세요.';
    isValid = false;
  }
  if (!form.value.endDate) {
    errors.value.endDate = '종료일을 선택해주세요.';
    isValid = false;
  }
  return isValid;
};

const handleSubmit = () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  const submissionData = {
    ...form.value,
    startDate: form.value.startDate ? new Date(form.value.startDate).toISOString().split('T')[0] : null,
    endDate: form.value.endDate ? new Date(form.value.endDate).toISOString().split('T')[0] : null,
  };
  createMutation.mutate(submissionData);
};

const confirmDelete = (discountId: number) => {
  confirm.require({
    message: '정말로 이 할인을 삭제하시겠습니까?',
    header: '삭제 확인',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '삭제',
    rejectLabel: '취소',
    accept: () => {
      deleteMutation.mutate(discountId);
    }
  });
};

const getUsageForDate = (date: { year: number, month: number, day: number }) => {
  if (!detailData.value) return 0;
  const dateStr = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  return detailData.value.dailyUsage[dateStr] || 0;
}

const getUsageColor = (usage: number) => {
  if (usage === 0) return 'transparent';
  if (usage <= 2) return 'rgba(34, 197, 94, 0.4)'; // green-400 with opacity
  if (usage <= 5) return 'rgba(34, 197, 94, 0.7)'; // green-500
  return 'rgba(22, 163, 74, 1)'; // green-600
}

const isToday = (date: any) => {
  const today = new Date();
  return date.day === today.getDate() && date.month === today.getMonth() && date.year === today.getFullYear();
}
</script>
