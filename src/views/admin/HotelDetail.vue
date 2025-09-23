<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Hotel #{{ id }}</h1>
      <div class="space-x-2">
        <button class="px-3 py-2 border rounded" @click="back">Back</button>
        <button class="px-3 py-2 border rounded text-green-600" @click="approve">Approve</button>
        <button class="px-3 py-2 border rounded text-red-600" @click="reject">Reject</button>
        <button class="px-3 py-2 border rounded text-red-600" @click="remove">Delete</button>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-500 text-sm">Name</p>
          <p class="text-lg font-semibold">{{ hotel.name }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Status</p>
          <p><span :class="badgeClass(hotel.status)">{{ hotel.status }}</span></p>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Owner</p>
          <p>{{ hotel.owner || '-' }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Created</p>
          <p>{{ formatDate(hotel.createdAt) }}</p>
        </div>
      </div>

      <div>
        <p class="text-gray-500 text-sm mb-2">Description</p>
        <p>{{ hotel.description }}</p>
      </div>

      <div>
        <p class="text-gray-500 text-sm mb-2">Images</p>
        <div class="flex flex-wrap gap-2">
          <img v-for="(img, idx) in hotel.images" :key="idx" :src="img" alt="hotel" class="w-32 h-24 object-cover rounded border" />
          <p v-if="!hotel.images?.length" class="text-gray-400">No images</p>
        </div>
      </div>

      <div>
        <p class="text-gray-500 text-sm mb-2">Rooms</p>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border">
            <thead class="bg-gray-100">
              <tr>
                <th class="text-left px-3 py-1">Number</th>
                <th class="text-left px-3 py-1">Type</th>
                <th class="text-left px-3 py-1">Capacity</th>
                <th class="text-left px-3 py-1">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in hotel.rooms" :key="i" class="border-t">
                <td class="px-3 py-1">{{ r.roomNumber }}</td>
                <td class="px-3 py-1">{{ r.roomType }}</td>
                <td class="px-3 py-1">{{ r.capacityPeople }}</td>
                <td class="px-3 py-1">{{ r.price }}</td>
              </tr>
              <tr v-if="!hotel.rooms?.length">
                <td colspan="4" class="px-3 py-4 text-center text-gray-400">No rooms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id as string);
const hotel = ref<any>({ name: '', status: 'PENDING', images: [], rooms: [] });

onMounted(async () => {
  try {
    const res = await apiClient.get(`/admin/hotels/${id.value}`);
    hotel.value = res.data?.data ?? hotel.value;
  } catch {
    hotel.value = {
      name: 'Demo Hotel',
      status: 'PENDING',
      owner: 'owner1',
      createdAt: new Date().toISOString(),
      description: 'Demo description',
      images: [],
      rooms: [ { roomNumber: 101, roomType: 'double', capacityPeople: 2, price: 50000 } ]
    };
  }
});

const formatDate = (v?: string) => (v ? new Date(v).toLocaleString() : '-');
const badgeClass = (s: 'PENDING'|'ACTIVE'|'REJECTED') => s === 'ACTIVE' ? 'px-2 py-1 bg-green-100 text-green-700 rounded' : s === 'REJECTED' ? 'px-2 py-1 bg-red-100 text-red-700 rounded' : 'px-2 py-1 bg-yellow-100 text-yellow-700 rounded';

const back = () => router.push({ name: 'admin-hotels' });
const approve = async () => { try { await apiClient.post(`/admin/hotels/${id.value}/approve`); hotel.value.status='ACTIVE'; } catch {} };
const reject = async () => { try { await apiClient.post(`/admin/hotels/${id.value}/reject`); hotel.value.status='REJECTED'; } catch {} };
const remove = async () => {
  if (!confirm('Delete this hotel?')) return;
  try { await apiClient.delete(`/admin/hotels/${id.value}`); router.push({ name: 'admin-hotels' }); } catch { router.push({ name: 'admin-hotels' }); }
};
</script>
