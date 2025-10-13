<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';

const props = defineProps<{ modelValue: number | null }>();
const emit = defineEmits(['update:modelValue']);

const selected = ref<number | string>(props.modelValue ?? "");

watch(() => props.modelValue, (val) => {
  selected.value = val ?? "";
});

watch(selected, (val) => {
  emit('update:modelValue', val === "" ? null : (typeof val === 'string' ? Number(val) : val));
});

const { data, isLoading, isError } = useQuery({
  queryKey: ['v1', 'places', 'category'],
  queryFn: httpFetcher
});

const categories = computed(() => data.value?.data ?? []);
</script>

<template>
  <div class="w-full">
    <select
      v-model="selected"
      class="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
    >
      <option value="">선택</option>
      <option
        v-for="cat in categories"
        :key="cat.id"
        :value="cat.id"
      >
        {{ cat.name }}
      </option>
    </select>
    <div v-if="isLoading" class="text-xs text-gray-400 mt-1">카테고리 불러오는 중...</div>
    <div v-if="isError" class="text-xs text-red-500 mt-1">카테고리 불러오기 실패</div>
  </div>
</template>
