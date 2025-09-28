<script setup>
import { ref, onMounted } from "vue";
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


const formatPrice = (price) =>
  price ? `${Number(price).toLocaleString()}원` : "-";

const fetchRoom = async () => {
  const res = await apiClient.get(`/v1/owner/rooms/${route.params.id}`);
  room.value = res.data;
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

onMounted(() => {
  fetchRoom();
  fetchInventory();
});

</script>

<template>
  <div class="max-w-7xl mx-auto p-6 space-y-6 flex flex-col gap-6">
    <!-- 헤더 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 gap-6">
          <button
            @click="$router.go(-1)"
            class="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ room?.roomType }}</h1>
            <p class="text-gray-500 text-sm mt-1">객실 상세 관리</p>
          </div>
        </div>

        <div class="flex items-center space-x-3 gap-6">

          <!-- 액션 버튼들 -->
          <Button
            label="수정"
            icon="pi pi-pencil"
            @click="openDialog"
            class="!bg-blue-500 !border-blue-500 hover:!bg-blue-600"
          />
          <Button
            label="삭제"
            icon="pi pi-trash"
            severity="danger"
            @click="deleteRoom"
          />
        </div>
      </div>
    </div>

    <!-- 객실 정보 카드 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">객실 정보</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="space-y-1">
          <span class="text-sm text-gray-500">침대 타입</span>
          <p class="font-medium text-gray-900">{{ room?.bedType || '-' }}</p>
        </div>
        <div class="space-y-1">
          <span class="text-sm text-gray-500">정원</span>
          <p class="font-medium text-gray-900">{{ room?.capacityPeople }}명</p>
        </div>
        <div class="space-y-1">
          <span class="text-sm text-gray-500">총 객실 수</span>
          <p class="font-medium text-gray-900">{{ room?.capacityRoom }}개</p>
        </div>
        <div class="space-y-1">
          <span class="text-sm text-gray-500">가격</span>
          <p class="font-semibold text-lg text-blue-600">{{ formatPrice(room?.price) }}</p>
        </div>
        <div class="space-y-1">
          <span class="text-sm text-gray-500">상태</span><br>
          <span
            :class="room?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            class="inline-block px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ room?.status || '-' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 재고 관리 카드 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">재고 관리</h2>
        <div class="flex items-center space-x-4 gap-4">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            dateFormat="yy-mm-dd"
            showIcon
            placeholder="기간 선택"
            class="w-64"
          />
          <Button
            label="조회"
            icon="pi pi-search"
            @click="fetchInventory"
            class="!bg-blue-500 !border-blue-500 hover:!bg-blue-600"
          />
        </div>
      </div>

      <!-- 재고 테이블 -->
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <DataTable
          :value="inventory"
          editMode="row"
          :paginator="inventory.length > 10"
          :rows="10"
          class="w-full"
        >
          <Column field="date" header="날짜" class="!bg-gray-50 !font-medium">
            <template #body="slotProps">
              <span class="font-medium text-gray-900">{{ slotProps.data.date }}</span>
            </template>
          </Column>

          <Column field="availableRoom" header="남은 객실 수">
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <InputNumber
                  v-model="slotProps.data.availableRoom"
                  :min="0"
                  :max="room?.capacityRoom"
                  class="w-20"
                  @update:modelValue="markAsEdited(slotProps.data)"
                />
                <span v-if="slotProps.data._edited" class="text-xs text-orange-500 font-medium">
                  수정됨
                </span>
              </div>
            </template>
          </Column>

          <Column header="저장" class="w-24">
            <template #body="slotProps">
              <Button
                label="저장"
                icon="pi pi-check"
                size="small"
                severity="success"
                @click="updateInventory(slotProps.data)"
                :disabled="!slotProps.data._edited"
                class="w-full"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- 빈 상태 -->
      <div v-if="inventory.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">재고 데이터 없음</h3>
        <p class="mt-1 text-sm text-gray-500">기간을 선택하고 조회 버튼을 클릭해주세요.</p>
      </div>
    </div>

    <!-- 다이얼로그 -->
    <RoomDialog
      v-if="showDialog"
      :room="room"
      @close="closeDialog"
      @save="fetchRoom"
    />
  </div>
</template>
