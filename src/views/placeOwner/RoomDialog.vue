<template>
  <Dialog
    v-model:visible="visible"
    :header="props.room ? '객실 유형 정보 변경' : '새 객실 유형 등록'"
    modal
    :style="{ width: '40rem' }"
    @hide="emit('close')"
  >
    <div class="flex flex-col gap-4">
      <!-- 객실명 -->
      <div>
        <label class="block text-sm font-medium mb-1">객실명</label>
        <InputText v-model="form.roomType" class="w-full" />
      </div>

      <!-- 침대 타입 -->
      <div>
        <label class="block text-sm font-medium mb-1">침대 타입</label>
        <Dropdown
          v-model="form.bedType"
          :options="bedOptions"
          placeholder="선택하세요"
          class="w-full"
        />
      </div>

      <!-- 정원 -->
      <div>
        <label class="block text-sm font-medium mb-1">정원(명)</label>
        <InputNumber v-model="form.capacityPeople" class="w-full" />
      </div>

      <!-- 총 객실 수 -->
      <div>
        <label class="block text-sm font-medium mb-1">총 객실 수</label>
        <InputNumber v-model="form.capacityRoom" class="w-full" />
      </div>

      <!-- 가격 -->
      <div>
        <label class="block text-sm font-medium mb-1">1박 가격</label>
        <InputNumber
          v-model="form.price"
          mode="currency"
          currency="KRW"
          locale="ko-KR"
          class="w-full"
        />
      </div>

      <!-- 상태 -->
      <div>
        <label class="block text-sm font-medium mb-1">상태</label>
        <Dropdown
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="선택하세요"
          class="w-full"
        />
      </div>
    </div>

    <!-- footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="취소" icon="pi pi-times" severity="secondary" @click="close" />
        <Button
          :label="props.room ? '변경' : '등록'"
          icon="pi pi-check"
          @click="save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { apiClient } from "@/utils/axiosClient";

// PrimeVue components
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";

const props = defineProps({
  room: { type: Object, default: null },
});
const emit = defineEmits(["close", "save"]);

const visible = ref(true);

const defaultForm = () => ({
  roomType: "",
  bedType: "",
  capacityPeople: 1,
  capacityRoom: 1,
  price: 0,
  status: "available",
});

const form = ref(defaultForm());

// 침대 타입 옵션 (예시)
const bedOptions = ["싱글", "더블", "트윈", "퀸", "킹"];

// 상태 옵션
const statusOptions = [
  { label: "판매중", value: "AVAILABLE" },   // 판매중 → AVAILABLE
  { label: "점검중", value: "CLEANING" },    // 점검중 → CLEANING
  { label: "예약됨", value: "RESERVED" },    // 예약됨 → RESERVED
];

// props.room 값에 따라 모드 전환
watch(
  () => props.room,
  (newRoom) => {
    if (newRoom) {
      form.value = { ...newRoom }; // 수정 모드
    } else {
      form.value = defaultForm(); // 추가 모드 → 폼 초기화
    }
  },
  { immediate: true }
);

// 닫기
const close = () => {
  visible.value = false;
  emit("close");
};

// 저장
const save = async () => {
  try {
    if (props.room) {
      // 수정
      await apiClient.put(`/v1/owner/rooms/${props.room.id}`, form.value);
    } else {
      // 추가
      await apiClient.post(`/v1/owner/rooms`, form.value);
    }
    emit("save");
    close();
  } catch (e) {
    console.error("저장 실패", e);
  }
};
</script>
