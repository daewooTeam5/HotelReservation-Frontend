<template>
  <Card class="border-0 shadow-lg">
    <template #title>
      <div class="flex items-center justify-between p-2">
        <span class="text-lg font-semibold! text-gray-900">사용자 역할 분포</span>
      </div>
    </template>

    <template #content>
      <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-80"/>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { apiClient } from "@/utils/axiosClient"
import Chart from "primevue/chart"
import Card from "primevue/card"

const chartData = ref<any>(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 20,
        font: { size: 14 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value}명 (${percentage}%)`
        }
      }
    }
  }
}

const roleLabels: any = {
  'customer': '일반 사용자',
  'hotel_owner': '숙소 관리자'
}

const fetchData = async () => {
  try {
    const res = await apiClient.get("/statistics/customers/role-distribution")
    const data = res.data

    chartData.value = {
      labels: data.map((d: any) => roleLabels[d.role] || d.role),
      datasets: [{
        data: data.map((d: any) => d.count),
        backgroundColor: [
          'rgba(66, 165, 245, 0.8)',   // 파란색 (customer)
          'rgba(255, 167, 38, 0.8)'    // 주황색 (hotel_owner)
        ],
        borderColor: [
          'rgba(66, 165, 245, 1)',
          'rgba(255, 167, 38, 1)'
        ],
        borderWidth: 2
      }]
    }
  } catch (err) {
    console.error("역할 분포 불러오기 실패:", err)
  }
}

onMounted(fetchData)
</script>
