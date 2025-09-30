<template>
  <Card class="group border-0 shadow-lg">
    <template #content>
      <div class="flex items-start justify-between p-4!">
        <div>
          <p class="text-sm! font-medium! text-gray-500">{{ title }}</p>
          <p class="text-3xl font-semibold! text-gray-900 mt-2!">{{ value }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl! flex items-center justify-center" :class="colorClass">
          <i :class="['pi', icon, 'text-white', 'text-lg']"></i>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Card from "primevue/card"

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: String
})

const colorClass = computed(() => {
  switch (props.color) {
    case "blue": return "bg-blue-500"
    case "green": return "bg-green-500"
    case "red": return "bg-red-500"
    case "yellow": return "bg-yellow-500"
    default: return "bg-gray-400"
  }
})
</script>
