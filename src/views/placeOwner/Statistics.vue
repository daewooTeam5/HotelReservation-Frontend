<template>
  <div class="p-6 space-y-6">
    <!-- 페이지 타이틀 -->
    <h1 class="text-2xl font-bold text-gray-900">통계 대시보드</h1>

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
</script>
