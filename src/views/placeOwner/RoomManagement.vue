<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">객실 관리</h1>

    <!-- 검색/필터/정렬 바 -->
    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <!-- 검색 -->
      <div>
        <label class="block text-sm font-medium mb-1">검색</label>
        <InputText v-model="searchQuery" placeholder="객실 번호 / 유형" />
      </div>

      <!-- 상태 필터 -->
      <div>
        <label class="block text-sm font-medium mb-1">상태</label>
        <Dropdown v-model="statusFilter" :options="statusOptions" placeholder="전체" />
      </div>

      <!-- 정렬 -->
      <div>
        <label class="block text-sm font-medium mb-1">정렬</label>
        <Dropdown v-model="sortOption" :options="sortOptions" placeholder="선택" />
      </div>

      <!-- 추가 버튼 -->
      <div class="ml-auto">
        <Button
          label="객실 추가"
          icon="pi pi-plus"
          class="p-button-primary"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- 객실 목록 테이블 -->
    <div class="bg-white rounded shadow p-4">
      <h2 class="text-lg font-semibold mb-4">객실 목록</h2>
      <table class="w-full border-collapse">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border">객실 번호</th>
          <th class="p-2 border">객실 유형</th>
          <th class="p-2 border">가격</th>
          <th class="p-2 border">상태</th>
          <th class="p-2 border text-center">액션</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="room in filteredRooms" :key="room.id">
          <td class="p-2 border">{{ room.number }}</td>
          <td class="p-2 border">{{ room.type }}</td>
          <td class="p-2 border">₩{{ room.price.toLocaleString() }}</td>
          <td class="p-2 border">{{ room.status }}</td>
          <td class="p-2 border text-center space-x-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              @click="editRoom(room)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              @click="deleteRoom(room.id)"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 객실 추가/수정 다이얼로그 -->
    <Dialog
      v-model:visible="isDialogOpen"
      modal
      :header="isEditMode ? '객실 수정' : '객실 추가'"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <!-- 객실 유형 -->
        <div>
          <label class="block mb-1 font-medium">객실 유형</label>
          <Dropdown v-model="form.type" :options="roomTypes" class="w-full" />
        </div>

        <!-- 객실 번호 -->
        <div>
          <label class="block mb-1 font-medium">객실 번호</label>
          <InputText v-model="form.number" placeholder="예: 101, A202" class="w-full" />
        </div>

        <!-- 가격 -->
        <div>
          <label class="block mb-1 font-medium">가격</label>
          <InputText v-model.number="form.price" type="number" class="w-full" />
        </div>

        <!-- 상태 -->
        <div>
          <label class="block mb-1 font-medium">상태</label>
          <Dropdown v-model="form.status" :options="statusOptions" class="w-full" />
        </div>
      </div>

      <template #footer>
        <Button label="취소" class="p-button-text" @click="closeDialog" />
        <Button
          :label="isEditMode ? '수정' : '추가'"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveRoom"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";

// 검색/필터 상태
const searchQuery = ref("");
const statusFilter = ref("");
const sortOption = ref("");

// 객실 목록 (더미 데이터)
const rooms = ref([
  { id: 1, number: "101", type: "스탠다드", price: 100000, status: "예약 가능" },
  { id: 2, number: "201", type: "디럭스", price: 150000, status: "예약 가능" },
  { id: 3, number: "301", type: "스위트", price: 200000, status: "점검 중" },
]);

// 필터/검색/정렬
const filteredRooms = computed(() => {
  let result = [...rooms.value];

  if (searchQuery.value) {
    result = result.filter(
      (r) =>
        r.number.includes(searchQuery.value) ||
        r.type.includes(searchQuery.value)
    );
  }

  if (statusFilter.value) {
    result = result.filter((r) => r.status === statusFilter.value);
  }

  if (sortOption.value === "가격↑") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOption.value === "가격↓") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
});

// 옵션
const roomTypes = ["스탠다드", "디럭스", "스위트"];
const statusOptions = ["예약 가능", "점검 중", "예약 불가"];
const sortOptions = ["가격↑", "가격↓"];

// 다이얼로그 상태
const isDialogOpen = ref(false);
const isEditMode = ref(false);
const editingRoomId = ref<number | null>(null);

const form = ref({
  number: "",
  type: "",
  price: 0,
  status: "예약 가능",
});

// 다이얼로그 열기
const openAddDialog = () => {
  isEditMode.value = false;
  form.value = { number: "", type: "", price: 0, status: "예약 가능" };
  isDialogOpen.value = true;
};

// 닫기
const closeDialog = () => {
  isDialogOpen.value = false;
};

// 수정
const editRoom = (room: any) => {
  form.value = { ...room };
  editingRoomId.value = room.id;
  isEditMode.value = true;
  isDialogOpen.value = true;
};

// 삭제
const deleteRoom = (id: number) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    rooms.value = rooms.value.filter((r) => r.id !== id);
  }
};

// 저장
const saveRoom = () => {
  if (isEditMode.value && editingRoomId.value !== null) {
    const idx = rooms.value.findIndex((r) => r.id === editingRoomId.value);
    if (idx !== -1) {
      rooms.value[idx] = { id: editingRoomId.value, ...form.value };
    }
  } else {
    const newId = rooms.value.length
      ? Math.max(...rooms.value.map((r) => r.id)) + 1
      : 1;
    rooms.value.push({ id: newId, ...form.value });
  }
  closeDialog();
};
</script>
