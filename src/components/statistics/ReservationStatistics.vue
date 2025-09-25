<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 콘텐츠 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex flex-col gap-6">
      <!-- KPI 카드들 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="오늘 예약 수"
          :value="todayReservations"
          icon="pi-calendar"
          :change="todayGrowthRate"
          subtitle="전일 대비"
          color="blue"
        />
        <KpiCard
          title="이번 달 예약 수"
          :value="monthlyReservations"
          icon="pi-chart-line"
          :change="monthlyGrowthRate"
          subtitle="전월 대비"
          color="green"
        />
        <KpiCard
          title="예약 취소율"
          :value="cancelRate + '%'"
          icon="pi-times-circle"
          :change="cancelGrowthRate"
          subtitle="전월 대비"
          color="red"
        />
      </div>

      <!-- 필터 바 (캘린더만) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap items-center gap-4"
      >
        <div class="flex items-center space-x-2 text-gray-700">
          <i class="pi pi-filter text-gray-400"></i>
          <span class="text-sm font-medium">기간 선택</span>
        </div>
        <Calendar
          v-model="dateRange"
          selectionMode="range"
          showIcon
          placeholder="기간 선택"
          class="min-w-[14rem]"
        />
        <!-- ✅ 초기화 버튼 -->
        <button
          @click="resetDateRange"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-refresh mr-2"></i>
          초기화
        </button>
        <button
          class="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-download mr-2"></i>
          내보내기
        </button>
      </div>

      <!-- 주요 차트들 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 객실 타입별 매출 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">객실 타입별 예약·매출</h3>
              <p class="text-sm text-gray-500">기간별 기여도 분석</p>
            </div>
          </div>
          <div class="flex-1 h-72">
            <Chart type="bar" :data="roomRevenueData" :options="enhancedChartOptions" />
          </div>
        </div>

        <!-- 취소·환불율 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">예약 상태 분석</h3>
              <p class="text-sm text-gray-500">취소율 및 환불율</p>
            </div>
          </div>
          <div class="flex-1 h-72">
            <Chart type="doughnut" :data="cancelRefundData" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- 보조 차트들 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 결제 수단 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">결제 수단</h3>
          </div>
          <div class="flex-1 h-64">
            <Chart type="pie" :data="paymentMethodData" :options="pieOptions" />
          </div>
        </div>

        <!-- 체크인·체크아웃 추이 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">체크인·아웃 추이</h3>
          </div>
          <div class="flex-1 h-64">
            <Chart type="bar" :data="checkinCheckoutData" :options="barOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { apiClient } from "@/utils/axiosClient";
import Calendar from "primevue/calendar";
import Chart from "primevue/chart";
import KpiCard from "./KpiCard.vue";

// 📌 기간 초기화
function resetDateRange() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  dateRange.value = [firstDay, lastDay];
}

// 🔹 필터 상태
const dateRange = ref<[Date, Date] | null>(null);

// 🔹 KPI 데이터
const todayReservations = ref(0);
const todayGrowthRate = ref(0);
const monthlyReservations = ref(0);
const monthlyGrowthRate = ref(0);
const cancelRate = ref(0);
const cancelGrowthRate = ref(0);

// 🔹 차트 데이터
const roomRevenueData = ref<any>({
  labels: [],
  datasets: []
});

const cancelRefundData = ref({
  labels: ["정상 예약", "취소", "환불"],
  datasets: [
    { data: [300, 20, 10], backgroundColor: ["#10b981", "#ef4444", "#f59e0b"] },
  ],
});

const paymentMethodData = ref({
  labels: ["카드", "계좌이체", "쿠폰", "현금"],
  datasets: [
    { data: [200, 100, 50, 20], backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"] },
  ],
});

const checkinCheckoutData = ref({
  labels: ["월", "화", "수", "목", "금", "토", "일"],
  datasets: [
    { label: "체크인", data: [10, 20, 15, 25, 30, 40, 35], backgroundColor: "#3b82f6" },
    { label: "체크아웃", data: [12, 18, 20, 22, 28, 38, 33], backgroundColor: "#10b981" },
  ],
});

// 🔹 차트 옵션
const enhancedChartOptions = { responsive: true, maintainAspectRatio: false };
const doughnutOptions = { responsive: true, maintainAspectRatio: false };
const pieOptions = { responsive: true, maintainAspectRatio: false };
const barOptions = { responsive: true, maintainAspectRatio: false };

// ✅ 객실 타입별 예약·매출 API 호출
async function fetchRoomRevenue() {
  if (!dateRange.value || dateRange.value.length < 2) return;

  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  try {
    const res = await apiClient.get("/v1/statistics/reservation/room-revenue", {
      params: { startDate, endDate }
    });

    const data = res.data;

    roomRevenueData.value = {
      labels: data.map((d: any) => d.roomType),
      datasets: [
        {
          label: "예약 건수",
          data: data.map((d: any) => d.reservationCount),
          backgroundColor: "rgba(59,130,246,0.8)"
        },
        {
          label: "매출액",
          data: data.map((d: any) => d.totalRevenue),
          backgroundColor: "rgba(16,185,129,0.8)"
        }
      ]
    };
  } catch (err) {
    console.error("📌 객실 타입별 매출 데이터 불러오기 실패:", err);
  }
}

// ✅ 백엔드 API 호출 (KPI + 예약·매출)
onMounted(async () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  dateRange.value = [firstDay, lastDay];
  await fetchRoomRevenue();

  try {
    // 오늘 예약 현황
    const { data: todayData } = await apiClient.get("/v1/statistics/reservation/today");
    todayReservations.value = todayData.todayReservations;
    todayGrowthRate.value = todayData.growthRate;

    // 이번 달 예약
    const { data: monthData } = await apiClient.get("/v1/statistics/reservation/monthly");
    monthlyReservations.value = monthData.thisMonthReservations;
    monthlyGrowthRate.value = monthData.growthRate;

    // 취소율
    const { data: cancelData } = await apiClient.get("/v1/statistics/reservation/cancel-rate");
    cancelRate.value = parseFloat(cancelData.cancelRate.toFixed(2));
    cancelGrowthRate.value = parseFloat(cancelData.growthRate.toFixed(2));
  } catch (err) {
    console.error("📌 통계 데이터 불러오기 실패:", err);
  }
});

// 🔹 기간이 변경될 때마다 자동으로 객실 매출 차트 새로고침
watch(dateRange, () => {
  fetchRoomRevenue();
});
</script>



