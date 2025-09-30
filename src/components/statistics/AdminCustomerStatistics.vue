<template>
  <div class="space-y-6">
    <!-- KPI 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AdminKpiCard title="총 고객 수" :value="stats.totalUsers" icon="pi-users" color="blue"/>
      <AdminKpiCard title="신규 고객" :value="stats.newUsersThisMonth" icon="pi-user-plus" color="green"/>
      <AdminKpiCard title="활성 고객" :value="stats.activeUsers" icon="pi-check-circle" color="yellow"/>
      <AdminKpiCard title="재구매율" :value="stats.repeatRate.toFixed(1) + '%'" icon="pi-refresh" color="red"/>
    </div>

    <!-- 고객 통계 차트 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminStatisticsUserChart title="신규 가입자 추이" endpoint="users" label="가입자 수" />
      <AdminStatisticsUserChart title="예약 추이" endpoint="reservations" label="예약 건수" />
      <AdminStatisticsUserChart title="결제 추이" endpoint="payments" label="결제 금액" chartType="bar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { apiClient } from "@/utils/axiosClient"
import AdminKpiCard from "@/components/statistics/AdminKpiCard.vue"
import AdminStatisticsUserChart from "@/components/statistics/AdminStatisticsUserChart.vue"

const stats = ref<any>({ totalUsers: 0, newUsersThisMonth: 0, activeUsers: 0, repeatRate: 0 })

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
