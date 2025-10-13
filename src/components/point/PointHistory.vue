<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import type { PointHistoryItem, PointHistoryType } from '@/types/point';

// API 호출
const { isLoading, isError, data, error } = useQuery<ApiResult<PointHistoryItem[]>>({
  queryKey: ['v1','users','my','point-history'],
  queryFn: httpFetcher
});

// 데이터 처리 + 타입 안전하게 EARN/USE 변환
const items = computed(() =>
  data.value?.data.map(item => ({
    ...item,
    type: item.type.toUpperCase() as PointHistoryType
  })) ?? []
);

// 페이지네이션
const first = ref(0);
const rows = ref(5);

// 타입별 아이콘, 색상, 라벨
const getTypeInfo = (type: PointHistoryType | string) => {
  const map = {
    EARN: { icon: 'pi pi-plus-circle', severity: 'success', label: '포인트 적립', color: '#22c55e' },
    USE: { icon: 'pi pi-minus-circle', severity: 'danger', label: '포인트 사용', color: '#ef4444' },
  };
  return map[type as PointHistoryType] || { icon: 'pi pi-refresh', severity: 'info', label: '포인트 조정', color: '#3b82f6' };
};

// CSV 다운로드
const downloadCSV = () => {
  const csvContent = [
    ['날짜', '내용', '포인트', '잔액'],
    ...items.value.map(item => [
      new Date(item.createdAt).toLocaleString(),
      item.description || getTypeInfo(item.type).label,
      item.amount,
      item.balanceAfter
    ])
  ].map(e => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'point-history.csv');
  link.click();
};
</script>

<template>
  <Card class="shadow-md p-4">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-history text-primary text-xl"></i>
        <span class="text-xl font-bold">포인트 히스토리</span>
      </div>
    </template>

    <template #content>
      <!-- Loading -->
      <div v-if="isLoading" class="w-full">
        <Skeleton v-for="i in 5" :key="i" height="3rem" class="mb-2" />
      </div>

      <!-- Error -->
      <Message v-else-if="isError" severity="error" :closable="false" class="w-full">
        {{ (error as Error)?.message || '포인트 히스토리를 불러오지 못했습니다.' }}
      </Message>

      <!-- Empty -->
      <div v-else-if="items.length === 0" class="flex flex-col items-center p-5 text-gray-500">
        <i class="pi pi-inbox text-2xl"></i>
        <p class="mt-3">포인트 내역이 없습니다.</p>
      </div>

      <!-- Table -->
      <div v-else class="w-full">

        <DataTable
          :value="items"
          :paginator="items.length > rows"
          :rows="rows"
          :first="first"
          @page="(e) => first = e.first"
          stripedRows
          tableStyle="min-width: 100%"
          class="p-datatable-sm"
        >
          <!-- 내용 -->
          <Column header="내용" style="min-width: 40%">
            <template #body="slotProps">
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <i :class="getTypeInfo(slotProps.data.type).icon" :style="{ color: getTypeInfo(slotProps.data.type).color }"></i>
                  <span class="font-semibold">
                    {{ slotProps.data.description || getTypeInfo(slotProps.data.type).label }}
                  </span>
                </div>
                <small class="text-gray-400">
                  {{ new Date(slotProps.data.createdAt).toLocaleString() }}
                </small>
              </div>
            </template>
          </Column>

          <!-- 포인트 -->
          <Column header="포인트" style="width: 30%">
            <template #body="slotProps">
              <div class="flex flex-col items-end">
                <Tag :severity="slotProps.data.type === 'EARN' ? 'success' : 'danger'" class="text-sm">
                  {{ slotProps.data.type === 'EARN' ? '+' : '-' }}{{ slotProps.data.amount.toLocaleString() }} P
                </Tag>
                <small class="text-gray-400" v-if="slotProps.data.balanceAfter != null">
                  잔액: {{ slotProps.data.balanceAfter.toLocaleString() }} P
                </small>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </template>

    <!-- Footer -->
    <template #footer v-if="!isLoading && !isError && items.length > 0">
      <div class="flex justify-center mt-4">
        <Button icon="pi pi-download" label="내역 다운로드" text @click="downloadCSV" />
      </div>
    </template>
  </Card>
</template>
