<template>
  <div class="p-6 space-y-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">통계 대시보드</h1>

      <div class="flex items-center gap-3">
        <!-- 업데이트 시간 -->
        <span class="text-sm text-gray-500">
          마지막 업데이트: {{ timeAgo }}
        </span>

        <!-- 새로고침 버튼 -->
        <button
          @click="refreshData"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
        >
          <i class="pi pi-refresh mr-2"></i>
          새로고침
        </button>

        <!-- 내보내기 버튼 -->
        <button
          @click="exportCurrentTab"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <i class="pi pi-download mr-2"></i>
          내보내기
        </button>
      </div>
    </div>

    <!-- 탭 -->
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">예약/매출</Tab>
        <Tab value="1">고객</Tab>
        <Tab value="2">리뷰</Tab>
        <Tab value="3">운영/객실</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <ReservationStatistics ref="reservationRef" />
        </TabPanel>
        <TabPanel value="1">
          <CustomerStatistics ref="customerRef" />
        </TabPanel>
        <TabPanel value="2">
          <ReviewStatistics ref="reviewRef" />
        </TabPanel>
        <TabPanel value="3">
          <RoomStatistics ref="roomRef" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

// PrimeVue Tabs 관련 컴포넌트
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";

// 통계 페이지별 컴포넌트
import ReservationStatistics from "@/components/statistics/ReservationStatistics.vue";
import CustomerStatistics from "@/components/statistics/CustomerStatistics.vue";
import ReviewStatistics from "@/components/statistics/ReviewStatistics.vue";
import RoomStatistics from "@/components/statistics/RoomStatistics.vue";

// 현재 활성화된 탭 상태
const activeTab = ref("0");

// 자식 컴포넌트 refs
const reservationRef = ref();
const customerRef = ref();
const reviewRef = ref();
const roomRef = ref();

// 마지막 업데이트 시간
const lastUpdated = ref<Date>(new Date());

// 사람이 읽기 좋은 시간
const timeAgo = computed(() => {
  const diffSec = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000);

  if (diffSec < 60) {
    return "방금 전";
  } else if (diffSec < 3600) {
    return `${Math.floor(diffSec / 60)}분 전`;
  } else if (diffSec < 86400) {
    return `${Math.floor(diffSec / 3600)}시간 전`;
  } else {
    return `${Math.floor(diffSec / 86400)}일 전`;
  }
});

// ✅ 전체 새로고침 함수
function refreshData() {
  reservationRef.value?.refresh?.();
  customerRef.value?.refresh?.();
  reviewRef.value?.refresh?.();
  roomRef.value?.refresh?.();

  lastUpdated.value = new Date(); // 새로고침 시점 갱신
}

// 내보내기 함수 (현재 탭만 내보내기)
function exportCurrentTab() {
  switch (activeTab.value) {
    case "0":
      reservationRef.value?.exportToCSV();
      break;
    case "1":
      customerRef.value?.exportToCSV();
      break;
    case "2":
      reviewRef.value?.exportToCSV();
      break;
    case "3":
      roomRef.value?.exportToCSV();
      break;
  }
}

// 30초마다 timeAgo 자동 갱신 + 5분마다 전체 새로고침
let intervalId1: number;
let intervalId2: number;

onMounted(() => {
  // 30초마다 timeAgo 갱신
  intervalId1 = window.setInterval(() => {
    lastUpdated.value = new Date(lastUpdated.value);
  }, 30000);

  // 5분마다 자동 새로고침
  intervalId2 = window.setInterval(() => {
    refreshData();
  }, 5 * 60 * 1000);
});

onUnmounted(() => {
  clearInterval(intervalId1);
  clearInterval(intervalId2);
});
</script>
