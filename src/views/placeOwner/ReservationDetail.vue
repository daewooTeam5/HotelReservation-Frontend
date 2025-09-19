<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">예약 상세</h2>
    <div v-if="reservation">
      <!-- 예약자 -->
      <p>
        <strong>예약자:</strong> {{ reservation.guestName }}
        <span v-if="reservation.member" class="text-blue-500">(회원)</span>
        <span v-else class="text-gray-500">(비회원)</span>
      </p>
      <p><strong>이메일:</strong> {{ reservation.email }}</p>
      <p><strong>전화번호:</strong> {{ reservation.phone }}</p>

      <!-- 객실 정보 -->
      <p><strong>객실 유형:</strong> {{ reservation.roomType }}</p>
      <p><strong>수용 인원:</strong> {{ reservation.capacityPeople }}명</p>
      <p><strong>가격:</strong> ₩{{ Number(reservation.price).toLocaleString() }}/박</p>

      <!-- 예약 상태 -->
      <p><strong>상태:</strong> {{ translateStatus(reservation.status) }}</p>
      <p><strong>결제상태:</strong> {{ translatePaymentStatus(reservation.paymentStatus) }}</p>
      <p><strong>결제수단:</strong> {{ reservation.method }}</p>

      <!-- 예약 기간 -->
      <p><strong>체크인:</strong> {{ formatDateTime(reservation.resevStart) }}</p>
      <p><strong>체크아웃:</strong> {{ formatDateTime(reservation.resevEnd) }}</p>

      <p><strong>예약일:</strong> {{ formatDateTime(reservation.createdAt) }}</p>

      <!-- 기타 -->
      <p><strong>요청사항:</strong> {{ reservation.request }}</p>
      <p><strong>최종 결제 금액:</strong> {{  formatCurrency(reservation.finalAmount) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { apiClient } from "@/utils/axiosClient";
import {
  formatDateTime,
  formatCurrency,
  translateStatus,
  translatePaymentStatus,
} from "@/utils/placeOwner/formatters.js";

const route = useRoute();
const reservation = ref(null);

onMounted(async () => {
  const res = await apiClient.get(`/v1/reservations/${route.params.id}`);
  reservation.value = res.data; // ✅ DTO 그대로 매핑
});
</script>
