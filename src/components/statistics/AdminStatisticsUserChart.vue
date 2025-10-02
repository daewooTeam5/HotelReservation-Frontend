<template>
  <Card class="border-0 shadow-lg">
    <template #title>
      <div class="flex items-center justify-between p-2">
        <div class="flex items-center space-x-2!">
          <span class="text-lg font-semibold! text-gray-900">{{ title }}</span>
        </div>
        <PrimeSelect v-model="period" :options="periodOptions" optionLabel="label" optionValue="value" class="w-28"/>
      </div>
    </template>

    <template #content>
      <Chart :type="chartType" :data="chartData" :options="chartOptions" class="h-80"/>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { apiClient } from "@/utils/axiosClient"
import Chart from "primevue/chart"
import Card from "primevue/card"
import PrimeSelect from "primevue/select"

const props = defineProps({
  title: String,
  endpoint: String, // ex) "users", "reservations", "payments"
  label: String,
  chartType: { type: String, default: "line" }
})

const chartData = ref<any>(null)
const chartOptions = {
  responsive: true,
  plugins: { legend: { position: "bottom" } }
}

// 조회 단위 옵션
const period = ref("monthly")
const periodOptions = [
  { label: "일별", value: "daily" },
  { label: "월별", value: "monthly" },
  { label: "연별", value: "yearly" }
]

// API 호출
const fetchData = async () => {
  try {
    const res = await apiClient.get(`/statistics/customers/stats/${props.endpoint}?type=${period.value}`)
    const data = res.data
    chartData.value = {
      labels: data.map((d: any) => d.month),
      datasets: [
        {
          label: props.label,
          data: data.map((d: any) => d.count),
          borderColor: "#42A5F5",
          backgroundColor: props.chartType === "bar" ? "#42A5F5" : "rgba(66,165,245,0.2)",
          fill: props.chartType !== "bar"
        }
      ]
    }
  } catch (err) {
    console.error(`${props.title} 불러오기 실패:`, err)
  }
}

onMounted(fetchData)
watch(period, fetchData) // 단위 변경 시 다시 조회
</script>
