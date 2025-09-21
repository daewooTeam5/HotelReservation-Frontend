<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient";
import RoomDialog from "./RoomDialog.vue";

// PrimeVue
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore.js";

const rooms = ref([]);
const showDialog = ref(false);
const selectedRoom = ref(null);
const router = useRouter();

const lastUpdated = ref(null);
const timeAgo = ref("");
const loading = ref(false);
let intervalId, timerId;

// 가격 포맷터
const formatPrice = (price) =>
  price ? `${Number(price).toLocaleString()}원` : "-";

// 시간차 계산
const updateTimeAgo = () => {
  if (!lastUpdated.value) return;
  const diff = Math.floor((Date.now() - lastUpdated.value) / 1000);
  if (diff < 5) timeAgo.value = "방금";
  else if (diff < 60) timeAgo.value = `${diff}초`;
  else if (diff < 3600) timeAgo.value = `${Math.floor(diff / 60)}분`;
  else timeAgo.value = `${Math.floor(diff / 3600)}시간`;
};

// API: 목록 조회
const fetchRooms = async () => {
  const refreshClient = axios.create({
    baseURL: apiClient.defaults.baseURL,
    withCredentials: true,
  });
  const res1 = await refreshClient.post("../auth/token");
  const newAccessToken = res1.data.data.accessToken;

  const { setAccessToken } = useAuthStore();
  setAccessToken(newAccessToken);

  const res = await apiClient.get("/v1/owner/rooms");
  const data = res.data;

  const today = new Date().toISOString().split("T")[0];
  for (let room of data) {
    try {
      const inv = await apiClient.get(`/v1/owner/inventory/${room.id}`, {
        params: { start: today, end: today },
      });
      room.availableRoom =
        inv.data.length > 0 ? inv.data[0].availableRoom : 0;
    } catch (e) {
      room.availableRoom = null;
    }
  }
  rooms.value = data;

  lastUpdated.value = Date.now();
  updateTimeAgo();
};

// 수동 새로고침 버튼
const handleRefresh = async () => {
  loading.value = true;
  await fetchRooms();
  loading.value = false;
};

// 삭제
const deleteRoom = async (id) => {
  if (confirm("정말 이 객실 유형을 삭제하시겠습니까?")) {
    await apiClient.delete(`/v1/owner/rooms/${id}`);
    fetchRooms();
  }
};

// 행 클릭 → 상세 페이지 이동
const onRowClick = (event) => {
  router.push(`/owner/rooms/${event.data.id}`);
};

// 다이얼로그
const openDialog = (room = null) => {
  selectedRoom.value = room;
  showDialog.value = true;
};
const closeDialog = () => {
  showDialog.value = false;
  selectedRoom.value = null;
};

// Mounted
onMounted(() => {
  fetchRooms();

  // 5분마다 자동 새로고침
  intervalId = setInterval(fetchRooms, 5 * 60 * 1000);

  // 1초마다 "몇 초 전" 갱신
  timerId = setInterval(updateTimeAgo, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearInterval(timerId);
});
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">객실 유형 관리</h1>
      <div class="flex items-center gap-3">
        <Button label="객실 유형 추가" icon="pi pi-plus" @click="openDialog()" />

        <!-- 새로고침 버튼 -->
        <button
          @click="handleRefresh"
          :disabled="loading"
          class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5l1 1" />
          </svg>
          <svg v-else class="animate-spin h-4 w-4 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          새로고침
        </button>

        <!-- 마지막 업데이트 시간 -->
        <span class="text-xs text-gray-500">
          {{ lastUpdated ? `${timeAgo} 전 업데이트됨` : "업데이트 기록 없음" }}
        </span>
      </div>
    </div>

    <DataTable
      :value="rooms"
      class="shadow rounded-lg"
      tableStyle="min-width: 60rem"
      selectionMode="single"
      @row-click="onRowClick"
    >
      <Column field="roomType" header="객실명" />
      <Column field="bedType" header="침대 타입" />
      <Column field="capacityPeople" header="정원" />
      <Column field="capacityRoom" header="총 객실 수" />
      <Column field="availableRoom" header="남은 객실 수">
        <template #body="slotProps">
          <span class="text-blue-600 font-semibold">
            {{ slotProps.data.availableRoom ?? '-' }}
          </span>
        </template>
      </Column>
      <Column field="price" header="가격">
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.price) }}
        </template>
      </Column>
      <Column field="status" header="상태" />
      <Column header="액션">
        <template #body="slotProps">
          <Button
            label="삭제"
            icon="pi pi-trash"
            severity="danger"
            size="small"
            @click.stop="deleteRoom(slotProps.data.id)"
          />
        </template>
      </Column>
    </DataTable>

    <RoomDialog
      v-if="showDialog"
      :key="selectedRoom ? selectedRoom.id : 'new'"
      :room="selectedRoom"
      @close="closeDialog"
      @save="fetchRooms"
    />
  </div>
</template>
