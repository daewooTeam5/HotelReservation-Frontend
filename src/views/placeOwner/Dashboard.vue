<template>
  <div class="flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">대시보드</h1>
        <p class="text-gray-600 mt-1">숙소 운영 현황을 한눈에 확인하세요</p>
      </div>
      <div class="mt-4 md:mt-0 flex items-center space-x-3">
        <div class="text-sm text-gray-500">
          {{ lastUpdated ? `마지막 업데이트: ${timeAgo}` : "업데이트 기록 없음" }}
        </div>
        <Button
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="refreshData"
          :loading="isRefreshing"
        />
      </div>
    </div>

    <!-- 핵심 지표 카드 (4개) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <!-- 오늘 예약 현황 -->
      <Card
        class="group border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">
                오늘 예약
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-3">
                {{ stats.todayReservations }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                체크인 {{ stats.todayCheckIn }}건 • 체크아웃
                {{ stats.todayCheckOut }}건
              </p>
              <div
                class="mt-4 flex items-center text-sm"
                :class="{
                  'text-green-600': stats.growthRate > 0,
                  'text-red-600': stats.growthRate < 0,
                  'text-gray-500': stats.growthRate === 0,
                }"
              >
                <i
                  class="pi text-xs mr-1"
                  :class="{
                    'pi-arrow-up': stats.growthRate > 0,
                    'pi-arrow-down': stats.growthRate < 0,
                    'pi-minus': stats.growthRate === 0,
                  }"
                ></i>
                <span class="font-medium">{{ stats.growthRate.toFixed(1) }}%</span>
                <span class="ml-1 text-gray-500">vs 어제</span>
              </div>
            </div>
            <div
              class="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-blue-600 transition-colors duration-300"
            >
              <i class="pi pi-calendar-plus text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 이번 달 매출 -->
      <Card
        class="group border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-green-600 uppercase tracking-wide">
                이번 달 매출
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-3">
                {{ formatCurrency(revenueStats.thisMonthRevenue) }}
              </p>
              <div
                class="mt-4 flex items-center text-sm"
                :class="{
                  'text-green-600': revenueStats.growthRate > 0,
                  'text-red-600': revenueStats.growthRate < 0,
                  'text-gray-500': revenueStats.growthRate === 0,
                }"
              >
                <i
                  class="pi text-xs mr-1"
                  :class="{
                    'pi-arrow-up': revenueStats.growthRate > 0,
                    'pi-arrow-down': revenueStats.growthRate < 0,
                    'pi-minus': revenueStats.growthRate === 0,
                  }"
                ></i>
                <span class="font-medium">
                  {{ revenueStats.growthRate.toFixed(1) }}%
                </span>
                <span class="ml-1 text-gray-500">vs 지난달</span>
              </div>
            </div>
            <div
              class="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-green-600 transition-colors duration-300"
            >
              <i class="pi pi-chart-line text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 객실 점유율 -->
      <Card
        class="group border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-purple-600 uppercase tracking-wide">
                객실 점유율
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-3">
                {{ occupancy.rate.toFixed(0) }}%
              </p>
              <p class="text-xs text-gray-500 mt-2">
                {{ occupancy.usedRooms }}/{{ occupancy.totalRooms }} 객실 사용 중
              </p>
            </div>
            <div
              class="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-purple-600 transition-colors duration-300"
            >
              <i class="pi pi-home text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 평균 평점 -->
      <Card
        class="group border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-yellow-600 uppercase tracking-wide">
                평균 평점
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-3">
                {{ ratingStats.avgRating.toFixed(1) }}
              </p>
              <div class="flex items-center mt-2 space-x-1">
                <i
                  v-for="i in 5"
                  :key="i"
                  class="pi"
                  :class="i <= Math.round(ratingStats.avgRating)
                    ? 'pi-star-fill text-yellow-400 text-sm'
                    : 'pi-star text-gray-300 text-sm'"
                ></i>
                <span class="text-xs text-gray-500 ml-2">
                  ({{ ratingStats.reviewCount }}개 리뷰)
                </span>
              </div>
            </div>
            <div
              class="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-yellow-600 transition-colors duration-300"
            >
              <i class="pi pi-star text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 차트 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-chart-bar text-blue-600 text-lg"></i>
            <span style="margin-left: 5px;" class="text-xl font-semibold text-gray-900">월별 매출 추이</span>
          </div>
        </template>
        <template #content>
          <Chart type="bar" :data="salesData" :options="chartOptions" class="h-80" />
        </template>
      </Card>
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-chart-line text-green-600 text-lg"></i>
            <span style="margin-left: 5px;" class="text-xl font-semibold text-gray-900">예약 현황</span>
          </div>
        </template>
        <template #content>
          <Chart type="line" :data="reservationData" :options="chartOptions" class="h-80" />
        </template>
      </Card>
    </div>

    <!-- 최근 예약 + 최근 리뷰 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- 최근 예약 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center justify-between p-2">
            <div class="flex items-center space-x-3">
              <i class="pi pi-calendar text-blue-600 text-lg"></i>
              <span style="margin-left: 5px;" class="text-xl font-semibold text-gray-900">최근 예약</span>
            </div>
            <router-link
              to="/owner/reservations"
              class="p-button p-button-text p-button-sm text-blue-600"
            >
              전체 보기
            </router-link>
          </div>
        </template>
        <template #content>
          <div class="space-y-3 px-2">
            <div
              v-for="r in recentReservations"
              :key="r.reservationId"
              class="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl hover:bg-gray-100/70 transition"
            >
              <div class="flex items-center space-x-4">
                <div>
                  <p class="font-semibold text-gray-900">{{ r.guestName || "이름 없음" }}</p>
                  <p class="text-sm text-gray-600">
                    {{ r.roomType || "객실 정보 없음" }} •
                    {{ formatDate(r.resevStart) }} - {{ formatDate(r.resevEnd) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(r.status)"
                >
                  {{ translateStatus(r.status) }}
                </span>
                <p class="text-sm font-medium text-gray-900 mt-1">
                  {{ formatCurrency(r.finalAmount) }}
                </p>
              </div>
            </div>
            <div
              v-if="recentReservations.length === 0"
              class="text-center py-6 text-sm text-gray-500"
            >
              최근 예약이 없습니다.
            </div>
          </div>
        </template>
      </Card>

      <!-- 최근 리뷰 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center justify-between p-2">
            <div class="flex items-center space-x-3">
              <i class="pi pi-star text-yellow-600 text-lg"></i>
              <span style="margin-left: 5px;" class="text-xl font-semibold text-gray-900">최근 리뷰</span>
            </div>
            <router-link
              to="/owner/reviews"
              class="p-button p-button-text p-button-sm text-yellow-600"
            >
              전체 보기
            </router-link>
          </div>
        </template>
        <template #content>
          <div class="space-y-4 px-2">
            <div
              v-for="review in recentReviews"
              :key="review.reviewId"
              class="p-5 rounded-xl border"
              :class="review.rating >= 4
          ? 'bg-yellow-50/70 border-yellow-100'
          : 'bg-gray-50/70 border-gray-200'"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-gray-900">{{ review.userName }}</span>
                  <div class="flex space-x-1">
                    <i
                      v-for="i in 5"
                      :key="i"
                      class="pi"
                      :class="i <= review.rating
                  ? 'pi-star-fill text-yellow-400 text-sm'
                  : 'pi-star text-gray-300 text-sm'"
                    ></i>
                  </div>
                </div>
                <span class="text-xs text-gray-500 font-medium">
            {{ formatDate(review.createdAt) }}
          </span>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">
                "{{ review.comment }}"
              </p>
            </div>

            <div
              v-if="recentReviews.length === 0"
              class="text-center py-6 text-sm text-gray-500"
            >
              최근 리뷰가 없습니다.
            </div>
          </div>
        </template>
      </Card>

    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import Button from "primevue/button";
import { apiClient } from "@/utils/axiosClient";
import { formatCurrency, translateStatus } from "@/utils/placeOwner/formatters.js";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore.ts";

// 📌 마지막 업데이트 관련
const lastUpdated = ref<number | null>(null);
const timeAgo = ref("");
let timerId: number | null = null;

const updateTimeAgo = () => {
  if (!lastUpdated.value) return;
  const diff = Math.floor((Date.now() - lastUpdated.value) / 1000);

  if (diff < 5) timeAgo.value = "방금";
  else if (diff < 60) timeAgo.value = `${diff}초 전`;
  else if (diff < 3600) timeAgo.value = `${Math.floor(diff / 60)}분 전`;
  else timeAgo.value = `${Math.floor(diff / 3600)}시간 전`;
};

// 📌 새로고침 버튼
const isRefreshing = ref(false);
const refreshData = async () => {
  isRefreshing.value = true;
  await fetchTodayStats();
  await fetchRecentReservations();
  await fetchMonthlyStats();
  await fetchOccupancyRate();
  await fetchRatingStats();
  await fetchRevenueStats();
  await fetchSalesData();
  await fetchRecentReviews();   // ✅ 최근 리뷰 추가
  lastUpdated.value = Date.now();
  updateTimeAgo();
  isRefreshing.value = false;
};

// 📌 객실 점유율
const occupancy = ref({ usedRooms: 0, totalRooms: 0, rate: 0 });
const fetchOccupancyRate = async () => {
  try {
    const res = await apiClient.get("/v1/dashboard/stats/occupancy");
    occupancy.value = res.data;
  } catch (err) {
    console.error("객실 점유율 불러오기 실패:", err);
  }
};

// 📌 최근 예약
const recentReservations = ref<any[]>([]);
const fetchRecentReservations = async () => {
  try {
    const res = await apiClient.post(
      `/v1/reservations/search?page=0&size=3&sort=createdAt,desc`,
      {}
    );
    recentReservations.value = res.data.content;
  } catch (err) {
    console.error("최근 예약 불러오기 실패:", err);
  }
};

const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    checked_in: "bg-blue-100 text-blue-800",
    checked_out: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

// 📌 차트 데이터
const salesData = ref({
  labels: [],
  datasets: [
    {
      label: "매출액 (원)",
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderColor: "#3b82f6",
      data: [],
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
});

// 📌 월별 매출 추이 API
const fetchSalesData = async (months = 6) => {
  try {
    const res = await apiClient.get(`/v1/dashboard/stats/revenue/monthly?months=${months}`);
    salesData.value.labels = res.data.map((item: any) => item.month);
    salesData.value.datasets[0].data = res.data.map((item: any) => item.revenue);
  } catch (err) {
    console.error("월별 매출 추이 불러오기 실패:", err);
  }
};

const reservationData = ref({
  labels: [],
  datasets: [
    {
      label: "예약 건수",
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      tension: 0.4,
      data: [],
      pointBackgroundColor: "#10b981",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 3,
      pointRadius: 6,
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#374151",
        font: { size: 12, weight: "500" },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#6b7280", font: { size: 11 } },
      grid: { color: "rgba(229, 231, 235, 0.5)", drawBorder: false },
    },
    y: {
      ticks: { color: "#6b7280", font: { size: 11 } },
      grid: { color: "rgba(229, 231, 235, 0.5)", drawBorder: false },
    },
  },
});

// 📌 오늘 예약 통계
const stats = ref({
  todayReservations: 0,
  todayCheckIn: 0,
  todayCheckOut: 0,
  growthRate: 0,
});
const fetchTodayStats = async () => {
  try {
    const refreshClient = axios.create({
      baseURL: apiClient.defaults.baseURL,
      withCredentials: true,
    });
    const res1 = await refreshClient.post("/v1/auth/token");
    const newAccessToken = res1.data.data.accessToken;
    const { setAccessToken } = useAuthStore();
    setAccessToken(newAccessToken);

    const res = await apiClient.get("/v1/dashboard/stats/today");
    stats.value = res.data;
  } catch (err) {
    console.error("오늘 예약 통계 불러오기 실패:", err);
  }
};

// 📌 월별 예약 현황
const fetchMonthlyStats = async () => {
  try {
    const res = await apiClient.get("/v1/dashboard/stats/monthly");
    reservationData.value.labels = res.data.map((item: any) => item.month);
    reservationData.value.datasets[0].data = res.data.map((item: any) => item.count);
  } catch (err) {
    console.error("예약 현황 차트 불러오기 실패:", err);
  }
};

const ratingStats = ref({
  avgRating: 0,
  reviewCount: 0,
});
const fetchRatingStats = async () => {
  try {
    const res = await apiClient.get("/v1/dashboard/stats/rating");
    ratingStats.value = res.data;
  } catch (err) {
    console.error("평균 평점 불러오기 실패:", err);
  }
};

// 📌 이번 달 매출
const revenueStats = ref({
  thisMonthRevenue: 0,
  lastMonthRevenue: 0,
  growthRate: 0,
});
const fetchRevenueStats = async () => {
  try {
    const res = await apiClient.get("/v1/dashboard/stats/revenue");
    revenueStats.value = {
      thisMonthRevenue: res.data.currentRevenue,
      lastMonthRevenue: res.data.lastRevenue,
      growthRate: res.data.growthRate,
    };
  } catch (err) {
    console.error("이번 달 매출 불러오기 실패:", err);
  }
};

// 📌 최근 리뷰
const recentReviews = ref<any[]>([]);

const fetchRecentReviews = async () => {
  try {
    const res = await apiClient.get("/v1/dashboard/stats/reviews");
    recentReviews.value = res.data;
  } catch (err) {
    console.error("최근 리뷰 불러오기 실패:", err);
  }
};


// Mounted
onMounted(() => {
  refreshData(); // 처음 로드시 전체 갱신
  timerId = window.setInterval(updateTimeAgo, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>
