<template>
  <div class="p-6 space-y-6 flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">통계 대시보드</h1>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">
          마지막 업데이트: {{ timeAgo }}
        </span>

        <!-- 새로고침 -->
        <button
          @click="refreshData"
          :disabled="loading"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="loading" class="pi pi-spinner pi-spin mr-2"></i>
          <i v-else class="pi pi-refresh mr-2"></i>
          {{ loading ? '불러오는 중...' : '새로고침' }}
        </button>
        <!-- 내보내기 -->
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
      <TabPanels class="flex-1 min-w-0 overflow-hidden">
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

// PrimeVue Tabs
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

// 통계별 컴포넌트
import ReservationStatistics from "@/components/statistics/ReservationStatistics.vue";
import CustomerStatistics from "@/components/statistics/CustomerStatistics.vue";
import ReviewStatistics from "@/components/statistics/ReviewStatistics.vue";
import RoomStatistics from "@/components/statistics/RoomStatistics.vue";

const loading = ref(false);

const toast = useToast();

const activeTab = ref("0");
const reservationRef = ref();
const customerRef = ref();
const reviewRef = ref();
const roomRef = ref();

const lastUpdated = ref<Date>(new Date());

// 사람이 읽기 좋은 시간
const timeAgo = computed(() => {
  const diffSec = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000);
  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  return `${Math.floor(diffSec / 86400)}일 전`;
});

// 새로고침 함수
async function refreshData() {
  try {
    loading.value = true;
    await Promise.all([
      reservationRef.value?.refresh?.(),
      customerRef.value?.refresh?.(),
      reviewRef.value?.refresh?.(),
      roomRef.value?.refresh?.(),
    ]);
    lastUpdated.value = new Date();
  } finally {
    loading.value = false;
  }
}

// 내보내기
function exportCurrentTab() {
  let success = false;
  switch (activeTab.value) {
    case "0": reservationRef.value?.exportToCSV(); success = true; break;
    case "1": customerRef.value?.exportToCSV(); success = true; break;
    case "2": reviewRef.value?.exportToCSV(); success = true; break;
    case "3": roomRef.value?.exportToCSV(); success = true; break;
  }

  if (success) {
    toast.add({
      severity: "success",
      summary: "내보내기 완료",
      detail: "CSV 파일이 성공적으로 내보내졌습니다.",
      life: 3000
    });
  }
}

// 30초마다 timeAgo 갱신 + 5분마다 새로고침
let intervalId1: number;
let intervalId2: number;

onMounted(() => {
  intervalId1 = window.setInterval(() => {
    lastUpdated.value = new Date(lastUpdated.value);
  }, 30000);

  intervalId2 = window.setInterval(() => {
    refreshData();
  }, 5 * 60 * 1000);
});

onUnmounted(() => {
  clearInterval(intervalId1);
  clearInterval(intervalId2);
});
</script>
