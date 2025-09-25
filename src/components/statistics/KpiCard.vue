<template>
  <!-- KPI 카드 컴포넌트 -->
  <div
    class="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
  >
    <!-- 상단 제목과 아이콘 -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm font-medium text-gray-600">{{ title }}</p>
      <div
        v-if="icon"
        class="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200"
        :class="iconBgColor"
      >
        <i :class="['pi text-lg', icon, iconColor]"></i>


      </div>
    </div>

    <!-- 값 표시 -->
    <div class="flex items-end justify-between">
      <p class="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        {{ formattedValue }}
      </p>

      <!-- 변화율 표시 (옵션) -->
      <div v-if="change" class="flex items-center text-sm" :class="changeColor">
        <i :class="changeIcon" class="pi mr-1"></i>
        <span>{{ Math.abs(change) }}%</span>
      </div>
    </div>

    <!-- 보조 정보 -->
    <p v-if="subtitle" class="text-xs text-gray-500 mt-2">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  value: string | number;
  icon?: string;
  change?: number;
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
});

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});

const iconBgColor = computed(() => {
  const colors = {
    blue: 'bg-blue-50 group-hover:bg-blue-100',
    green: 'bg-green-50 group-hover:bg-green-100',
    yellow: 'bg-yellow-50 group-hover:bg-yellow-100',
    purple: 'bg-purple-50 group-hover:bg-purple-100',
    red: 'bg-red-50 group-hover:bg-red-100'
  };
  return colors[props.color];
});

const iconColor = computed(() => {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    red: 'text-red-500'
  };
  return colors[props.color];
});

const changeColor = computed(() => {
  if (!props.change) return '';
  return props.change > 0 ? 'text-green-600' : 'text-red-600';
});

const changeIcon = computed(() => {
  if (!props.change) return '';
  return props.change > 0 ? 'pi-arrow-up' : 'pi-arrow-down';
});
</script>
