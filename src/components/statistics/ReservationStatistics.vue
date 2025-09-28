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
          :reverseColor="true"
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
      </div>

      <!-- 주요 차트들 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 매출 추이 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">매출 추이</h3>
            <!-- ✅ 드롭다운 (매출 추이 전용) -->
            <select v-model="selectedRevenuePeriod" class="border rounded px-3 py-1 text-sm">
              <option value="daily">일별</option>
              <option value="weekly">주별</option>
              <option value="monthly">월별</option>
              <option value="yearly">연도별</option>
            </select>
          </div>
          <div class="flex-1 h-64">
            <Chart type="line" :data="revenueTrendData" :options="lineOptions" />
          </div>
        </div>

        <!-- 예약 건수 추이 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">예약 건수 추이</h3>
            <!-- ✅ 드롭다운 (예약 건수 차트 전용) -->
            <select v-model="selectedPeriod" class="border rounded px-3 py-1 text-sm">
              <option value="daily">일별</option>
              <option value="weekly">주별</option>
              <option value="monthly">월별</option>
              <option value="yearly">연도별</option>
            </select>
          </div>
          <div class="flex-1 h-64">
            <Chart type="line" :data="reservationTrendData" :options="lineOptions" />
          </div>
        </div>
      </div>

      <!-- 보조 차트들 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 객실 타입별 예약·매출 -->
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

      <!-- 결제 수단 + (추가 여유 공간) -->
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

        <!-- 빈 공간(추후 다른 차트 추가 가능) -->
        <div class="hidden lg:block"></div>
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
const reservationTrendData = ref<any>({ labels: [], datasets: [] });
const selectedPeriod = ref("daily"); // ✅ 기본값: 일별

// 🔹 매출 추이 차트 상태
const revenueTrendData = ref<any>({ labels: [], datasets: [] });
const selectedRevenuePeriod = ref("daily"); // ✅ 기본값: 일별

// 🔹 차트 데이터
const roomRevenueData = ref<any>({
  labels: [],
  datasets: []
});

// 🔹 차트 데이터
const cancelRefundData = ref<any>({
  labels: ["정상 예약", "취소", "환불"],
  datasets: [
    { data: [0, 0, 0], backgroundColor: ["#10b981", "#ef4444", "#f59e0b"] },
  ],
});

const paymentMethodData = ref<any>({
  labels: [],
  datasets: []
});

// 🔹 차트 옵션
const enhancedChartOptions = { responsive: true, maintainAspectRatio: false };
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        generateLabels: function (chart: any) {
          const data = chart.data;
          if (!data.datasets.length) return [];

          const dataset = data.datasets[0];
          const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);

          return data.labels.map((label: string, i: number) => {
            const value = dataset.data[i];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return {
              text: `${label} (${percentage}%)`,
              fillStyle: dataset.backgroundColor[i],
              hidden: !chart.getDataVisibility(i), // 클릭 상태 반영
              index: i
            };
          });
        }
      },
      // ✅ 기본 토글 기능 유지
      onClick: (e: any, legendItem: any, legend: any) => {
        const index = legendItem.index;
        const ci = legend.chart;
        ci.toggleDataVisibility(index);
        ci.update();
      }
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const dataset = context.dataset;
          const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
          const value = dataset.data[context.dataIndex];
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${context.label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

const pieOptions = { responsive: true, maintainAspectRatio: false };
const lineOptions = { responsive: true, maintainAspectRatio: false, tension: 0.3 };
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

// ✅ 취소·환불율 API 호출
async function fetchCancelBreakdown() {
  if (!dateRange.value || dateRange.value.length < 2) return;

  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  try {
    const { data } = await apiClient.get("/v1/statistics/reservation/cancel-rate/breakdown", {
      params: { startDate, endDate }
    });

    cancelRefundData.value = {
      labels: ["정상 예약", "취소", "환불"],
      datasets: [
        {
          data: [data.normalCount, data.cancelledCount, data.refundedCount],
          backgroundColor: ["#10b981", "#ef4444", "#f59e0b"]
        }
      ]
    };
  } catch (err) {
    console.error("📌 취소/환불 데이터 불러오기 실패:", err);
  }
}

// ✅ 예약 건수 추이 API 호출
async function fetchReservationTrend() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  try {
    const { data } = await apiClient.get("/v1/statistics/reservation/trend", {
      params: { startDate, endDate, period: selectedPeriod.value }
    });

    reservationTrendData.value = {
      labels: data.map((d: any) => d.label),
      datasets: [
        {
          label: "예약 건수",
          data: data.map((d: any) => d.count),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.3)",
          fill: true
        }
      ]
    };
  } catch (err) {
    console.error("📌 예약 건수 추이 데이터 불러오기 실패:", err);
  }
}

// ✅ 매출 추이 API
async function fetchRevenueTrend() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  try {
    const { data } = await apiClient.get("/v1/statistics/revenue/trend", {
      params: { startDate, endDate, period: selectedRevenuePeriod.value }
    });

    revenueTrendData.value = {
      labels: data.map((d: any) => d.label),
      datasets: [
        {
          label: "매출액",
          data: data.map((d: any) => d.revenue),
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.3)",
          fill: true
        }
      ]
    };
  } catch (err) {
    console.error("📌 매출 추이 데이터 불러오기 실패:", err);
  }
}

// ✅ 결제 수단 통계 API 호출
async function fetchPaymentMethodStats() {
  if (!dateRange.value || dateRange.value.length < 2) return;

  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  try {
    const { data } = await apiClient.get("/v1/statistics/payment/methods", {
      params: { startDate, endDate }
    });

    paymentMethodData.value = {
      labels: data.map((d: any) => {
        // 백엔드 enum → 한글 변환
        switch (d.method) {
          case "card": return "카드";
          case "bank_transfer": return "계좌이체";
          case "coupon": return "쿠폰";
          case "points": return "포인트";
          default: return d.method;
        }
      }),
      datasets: [
        {
          data: data.map((d: any) => d.totalAmount), // or d.count (건수 기준으로 보려면 바꿀 수 있음)
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
        }
      ]
    };
  } catch (err) {
    console.error("📌 결제 수단 통계 데이터 불러오기 실패:", err);
  }
}


onMounted(async () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  dateRange.value = [firstDay, lastDay];

  await fetchRoomRevenue();
  await fetchCancelBreakdown();
  await fetchRevenueTrend();
  await fetchPaymentMethodStats();

  try {
    // 오늘 예약 현황
    const { data: todayData } = await apiClient.get("/v1/statistics/reservation/today");
    todayReservations.value = todayData.todayReservations;
    todayGrowthRate.value = todayData.growthRate;

    // 이번 달 예약
    const { data: monthData } = await apiClient.get("/v1/statistics/reservation/monthly");
    monthlyReservations.value = monthData.thisMonthReservations;
    monthlyGrowthRate.value = monthData.growthRate;

    // 취소율 KPI 카드
    const { data: cancelData } = await apiClient.get("/v1/statistics/reservation/cancel-rate");
    cancelRate.value = parseFloat(cancelData.cancelRate.toFixed(2));
    cancelGrowthRate.value = parseFloat(cancelData.growthRate.toFixed(2));
  } catch (err) {
    console.error("📌 통계 데이터 불러오기 실패:", err);
  }
});


// 🔹 기간이 바뀌면 공통으로 갱신해야 하는 것들
watch(dateRange, () => {
  fetchRoomRevenue();
  fetchCancelBreakdown();
  fetchReservationTrend();
  fetchRevenueTrend();
  fetchPaymentMethodStats();
});

// 🔹 예약 건수 드롭다운 변경 시 예약 건수만 갱신
watch(selectedPeriod, () => {
  fetchReservationTrend();
});

// 🔹 매출 추이 드롭다운 변경 시 매출 추이만 갱신
watch(selectedRevenuePeriod, () => {
  fetchRevenueTrend();
});

function exportToCSV() {
  const rows: any[] = [];

  // ✅ KPI 카드 데이터
  rows.push(["오늘 예약 수", todayReservations.value]);
  rows.push(["오늘 예약 증감률 (%)", todayGrowthRate.value]);
  rows.push(["이번 달 예약 수", monthlyReservations.value]);
  rows.push(["이번 달 예약 증감률 (%)", monthlyGrowthRate.value]);
  rows.push(["예약 취소율 (%)", cancelRate.value]);
  rows.push(["예약 취소율 증감률 (%)", cancelGrowthRate.value]);
  rows.push([]);

  // ✅ 객실 타입별 매출
  rows.push(["객실 타입", "예약 건수", "매출액"]);
  roomRevenueData.value.labels.forEach((label: string, idx: number) => {
    rows.push([
      label,
      roomRevenueData.value.datasets[0].data[idx], // 예약 건수
      roomRevenueData.value.datasets[1].data[idx]  // 매출액
    ]);
  });
  rows.push([]);

  // ✅ 취소·환불율
  rows.push(["예약 상태", "건수"]);
  cancelRefundData.value.labels.forEach((label: string, idx: number) => {
    rows.push([
      label,
      cancelRefundData.value.datasets[0].data[idx]
    ]);
  });
  rows.push([]);

  // ✅ 결제 수단
  rows.push(["결제 수단", "금액"]);
  paymentMethodData.value.labels.forEach((label: string, idx: number) => {
    rows.push([
      label,
      paymentMethodData.value.datasets[0].data[idx]
    ]);
  });
  rows.push([]);

  // ✅ 예약 건수 추이
  rows.push(["예약 건수 추이", "건수"]);
  reservationTrendData.value.labels.forEach((label: string, idx: number) => {
    rows.push([
      label,
      reservationTrendData.value.datasets[0].data[idx]
    ]);
  });
  rows.push([]);

  // ✅ 매출 추이
  rows.push(["매출 추이", "매출액"]);
  revenueTrendData.value.labels.forEach((label: string, idx: number) => {
    rows.push([
      label,
      revenueTrendData.value.datasets[0].data[idx]
    ]);
  });

  // ✅ CSV 문자열 생성
  const csvContent = rows.map(e => e.join(",")).join("\n");

  // ✅ Blob 생성 후 다운로드
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "statistics.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

defineExpose({ exportToCSV });
</script>



