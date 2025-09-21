<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient";

// PrimeVue
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputNumber from "primevue/inputnumber";

// Custom
import RoomDialog from "./RoomDialog.vue";

const route = useRoute();
const router = useRouter();

const room = ref(null);
const inventory = ref([]);
const showDialog = ref(false);

const today = new Date();
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
const dateRange = ref([today, nextWeek]);

const lastUpdated = ref(null);
const timeAgo = ref("");
const loading = ref(false);
let intervalId, timerId;

const formatPrice = (price) =>
  price ? `${Number(price).toLocaleString()}원` : "-";

const updateTimeAgo = () => {
  if (!lastUpdated.value) return;
  const diff = Math.floor((Date.now() - lastUpdated.value) / 1000);
  if (diff < 5) timeAgo.value = "방금";
  else if (diff < 60) timeAgo.value = `${diff}초`;
  else if (diff < 3600) timeAgo.value = `${Math.floor(diff / 60)}분`;
  else timeAgo.value = `${Math.floor(diff / 3600)}시간`;
};

const fetchRoom = async () => {
  const res = await apiClient.get(`/v1/owner/rooms/${route.params.id}`);
  room.value = res.data;
  lastUpdated.value = Date.now();
  updateTimeAgo();
};

const fetchInventory = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) return;
  const [start, end] = dateRange.value.map((d) => d.toISOString().split("T")[0]);
  const res = await apiClient.get(`/v1/owner/inventory/${route.params.id}`, {
    params: { start, end },
  });
  inventory.value = res.data.map((item) => ({ ...item, _edited: false }));
};

const markAsEdited = (row) => (row._edited = true);

const updateInventory = async (row) => {
  try {
    await apiClient.put(`/v1/owner/inventory/${route.params.id}`, {
      roomId: route.params.id,
      date: row.date,
      availableRoom: row.availableRoom,
    });
    row._edited = false;
    alert("재고가 수정되었습니다.");
  } catch (e) {
    console.error("재고 수정 실패", e);
    alert("재고 수정 실패");
  }
};

const deleteRoom = async () => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await apiClient.delete(`/v1/owner/rooms/${route.params.id}`);
    router.push("/owner/rooms");
  }
};

const openDialog = () => (showDialog.value = true);
const closeDialog = () => (showDialog.value = false);

// 수동 새로고침
const handleRefresh = async () => {
  loading.value = true;
  await fetchRoom();
  await fetchInventory();
  loading.value = false;
};

onMounted(() => {
  fetchRoom();
  fetchInventory();

  // 5분마다 자동 새로고침
  intervalId = setInterval(() => {
    fetchRoom();
    fetchInventory();
  }, 5 * 60 * 1000);

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
      <h1 class="text-2xl font-bold">{{ room?.roomType }} 상세</h1>
      <div class="flex gap-2 items-center">
        <Button label="수정" icon="pi pi-pencil" @click="openDialog" />
        <Button label="삭제" icon="pi pi-trash" severity="danger" @click="deleteRoom" />

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

    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <p class="mb-2"><span class="font-medium">침대 타입:</span> {{ room?.bedType }}</p>
      <p class="mb-2"><span class="font-medium">정원:</span> {{ room?.capacityPeople }}명</p>
      <p class="mb-2"><span class="font-medium">총 객실 수:</span> {{ room?.capacityRoom }}개</p>
      <p class="mb-2"><span class="font-medium">가격:</span> {{ formatPrice(room?.price) }}</p>
      <p class="mb-2"><span class="font-medium">상태:</span> {{ room?.status }}</p>
    </div>

    <div class="flex gap-4 items-center mb-4">
      <Calendar v-model="dateRange" selectionMode="range" dateFormat="yy-mm-dd" showIcon placeholder="기간 선택" />
      <Button label="조회" icon="pi pi-search" @click="fetchInventory" />
    </div>

    <DataTable :value="inventory" class="shadow rounded-lg" tableStyle="min-width: 40rem" editMode="row">
      <Column field="date" header="날짜" />
      <Column field="availableRoom" header="남은 객실 수">
        <template #body="slotProps">
          <InputNumber
            v-model="slotProps.data.availableRoom"
            :min="0"
            class="w-24"
            @update:modelValue="markAsEdited(slotProps.data)"
          />
        </template>
      </Column>
      <Column header="저장">
        <template #body="slotProps">
          <Button
            label="저장"
            icon="pi pi-check"
            size="small"
            severity="success"
            @click="updateInventory(slotProps.data)"
            :disabled="!slotProps.data._edited"
          />
        </template>
      </Column>
    </DataTable>

    <RoomDialog
      v-if="showDialog"
      :room="room"
      @close="closeDialog"
      @save="fetchRoom"
    />
  </div>
</template>
