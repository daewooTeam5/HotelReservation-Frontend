<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-lg font-bold mb-4">예약 수정</h2>
      <form @submit.prevent="save">
        <label class="block mb-2">상태</label>
        <select v-model="form.status" class="border w-full p-2 mb-4">
          <option value="pending">대기</option>
          <option value="confirmed">확정</option>
          <option value="cancelled">취소</option>
          <option value="checked_in">체크인</option>
          <option value="checked_out">체크아웃</option>
        </select>

        <label class="block mb-2">결제 상태</label>
        <select v-model="form.paymentStatus" class="border w-full p-2 mb-4">
          <option value="unpaid">미결제</option>
          <option value="paid">결제완료</option>
          <option value="refunded">환불</option>
        </select>

        <label class="block mb-2">체크인</label>
        <input type="date" v-model="form.resevStart" class="border w-full p-2 mb-4" />

        <label class="block mb-2">체크아웃</label>
        <input type="date" v-model="form.resevEnd" class="border w-full p-2 mb-4" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border">닫기</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white">저장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { apiClient } from "@/utils/axiosClient"; // default export 아님, 이름 import

const props = defineProps({ reservation: Object });
const emit = defineEmits(["close"]);

const form = reactive({ ...props.reservation });

const save = async () => {
  await apiClient.put(`/v1/reservations/${form.reservationId}`, form);
  emit("close");
};
</script>
