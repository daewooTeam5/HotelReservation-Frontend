<template>
  <div class="space-y-8">
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 오늘 예약 현황 -->
      <Card class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">오늘 예약</p>
              <div class="mt-2">
                <p class="text-2xl font-bold text-gray-900">8</p>
                <p class="text-xs text-gray-500 mt-1">체크인 3건 • 체크아웃 5건</p>
              </div>
            </div>
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
              <i class="pi pi-calendar-plus text-white text-xl"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <div class="flex items-center text-green-600 text-sm">
              <i class="pi pi-arrow-up text-xs mr-1"></i>
              <span class="font-medium">+12%</span>
              <span class="text-gray-500 ml-1">vs 어제</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- 이번 달 매출 -->
      <Card class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-600 uppercase tracking-wide">이번 달 매출</p>
              <div class="mt-2">
                <p class="text-2xl font-bold text-gray-900">₩4,200,000</p>
                <p class="text-xs text-gray-500 mt-1">목표 달성률 84%</p>
              </div>
            </div>
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
              <i class="pi pi-chart-line text-white text-xl"></i>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width: 84%"></div>
            </div>
          </div>
        </template>
      </Card>

      <!-- 객실 점유율 -->
      <Card class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-600 uppercase tracking-wide">객실 점유율</p>
              <div class="mt-2">
                <p class="text-2xl font-bold text-gray-900">78%</p>
                <p class="text-xs text-gray-500 mt-1">23/30 객실 사용 중</p>
              </div>
            </div>
            <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
              <i class="pi pi-home text-white text-xl"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <div class="flex items-center text-purple-600 text-sm">
              <i class="pi pi-arrow-up text-xs mr-1"></i>
              <span class="font-medium">+5%</span>
              <span class="text-gray-500 ml-1">vs 지난달</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- 평점 -->
      <Card class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-yellow-600 uppercase tracking-wide">평균 평점</p>
              <div class="mt-2">
                <p class="text-2xl font-bold text-gray-900">4.7</p>
                <div class="flex items-center mt-1">
                  <div class="flex items-center">
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                  </div>
                  <span class="text-xs text-gray-500 ml-1">(127개 리뷰)</span>
                </div>
              </div>
            </div>
            <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 transition-colors duration-300">
              <i class="pi pi-star text-white text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 최근 활동 및 알림 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 최근 예약 -->
      <Card class="lg:col-span-2 border-0 shadow-lg">
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i class="pi pi-calendar text-blue-600"></i>
              <span class="text-lg font-semibold text-gray-900">최근 예약</span>
            </div>
            <Button label="전체 보기" class="p-button-text p-button-sm" />
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium text-sm">김</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">김민수</p>
                  <p class="text-sm text-gray-600">디럭스 룸 • 1월 18-20일</p>
                </div>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">확정</span>
                <p class="text-sm text-gray-600 mt-1">₩240,000</p>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium text-sm">박</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">박영희</p>
                  <p class="text-sm text-gray-600">스위트 룸 • 1월 22-25일</p>
                </div>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기중</span>
                <p class="text-sm text-gray-600 mt-1">₩480,000</p>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium text-sm">이</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">이철수</p>
                  <p class="text-sm text-gray-600">스탠다드 룸 • 1월 16-17일</p>
                </div>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">체크인</span>
                <p class="text-sm text-gray-600 mt-1">₩120,000</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- 빠른 액션 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-bolt text-purple-600"></i>
            <span class="text-lg font-semibold text-gray-900">빠른 액션</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-3">
            <Button
              label="새 예약 등록"
              icon="pi pi-plus"
              class="w-full justify-start p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 p-button-outlined"
            />
            <Button
              label="객실 상태 확인"
              icon="pi pi-home"
              class="w-full justify-start p-3 border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 p-button-outlined"
            />
            <Button
              label="체크인/아웃 관리"
              icon="pi pi-calendar-clock"
              class="w-full justify-start p-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 p-button-outlined"
            />
            <Button
              label="리뷰 관리"
              icon="pi pi-star"
              class="w-full justify-start p-3 border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50 transition-all duration-200 p-button-outlined"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- 차트 영역 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 월별 매출 차트 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-chart-bar text-blue-600"></i>
            <span class="text-lg font-semibold text-gray-900">월별 매출 추이</span>
          </div>
        </template>
        <template #content>
          <Chart type="bar" :data="salesData" :options="chartOptions" class="h-80" />
        </template>
      </Card>

      <!-- 예약 현황 차트 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-chart-line text-green-600"></i>
            <span class="text-lg font-semibold text-gray-900">예약 현황</span>
          </div>
        </template>
        <template #content>
          <Chart type="line" :data="reservationData" :options="chartOptions" class="h-80" />
        </template>
      </Card>
    </div>

    <!-- 오늘의 할 일 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 오늘의 체크인/아웃 -->
      <Card class="border-0 shadow-lg">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-clock text-orange-600"></i>
            <span class="text-lg font-semibold text-gray-900">오늘의 일정</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="bg-orange-50 p-4 rounded-lg">
              <h4 class="font-semibold text-orange-800 mb-2">체크아웃 (11:00 AM)</h4>
              <ul class="space-y-1 text-sm text-orange-700">
                <li>• 102호 - 김민수님</li>
                <li>• 205호 - 이영수님</li>
                <li>• 301호 - 박지영님</li>
              </ul>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-800 mb-2">체크인 (3:00 PM)</h4>
              <ul class="space-y-1 text-sm text-blue-700">
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
          <div class="flex items-center space-x-2">
            <i class="pi pi-star text-yellow-600"></i>
            <span class="text-lg font-semibold text-gray-900">최근 리뷰</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="p-4 bg-yellow-50/50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-gray-900">홍길동</span>
                  <div class="flex">
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                  </div>
                </div>
                <span class="text-xs text-gray-500">2시간 전</span>
              </div>
              <p class="text-sm text-gray-700">"객실이 매우 깨끗하고 직원분들이 친절했습니다. 다시 오고 싶네요!"</p>
            </div>

            <div class="p-4 bg-green-50/50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-gray-900">김영희</span>
                  <div class="flex">
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                    <i class="pi pi-star text-gray-300 text-xs"></i>
                  </div>
                </div>
                <span class="text-xs text-gray-500">1일 전</span>
              </div>
              <p class="text-sm text-gray-700">"위치가 좋고 조식이 맛있었어요. 다음에도 이용하겠습니다."</p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import Button from "primevue/button";

// 새로고침 상태
const isRefreshing = ref(false);

// 새로고침 함수
const refreshData = async () => {
  isRefreshing.value = true;
  // 실제로는 API 호출
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
};

// 차트 데이터
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

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#374151",
        font: {
          size: 12,
          weight: "500"
        }
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#6b7280",
        font: {
          size: 11
        }
      },
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
        drawBorder: false
      },
    },
    y: {
      ticks: {
        color: "#6b7280",
        font: {
          size: 11
        }
      },
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
        drawBorder: false
      },
    },
  },
});
</script>
