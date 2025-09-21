<template>
  <div class="flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">대시보드</h1>
        <p class="text-gray-600 mt-1">호텔 운영 현황을 한눈에 확인하세요</p>
      </div>
      <div class="mt-4 md:mt-0 flex items-center space-x-3">
        <div class="text-sm text-gray-500">
          마지막 업데이트: 2025-01-15 14:30
        </div>
        <Button
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="refreshData"
          :loading="isRefreshing"
        />
      </div>
    </div>

    <!-- 핵심 지표 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <!-- 오늘 예약 현황 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">오늘 예약</p>
              <p class="text-3xl font-bold text-gray-900 mt-3">8</p>
              <p class="text-xs text-gray-500 mt-2">체크인 3건 • 체크아웃 5건</p>
              <div class="mt-4 flex items-center text-green-600 text-sm">
                <i class="pi pi-arrow-up text-xs mr-1"></i>
                <span class="font-medium">+12%</span>
                <span class="text-gray-500 ml-1">vs 어제</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-blue-600 transition-colors duration-300">
              <i class="pi pi-calendar-plus text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 이번 달 매출 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-green-600 uppercase tracking-wide">이번 달 매출</p>
              <p class="text-3xl font-bold text-gray-900 mt-3">₩4,200,000</p>
              <div class="mt-4 flex items-center text-green-600 text-sm">
                <i class="pi pi-arrow-up text-xs mr-1"></i>
                <span class="font-medium">+8%</span>
                <span class="text-gray-500 ml-1">vs 지난달</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-green-600 transition-colors duration-300">
              <i class="pi pi-chart-line text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 객실 점유율 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-purple-600 uppercase tracking-wide">객실 점유율</p>
              <p class="text-3xl font-bold text-gray-900 mt-3">78%</p>
              <p class="text-xs text-gray-500 mt-2">23/30 객실 사용 중</p>
              <div class="mt-4 flex items-center text-purple-600 text-sm">
                <i class="pi pi-arrow-up text-xs mr-1"></i>
                <span class="font-medium">+5%</span>
                <span class="text-gray-500 ml-1">vs 지난달</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-purple-600 transition-colors duration-300">
              <i class="pi pi-home text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 평점 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <template #content>
          <div class="flex items-start justify-between h-full p-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-yellow-600 uppercase tracking-wide">평균 평점</p>
              <p class="text-3xl font-bold text-gray-900 mt-3">4.7</p>
              <div class="flex items-center mt-2 space-x-1">
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <span class="text-xs text-gray-500 ml-2">(127개 리뷰)</span>
              </div>
              <div class="mt-4 flex items-center text-green-600 text-sm">
                <i class="pi pi-arrow-up text-xs mr-1"></i>
                <span class="font-medium">+0.2</span>
                <span class="text-gray-500 ml-1">vs 지난달</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center ml-4 group-hover:bg-yellow-600 transition-colors duration-300">
              <i class="pi pi-star text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 최근 예약 -->
    <Card class="border-0 shadow-lg">
      <template #title>
        <div class="flex items-center justify-between p-2">
          <div class="flex items-center space-x-3">
            <i class="pi pi-calendar text-blue-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900">최근 예약</span>
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
                <p class="font-semibold text-gray-900">{{ r.email || "이메일 없음" }}</p>
                <p class="text-sm text-gray-600">
                  {{ r.roomType || "객실 정보 없음" }} •
                  {{ formatDate(r.resevStart) }} - {{ formatDate(r.resevEnd) }}
                </p>
              </div>
            </div>

            <!-- 오른쪽: 상태 + 금액 -->
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

    <!-- 차트 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-chart-bar text-blue-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900">월별 매출 추이</span>
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
            <span class="text-xl font-semibold text-gray-900">예약 현황</span>
          </div>
        </template>
        <template #content>
          <Chart type="line" :data="reservationData" :options="chartOptions" class="h-80" />
        </template>
      </Card>
    </div>

    <!-- 하단 정보 카드 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- 오늘의 일정 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-clock text-orange-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900">오늘의 일정</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4 px-2">
            <div class="bg-orange-50 p-5 rounded-xl border border-orange-100">
              <h4 class="font-semibold text-orange-800 mb-3 flex items-center">
                <i class="pi pi-sign-out mr-2"></i> 체크아웃 (11:00 AM)
              </h4>
              <ul class="space-y-2 text-sm text-orange-700">
                <li>• 102호 - 김민수님</li>
                <li>• 205호 - 이영수님</li>
                <li>• 301호 - 박지영님</li>
              </ul>
            </div>
            <div class="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h4 class="font-semibold text-blue-800 mb-3 flex items-center">
                <i class="pi pi-sign-in mr-2"></i> 체크인 (3:00 PM)
              </h4>
              <ul class="space-y-2 text-sm text-blue-700">
                <li>• 104호 - 최철수님</li>
                <li>• 208호 - 김영희님</li>
              </ul>
            </div>
          </div>
        </template>
      </Card>

      <!-- 최근 리뷰 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-3 p-2">
            <i class="pi pi-star text-yellow-600 text-lg"></i>
            <span class="text-xl font-semibold text-gray-900">최근 리뷰</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4 px-2">
            <div class="p-5 bg-yellow-50/70 rounded-xl border border-yellow-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-gray-900">홍길동</span>
                  <div class="flex space-x-1">
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                  </div>
                </div>
                <span class="text-xs text-gray-500 font-medium">2시간 전</span>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">
                "객실이 매우 깨끗하고 직원분들이 친절했습니다. 다시 오고 싶네요!"
              </p>
            </div>

            <div class="p-5 bg-green-50/70 rounded-xl border border-green-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-gray-900">김영희</span>
                  <div class="flex space-x-1">
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star text-gray-300 text-sm"></i>
                  </div>
                </div>
                <span class="text-xs text-gray-500 font-medium">1일 전</span>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">
                "위치가 좋고 조식이 맛있었어요. 다음에도 이용하겠습니다."
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import Button from "primevue/button";
import { apiClient } from "@/utils/axiosClient";
import {
  formatCurrency,
  translateStatus,
} from "@/utils/placeOwner/formatters.js";
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';


// 📌 리프레시 상태
const isRefreshing = ref(false);
const refreshData = async () => {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
};

// 📌 최근 예약
const recentReservations = ref<any[]>([]);
const fetchRecentReservations = async () => {
  try {
    const refreshClient = axios.create({
      baseURL: apiClient.defaults.baseURL,
      withCredentials: true,
    });
    const res1 = await refreshClient.post("../auth/token");
    const newAccessToken = res1.data.data.accessToken;

    const { setAccessToken } = useAuthStore();
    setAccessToken(newAccessToken);
    const res = await apiClient.post(
      `/v1/reservations/search?page=0&size=3&sort=createdAt,desc`,
      {}
    );
    recentReservations.value = res.data.content;
  } catch (err) {
    console.error("최근 예약 불러오기 실패:", err);
  }
};

// 날짜 포맷 (YYYY-MM-DD)
const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

// 상태별 색상
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

// 📌 매출 차트 데이터
const salesData = ref({
  labels: ["8월", "9월", "10월", "11월", "12월", "1월"],
  datasets: [
    {
      label: "매출액 (만원)",
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderColor: "#3b82f6",
      data: [320, 280, 420, 380, 450, 420],
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
});

// 📌 예약 차트 데이터
const reservationData = ref({
  labels: ["8월", "9월", "10월", "11월", "12월", "1월"],
  datasets: [
    {
      label: "예약 건수",
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      tension: 0.4,
      data: [45, 38, 62, 58, 72, 65],
      pointBackgroundColor: "#10b981",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 3,
      pointRadius: 6,
    },
  ],
});

// 📌 차트 옵션
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

// 📌 mount 시 최근 예약 가져오기
onMounted(() => {
  fetchRecentReservations();
});
</script>

