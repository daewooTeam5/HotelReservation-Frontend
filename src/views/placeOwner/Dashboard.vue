<script setup lang="ts">
import Card from "primevue/card";
import Chart from "primevue/chart";
import { ref } from "vue";

const salesData = ref({
  labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
  datasets: [
    {
      label: "매출액 (만원)",
      backgroundColor: "#3b82f6",
      data: [120, 150, 180, 220, 200, 250],
    },
  ],
});

const reservationData = ref({
  labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
  datasets: [
    {
      label: "예약 건수",
      borderColor: "#10b981",
      fill: false,
      tension: 0.4,
      data: [30, 40, 35, 50, 60, 55],
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
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#6b7280" },
      grid: { color: "#e5e7eb" },
    },
    y: {
      ticks: { color: "#6b7280" },
      grid: { color: "#e5e7eb" },
    },
  },
});
</script>
<template>
  <div class="space-y-8">
    <!-- 요약 카드 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 오늘 예약 현황 -->
      <Card>
        <template #title>오늘 예약</template>
        <template #content>
          <p>체크인: 3건</p>
          <p>체크아웃: 2건</p>
        </template>
      </Card>

      <!-- 이번 달 매출 -->
      <Card>
        <template #title>이번 달 매출</template>
        <template #content>
          <p class="text-2xl font-bold text-blue-600">₩ 4,200,000</p>
        </template>
      </Card>

      <!-- 최근 리뷰 -->
      <Card>
        <template #title>최근 리뷰</template>
        <template #content>
          <p>"깨끗하고 좋았어요" - 홍길동</p>
          <p>"다시 오고 싶네요" - 김영희</p>
        </template>
      </Card>
    </div>

    <!-- 차트 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 월별 매출 차트 -->
      <Card>
        <template #title>월별 매출</template>
        <template #content>
          <Chart type="bar" :data="salesData" :options="chartOptions" class="h-72" />
        </template>
      </Card>

      <!-- 예약 현황 차트 -->
      <Card>
        <template #title>예약 현황</template>
        <template #content>
          <Chart type="line" :data="reservationData" :options="chartOptions" class="h-72" />
        </template>
      </Card>
    </div>
  </div>
</template>
