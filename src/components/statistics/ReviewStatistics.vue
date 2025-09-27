<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex flex-col gap-6">
      <!-- KPI 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="평균 평점"
          :value="avgRating.toFixed(1)"
          icon="pi-star"
          subtitle="전체 리뷰 기준"
          color="yellow"
        />
        <KpiCard
          title="총 리뷰 수"
          :value="totalReviews"
          icon="pi-comments"
          subtitle="누적 리뷰 수"
          color="blue"
        />
        <KpiCard
          title="리뷰 작성률"
          :value="reviewRate.toFixed(1) + '%'"
          icon="pi-chart-pie"
          subtitle="예약 건수 대비"
          color="green"
        />
      </div>

      <!-- 필터 바 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap items-center gap-4">
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
        <button
          @click="resetDateRange"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-refresh mr-2"></i>
          초기화
        </button>

        <!-- 내보내기 버튼 -->
        <button
          @click="exportToCSV"
          class="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-download mr-2"></i>
          내보내기
        </button>
      </div>

      <!-- 차트 영역 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 평점 분포 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 class="text-lg font-bold text-gray-900 mb-4">평점 분포</h3>
          <div class="flex-1 h-72">
            <Chart type="bar" :data="ratingDistributionData" :options="barOptions" />
          </div>
        </div>

        <!-- 리뷰 수 추이 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">리뷰 수 추이</h3>
            <!-- 주기 선택 드롭다운 -->
            <Dropdown
              v-model="selectedPeriod"
              :options="periods"
              optionLabel="label"
              optionValue="value"
              class="w-32"
            />
          </div>
          <div class="flex-1 h-72">
            <Chart type="line" :data="reviewTrendData" :options="lineOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Chart from "primevue/chart";
import KpiCard from "./KpiCard.vue";
import { apiClient } from "@/utils/axiosClient.ts";

// 날짜 선택
const dateRange = ref<[Date, Date] | null>(null);

// KPI 데이터
const avgRating = ref(0);
const totalReviews = ref(0);
const reviewRate = ref(0);

// 평점 분포
const ratingDistributionData = ref<any>({
  labels: ["1점", "2점", "3점", "4점", "5점"],
  datasets: [{ label: "리뷰 수", data: [0, 0, 0, 0, 0], backgroundColor: "rgba(59,130,246,0.8)" }],
});

// 리뷰 추이
const reviewTrendData = ref<any>({
  labels: [],
  datasets: [
    {
      label: "리뷰 수",
      data: [],
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.3)",
      fill: true,
    },
  ],
});

// 드롭다운 옵션
const periods = [
  { label: "일별", value: "daily" },
  { label: "주별", value: "weekly" },
  { label: "월별", value: "monthly" },
  { label: "연도별", value: "yearly" },
];
const selectedPeriod = ref("daily");

// 공통 차트 옵션
const barOptions = { responsive: true, maintainAspectRatio: false };
const lineOptions = { responsive: true, maintainAspectRatio: false };

// 기본값 이번 달
function setThisMonthRange() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  dateRange.value = [firstDay, lastDay];
}
function resetDateRange() {
  setThisMonthRange();
}

// 📌 API 연동
async function fetchReviewStats() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const { data } = await apiClient.get("/v1/statistics/reviews/summary", {
    params: { startDate, endDate },
  });
  avgRating.value = data.avgRating;
  totalReviews.value = data.totalReviews;
  reviewRate.value = data.reviewRate;
}

async function fetchRatingDistribution() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const { data } = await apiClient.get("/v1/statistics/reviews/distribution", {
    params: { startDate, endDate },
  });
  ratingDistributionData.value.datasets[0].data = [data["1"], data["2"], data["3"], data["4"], data["5"]];
}

async function fetchReviewTrend() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const { data } = await apiClient.get("/v1/statistics/reviews/trend", {
    params: { startDate, endDate, period: selectedPeriod.value },
  });
  reviewTrendData.value.labels = data.map((d: any) => d.label);
  reviewTrendData.value.datasets[0].data = data.map((d: any) => d.count);
}

// 내보내기 CSV
function exportToCSV() {
  const rows: any[] = [];
  rows.push(["평균 평점", avgRating.value.toFixed(1)]);
  rows.push(["총 리뷰 수", totalReviews.value]);
  rows.push(["리뷰 작성률", reviewRate.value.toFixed(1) + "%"]);
  rows.push([]);
  rows.push(["평점", "리뷰 수"]);
  ratingDistributionData.value.labels.forEach((label: string, idx: number) => {
    rows.push([label, ratingDistributionData.value.datasets[0].data[idx]]);
  });
  rows.push([]);
  rows.push(["기간", "리뷰 수"]);
  reviewTrendData.value.labels.forEach((label: string, idx: number) => {
    rows.push([label, reviewTrendData.value.datasets[0].data[idx]]);
  });

  const csvContent = rows.map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "review_statistics.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 반응형 데이터 로드
watch([dateRange, selectedPeriod], async () => {
  await fetchReviewStats();
  await fetchRatingDistribution();
  await fetchReviewTrend();
});

// 초기 로딩
onMounted(async () => {
  setThisMonthRange();
  await fetchReviewStats();
  await fetchRatingDistribution();
  await fetchReviewTrend();
});
</script>
