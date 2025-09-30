<template>
  <Card class="border-0 shadow-lg">
    <template #title>
      <div class="flex items-center space-x-3 p-2">
        <span class="text-lg font-semibold! text-gray-900">{{ title }}</span>
      </div>
    </template>
    <template #content>
      <Chart :type="type" :data="chartData" :options="chartOptions" class="h-80"/>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { apiClient } from "@/utils/axiosClient"
import Chart from "primevue/chart"
import Card from "primevue/card"

const props = defineProps({
  title: String,
  endpoint: String,
  label: String,
  type: { type: String, default: "line" }
})

const chartData = ref<any>(null)
const chartOptions = {
  responsive: true,
  plugins: { legend: { position: "bottom" } }
}

const fetchData = async () => {
  try {
    const res = await apiClient.get(props.endpoint)
    const data = res.data
    chartData.value = {
      labels: data.map((d: any) => d.period || d.label),
      datasets: [
        {
          label: props.label,
          data: data.map((d: any) => d.value),
          borderColor: "#42A5F5",
          backgroundColor: props.type === "bar" ? "#42A5F5" : "rgba(66, 165, 245, 0.2)",
          fill: props.type !== "bar"
        }
      ]
    }
  } catch (err) {
    console.error(`${props.title} 불러오기 실패:`, err)
  }
}

onMounted(fetchData)
watch(() => props.endpoint, fetchData)
</script>
