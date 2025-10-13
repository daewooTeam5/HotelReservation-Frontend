<template>
  <Dialog
    :visible="visible"
    modal
    header="예약 수정"
    :style="{ width: '500px' }"
    @update:visible="(val) => !val && $emit('close')"
  >
    <div class="p-2 space-y-4 flex flex-col gap-3">
      <!-- 예약 상태 -->
      <div class="flex flex-col">
        <label class="font-semibold mb-2">
          예약 상태
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.status"
          class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="pending">대기</option>
          <option value="confirmed">확정</option>
          <option value="cancelled">취소</option>
          <option value="checked_in">체크인</option>
          <option value="checked_out">체크아웃</option>
        </select>
      </div>

      <!-- 결제 상태 -->
      <div class="flex flex-col">
        <label class="font-semibold mb-2">
          결제 상태
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.paymentStatus"
          class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="unpaid">미결제</option>
          <option value="paid">결제완료</option>
          <option value="refunded">환불</option>
        </select>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button label="취소" severity="secondary" @click="$emit('close')" />
      <Button label="저장" @click="save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { apiClient } from "@/utils/axiosClient";
import { useToast } from "primevue/usetoast";

const props = defineProps<{
  reservation?: any;
  visible: boolean;
}>();

const emit = defineEmits(["close", "save"]);

const form = reactive({ ...props.reservation });
const toast = useToast();

const save = async () => {
  try {
    await apiClient.put(`/v1/reservations/${form.reservationId}`, form);

    toast.add({
      severity: "success",
      summary: "예약 수정 완료",
      detail: `예약 #${form.reservationId} 이(가) 수정되었습니다.`,
      life: 3000,
    });

    emit("save");
    emit("close");
  } catch (error) {
    console.error("예약 수정 중 오류:", error);

    toast.add({
      severity: "error",
      summary: "수정 실패",
      detail: "예약 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
      life: 4000,
    });
  }
};
</script>
