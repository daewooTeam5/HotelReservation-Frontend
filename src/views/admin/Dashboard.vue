// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/admin/Dashboard.vue
<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Admin Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded shadow">
        <p class="text-gray-500 text-sm">총 숙소 수</p>
        <p class="text-3xl font-bold">{{ stats.totalHotels }}</p>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <p class="text-gray-500 text-sm">대기(검토중)</p>
        <p class="text-3xl font-bold">{{ stats.pending }}</p>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <p class="text-gray-500 text-sm">오늘 등록</p>
        <p class="text-3xl font-bold">{{ stats.today }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient';

const stats = ref({ totalHotels: 0, pending: 0, today: 0 });

onMounted(async () => {
  try {
    const res = await apiClient.get('/admin/stats');
    stats.value = res.data?.data ?? stats.value;
  } catch {
    // fallback demo numbers
    stats.value = { totalHotels: 42, pending: 5, today: 2 };
  }
});
</script>

