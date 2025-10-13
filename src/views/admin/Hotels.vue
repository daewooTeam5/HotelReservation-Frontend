// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/admin/Hotels.vue
<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Hotels</h1>

    <div class="bg-white rounded shadow overflow-hidden">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left px-4 py-2">Name</th>
            <th class="text-left px-4 py-2">Status</th>
            <th class="text-left px-4 py-2">Owner</th>
            <th class="text-left px-4 py-2">Created</th>
            <th class="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in hotels" :key="h.id" class="border-t">
            <td class="px-4 py-2">
              <RouterLink :to="{ name: 'admin-hotel-detail', params: { id: h.id } }" class="text-blue-600 hover:underline">
                {{ h.name }}
              </RouterLink>
            </td>
            <td class="px-4 py-2">
              <span :class="badgeClass(h.status)">{{ h.status }}</span>
            </td>
            <td class="px-4 py-2">{{ h.owner || '-' }}</td>
            <td class="px-4 py-2">{{ formatDate(h.createdAt) }}</td>
            <td class="px-4 py-2 space-x-2">
              <button class="px-2 py-1 border rounded" @click="goDetail(h.id)">View</button>
              <button v-if="h.status==='PENDING'" class="px-2 py-1 border rounded text-green-600" @click="approve(h.id)">Approve</button>
              <button v-if="h.status==='PENDING'" class="px-2 py-1 border rounded text-red-600" @click="reject(h.id)">Reject</button>
              <button class="px-2 py-1 border rounded text-red-600" @click="remove(h.id)">Delete</button>
            </td>
          </tr>
          <tr v-if="!hotels.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500">No hotels</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';

type HotelRow = { id: number|string; name: string; status: 'PENDING'|'ACTIVE'|'REJECTED'; owner?: string; createdAt?: string };

const router = useRouter();
const hotels = ref<HotelRow[]>([]);

const load = async () => {
  try {
    const res = await apiClient.get('/admin/hotels');
    hotels.value = res.data?.data ?? [];
  } catch {
    hotels.value = [
      { id: 1, name: 'Demo Hotel', status: 'PENDING', owner: 'owner1', createdAt: new Date().toISOString() },
      { id: 2, name: 'Open Stay', status: 'ACTIVE', owner: 'owner2', createdAt: new Date().toISOString() }
    ];
  }
};

onMounted(load);

const formatDate = (v?: string) => (v ? new Date(v).toLocaleString() : '-');
const badgeClass = (s: HotelRow['status']) => s === 'ACTIVE' ? 'px-2 py-1 bg-green-100 text-green-700 rounded' : s === 'REJECTED' ? 'px-2 py-1 bg-red-100 text-red-700 rounded' : 'px-2 py-1 bg-yellow-100 text-yellow-700 rounded';

const goDetail = (id: number|string) => router.push({ name: 'admin-hotel-detail', params: { id } });

const approve = async (id: number|string) => {
  try { await apiClient.post(`/admin/hotels/${id}/approve`); await load(); } catch { /* ignore demo */ }
};
const reject = async (id: number|string) => {
  try { await apiClient.post(`/admin/hotels/${id}/reject`); await load(); } catch { /* ignore demo */ }
};
const remove = async (id: number|string) => {
  if (!confirm('Delete this hotel?')) return;
  try { await apiClient.delete(`/admin/hotels/${id}`); await load(); } catch { hotels.value = hotels.value.filter(h => h.id !== id); }
};
</script>

