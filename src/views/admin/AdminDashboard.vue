<template>
  <div class="flex flex-col gap-6">
    <!-- 헤더 -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">대시보드</h1>
        <p class="text-gray-600 mt-1">숙소 운영 현황을 한눈에 확인하세요</p>
      </div>
    </div>

    <!-- 핵심 지표 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <!-- 오늘 예약 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-blue-600">오늘 예약</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ summary.todayReservations.value }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                어제 대비 {{ summary.todayReservations.diff }}건
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-calendar-plus text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 총 유저 수 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-purple-600">총 유저 수</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ summary.totalUsers.value }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                어제 대비 {{ summary.totalUsers.diff }}명
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-users text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 이번 달 매출 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-green-600">이번 달 매출</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatCurrency(summary.monthlyRevenue.value) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                지난달 대비 {{ formatCurrency(summary.monthlyRevenue.diff) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-chart-line text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 총 매출 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-yellow-600">총 매출</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatCurrency(summary.totalRevenue.value) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-wallet text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 차트 영역 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      <!-- 월별 매출 추이 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-chart-bar text-blue-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900" style="margin-left: 5px;">월별 매출 추이</span>
          </div>
        </template>
        <template #content>
          <Chart type="line" :data="monthlyRevenueChart" :options="chartOptions" class="h-80" />
        </template>
      </Card>

      <!-- 지역별 점유율 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-chart-pie text-purple-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900" style="margin-left: 5px;">지역별 점유율</span>
          </div>
        </template>
        <template #content>
          <Chart type="pie" :data="occupancyChart" :options="chartOptions" class="h-80" />
        </template>
      </Card>
    </div>

    <!-- 호텔 TOP5 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- 매출 TOP5 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-building text-green-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900" style="margin-left: 5px;">호텔 매출 TOP 5</span>
          </div>
        </template>
        <template #content>
          <Chart type="bar" :data="topRevenueChart" :options="chartOptions" class="h-80" />
        </template>
      </Card>

      <!-- 예약 TOP5 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-ticket text-orange-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900" style="margin-left: 5px;">호텔 예약 TOP 5</span>
          </div>
        </template>
        <template #content>
          <Chart type="bar" :data="topReservationChart" :options="chartOptions" class="h-80" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import { apiClient } from "@/utils/axiosClient";
import { formatCurrency } from "@/utils/placeOwner/formatters.js";

const summary = ref<any>({
  todayReservations: { value: 0, diff: 0 },
  totalUsers: { value: 0, diff: 0 },
  monthlyRevenue: { value: 0, diff: 0 },
  totalRevenue: { value: 0, diff: 0 }
});
const monthlyRevenueChart = ref({});
const occupancyChart = ref({});
const topRevenueChart = ref({});
const topReservationChart = ref({});

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: "bottom" } }
};

const fetchDashboard = async () => {
  try {
    const res = await apiClient.get("/v1/payment/dashboard");
    const data = res.data.data;

    summary.value = data.summary;

    // 월별 매출
    monthlyRevenueChart.value = {
      labels: data.monthlyRevenue.map((r: any) => `${r.year}-${r.month}`),
      datasets: [
        {
          label: "매출액",
          data: data.monthlyRevenue.map((r: any) => r.amount),
          borderColor: "#3b82f6",
          fill: false
        }
      ]
    };

    // 지역별 점유율
    occupancyChart.value = {
      labels: data.occupancyRates.map((o: any) => o.placeName),
      datasets: [
        {
          data: data.occupancyRates.map((o: any) => o.occupancyRate),
          backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726", "#AB47BC", "#EC407A"]
        }
      ]
    };

    // 호텔 매출 TOP5
    topRevenueChart.value = {
      labels: data.topRevenueHotels.map((h: any) => h.hotelName),
      datasets: [
        {
          label: "매출액",
          data: data.topRevenueHotels.map((h: any) => h.value),
          backgroundColor: "#4CAF50"
        }
      ]
    };

    // 호텔 예약 TOP5
    topReservationChart.value = {
      labels: data.topReservationHotels.map((h: any) => h.hotelName),
      datasets: [
        {
          label: "예약 건수",
          data: data.topReservationHotels.map((h: any) => h.value),
          backgroundColor: "#FF9800"
        }
      ]
    };
  } catch (err) {
    console.error("대시보드 불러오기 실패:", err);
  }
};

onMounted(fetchDashboard);
</script>
