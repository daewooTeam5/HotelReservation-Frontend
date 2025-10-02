<template>
  <div class="space-y-6!">
    <!-- KPI 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AdminKpiCard title="총 고객 수" :value="stats.totalUsers" icon="pi-users" color="blue"/>
      <AdminKpiCard title="신규 고객" :value="stats.newUsersThisMonth" icon="pi-user-plus" color="green"/>
      <AdminKpiCard title="활성 고객" :value="stats.activeUsers" icon="pi-check-circle" color="yellow"/>
      <AdminKpiCard title="재구매율" :value="stats.repeatRate.toFixed(1) + '%'" icon="pi-refresh" color="red"/>
    </div>

    <!-- 유저 관련 통계 차트 (상단) -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminStatisticsUserChart title="총 유저 수 추이" endpoint="total-users" label="총 회원 수" />
        <AdminStatisticsUserChart title="신규 가입자 추이" endpoint="users" label="가입자 수" />
        <AdminStatisticsUserChart title="탈퇴율 추이" endpoint="withdrawals" label="탈퇴 수" />
      </div>
    </div>

    <!-- 역할 비율 + 비활성 사용자 추이 (하단) -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminStatisticsUserChart
          title="비활성 사용자 추이"
          endpoint="inactive"
          label="비활성 사용자 수"
          chartType="line"
        />
        <AdminRoleDistributionChart />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { apiClient } from "@/utils/axiosClient"
import AdminKpiCard from "@/components/statistics/AdminKpiCard.vue"
import AdminStatisticsUserChart from "@/components/statistics/AdminStatisticsUserChart.vue"
import AdminRoleDistributionChart from "@/components/statistics/AdminRoleDistributionChart.vue"

const stats = ref<any>({
  totalUsers: 0,
  newUsersThisMonth: 0,
  activeUsers: 0,
  repeatRate: 0
})

const fetchStats = async () => {
  try {
    const res = await apiClient.get("/statistics/customers")
    stats.value = res.data
  } catch (err) {
    console.error("고객 통계 불러오기 실패:", err)
  }
}

onMounted(fetchStats)
</script>
