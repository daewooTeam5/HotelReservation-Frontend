// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/admin/Requests.vue
<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Registration Requests</h1>

    <div class="bg-white rounded shadow overflow-hidden">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left px-4 py-2">ID</th>
            <th class="text-left px-4 py-2">Hotel Name</th>
            <th class="text-left px-4 py-2">Owner</th>
            <th class="text-left px-4 py-2">Submitted</th>
            <th class="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id" class="border-t">
            <td class="px-4 py-2">{{ r.id }}</td>
            <td class="px-4 py-2">{{ r.name }}</td>
            <td class="px-4 py-2">{{ r.owner || '-' }}</td>
            <td class="px-4 py-2">{{ formatDate(r.createdAt) }}</td>
            <td class="px-4 py-2 space-x-2">
              <button class="px-2 py-1 border rounded text-green-600" @click="approve(r.id)">Approve</button>
              <button class="px-2 py-1 border rounded text-red-600" @click="reject(r.id)">Reject</button>
            </td>
          </tr>
          <tr v-if="!requests.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500">No pending requests</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient';

type RequestRow = { id: number|string; name: string; owner?: string; createdAt?: string };

const requests = ref<RequestRow[]>([]);

const load = async () => {
  try {
    const res = await apiClient.get('/admin/requests');
    requests.value = res.data?.data ?? [];
  } catch {
    requests.value = [
      { id: 1001, name: 'Pending Hotel 1', owner: 'owner3', createdAt: new Date().toISOString() }
    ];
  }
};

onMounted(load);

const formatDate = (v?: string) => (v ? new Date(v).toLocaleString() : '-');

const approve = async (id: number|string) => {
  try { await apiClient.post(`/admin/requests/${id}/approve`); await load(); } catch { /* demo */ }
};

const reject = async (id: number|string) => {
  try { await apiClient.post(`/admin/requests/${id}/reject`); await load(); } catch { /* demo */ }
};
</script>

