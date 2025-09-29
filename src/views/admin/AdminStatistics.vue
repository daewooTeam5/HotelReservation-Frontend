<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p class="text-gray-600 mt-1">숙소 예약/매출 현황을 확인하세요</p>
      </div>
    </div>

    <PrimeTabs v-model:value="activeTab">
      <PrimeTabList>
        <PrimeTab value="revenue">매출/예약</PrimeTab>
        <PrimeTab value="customer">고객</PrimeTab>
      </PrimeTabList>

      <PrimeTabPanels class="mt-2">
        <PrimeTabPanel value="revenue">
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              <AdminKpiCard title="이번 달 예약" :value="summary.reservationCount" icon="pi-calendar-plus" color="blue"/>
              <AdminKpiCard title="이번 달 매출" :value="formatCurrency(summary.revenue)" icon="pi-wallet" color="green"/>
              <AdminKpiCard title="취소율" :value="summary.cancelRate.toFixed(1) + '%'" icon="pi-times-circle" color="red"/>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white p-4 rounded-xl shadow-lg">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <h3 class="text-lg font-semibold text-gray-800">{{ titles.reservations }}</h3>
                  <PrimeSelect v-model="periods.reservations" :options="periodOptions" optionLabel="label" optionValue="value" class="w-full md:w-32"/>
                </div>
                <div v-if="periods.reservations === 'daily'" class="flex items-center gap-2 mb-4">
                  <PrimeDatePicker v-model="dates.reservations[0]" placeholder="시작일" dateFormat="yy-mm-dd" class="w-full"/>
                  <PrimeDatePicker v-model="dates.reservations[1]" placeholder="종료일" dateFormat="yy-mm-dd" class="w-full"/>
                </div>
                <AdminStatisticsChart :endpoint="endpoints.reservations" label="예약 건수"/>
              </div>

              <div class="bg-white p-4 rounded-xl shadow-lg">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <h3 class="text-lg font-semibold text-gray-800">{{ titles.revenue }}</h3>
                  <PrimeSelect v-model="periods.revenue" :options="periodOptions" optionLabel="label" optionValue="value" class="w-full md:w-32"/>
                </div>
                <div v-if="periods.revenue === 'daily'" class="flex items-center gap-2 mb-4">
                  <PrimeDatePicker v-model="dates.revenue[0]" placeholder="시작일" dateFormat="yy-mm-dd" class="w-full"/>
                  <PrimeDatePicker v-model="dates.revenue[1]" placeholder="종료일" dateFormat="yy-mm-dd" class="w-full"/>
                </div>
                <AdminStatisticsChart :endpoint="endpoints.revenue" label="매출액"/>
              </div>

              <div class="bg-white p-4 rounded-xl shadow-lg">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <h3 class="text-lg font-semibold text-gray-800">{{ titles.cancelRate }}</h3>
                  <PrimeSelect v-model="periods.cancelRate" :options="periodOptions" optionLabel="label" optionValue="value" class="w-full md:w-32"/>
                </div>
                <div v-if="periods.cancelRate === 'daily'" class="flex items-center gap-2 mb-4">
                  <PrimeDatePicker v-model="dates.cancelRate[0]" placeholder="시작일" dateFormat="yy-mm-dd" class="w-full"/>
                  <PrimeDatePicker v-model="dates.cancelRate[1]" placeholder="종료일" dateFormat="yy-mm-dd" class="w-full"/>
                </div>
                <AdminStatisticsChart :endpoint="endpoints.cancelRate" label="취소율"/>
              </div>

              <AdminStatisticsChart title="카테고리별 매출" endpoint="admin/statistics/revenue-by-category" label="매출액" type="bar"/>

              <AdminStatisticsChart title="카테고리별 예약 건수" endpoint="admin/statistics/reservations-by-category" label="예약 건수" type="bar"/>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="customer">
          <AdminCustomerStatistics />
        </PrimeTabPanel>
      </PrimeTabPanels>
    </PrimeTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import dayjs from "dayjs"
import { apiClient } from "@/utils/axiosClient"
import { formatCurrency } from "@/utils/placeOwner/formatters"

// PrimeVue 컴포넌트
import PrimeTabs from "primevue/tabs";
import PrimeTabList from "primevue/tablist";
import PrimeTab from "primevue/tab";
import PrimeTabPanels from "primevue/tabpanels";
import PrimeTabPanel from "primevue/tabpanel";
import PrimeSelect from "primevue/select"; // 드롭다운 컴포넌트 임포트

// 커스텀 컴포넌트
import AdminKpiCard from "@/components/statistics/AdminKpiCard.vue"
import AdminStatisticsChart from "@/components/statistics/AdminStatisticsChart.vue"
import AdminCustomerStatistics from "@/components/statistics/AdminCustomerStatistics.vue"

// 탭 상태 관리
const activeTab = ref('revenue');

// --- 요약 데이터 로직 ---
const summary = ref<any>({ reservationCount: 0, revenue: 0, cancelRate: 0 })

const fetchSummary = async () => {
  try {
    const res = await apiClient.get("admin/statistics/summary")
    summary.value = res.data
  } catch (err) {
    console.error("요약 데이터 불러오기 실패:", err)
  }
}

onMounted(fetchSummary)

// --- 차트 기간 선택 로직 ---
type Period = 'daily' | 'monthly' | 'yearly'

// 드롭다운 옵션
const periodOptions = ref([
  { label: '일별', value: 'daily' },
  { label: '월별', value: 'monthly' },
  { label: '연간', value: 'yearly' }
]);

// 각 차트의 기간 선택 상태
const periods = ref({
  reservations: 'monthly' as Period,
  revenue: 'monthly' as Period,
  cancelRate: 'monthly' as Period,
})

// 날짜 포맷 함수
const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD');

// 각 차트의 날짜 범위 상태 (기본값: 최근 30일)
const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
const today = new Date();
const dates = ref({
  reservations: [thirtyDaysAgo, today],
  revenue: [thirtyDaysAgo, today],
  cancelRate: [thirtyDaysAgo, today],
})

// 선택된 기간에 따라 동적으로 API Endpoint를 생성
const endpoints = computed(() => {
  const createEndpoint = (type: 'reservations' | 'revenue' | 'cancel-rate', period: Period, dateRange: Date[]) => {
    // ✅ [FIX] API 경로 맨 앞 '/' 제거
    const basePath = `admin/statistics/${type}/${period}`;
    if (period === 'daily' && dateRange[0] && dateRange[1]) {
      const start = formatDate(dateRange[0]);
      const end = formatDate(dateRange[1]);
      return `${basePath}?start=${start}&end=${end}`;
    }
    return basePath;
  }

  return {
    reservations: createEndpoint('reservations', periods.value.reservations, dates.value.reservations),
    revenue: createEndpoint('revenue', periods.value.revenue, dates.value.revenue),
    cancelRate: createEndpoint('cancel-rate', periods.value.cancelRate, dates.value.cancelRate),
  }
})

// 선택된 기간에 따라 동적으로 차트 제목을 생성
const titles = computed(() => {
  const periodMap: Record<Period, string> = {
    daily: '일별',
    monthly: '월별',
    yearly: '연간'
  }

  return {
    reservations: `${periodMap[periods.value.reservations]} 예약 추이`,
    revenue: `${periodMap[periods.value.revenue]} 매출 추이`,
    cancelRate: `${periodMap[periods.value.cancelRate]} 취소율 추이`
  }
})
</script>
