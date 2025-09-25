<template>
  <div class="p-6 space-y-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">통계 대시보드</h1>

      <!-- ✅ 새로고침 버튼 -->
      <button
        @click="refreshData"
        class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
      >
        <i class="pi pi-refresh mr-2"></i>
        새로고침
      </button>
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
          <ReservationStatistics />
        </TabPanel>
        <TabPanel value="1">
          <CustomerStatistics />
        </TabPanel>
        <TabPanel value="2">
          <ReviewStatistics />
        </TabPanel>
        <TabPanel value="3">
          <RoomStatistics />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

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

// ✅ 새로고침 함수
function refreshData() {
  console.log("데이터 새로고침 실행");
  // 각 탭 컴포넌트에 emit 이벤트를 보내거나 store/action 호출 가능
}

</script>
