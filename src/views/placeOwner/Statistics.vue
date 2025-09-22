<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">통계 관리</h1>

    <!-- 요약 카드 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold">이번 달 매출</h2>
        <p class="text-2xl mt-2">₩12,450,000</p>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold">이번 달 예약 건수</h2>
        <p class="text-2xl mt-2">87</p>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold">평균 리뷰 평점</h2>
        <p class="text-2xl mt-2 text-yellow-500">4.4 ★</p>
      </div>
    </div>

    <!-- 매출 차트 -->
    <div class="bg-white rounded shadow p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">월별 매출 추이</h2>
      <div class="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
        (매출 차트 자리)
      </div>
    </div>

    <!-- 예약 현황 차트 -->
    <div class="bg-white rounded shadow p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">예약 현황</h2>
      <div class="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
        (예약 현황 차트 자리)
      </div>
    </div>

    <!-- 리뷰 통계 차트 -->
    <div class="bg-white rounded shadow p-4">
      <h2 class="text-lg font-semibold mb-4">리뷰 평점 분포</h2>
      <div class="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
        (리뷰 평점 차트 자리)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 더미 UI라 script 부분은 비워둬도 됨
</script>
