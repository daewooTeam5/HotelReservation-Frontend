<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">예약 관리</h1>

    <!-- 검색/필터/정렬 바 -->
    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <!-- 검색 -->
      <div>
        <label class="block text-sm font-medium mb-1">검색</label>
        <InputText v-model="searchQuery" placeholder="예약 번호 / 고객명" />
      </div>

      <!-- 상태 필터 -->
      <div>
        <label class="block text-sm font-medium mb-1">예약 상태</label>
        <Dropdown v-model="statusFilter" :options="statusOptions" placeholder="전체" />
      </div>

      <!-- 결제 상태 필터 -->
      <div>
        <label class="block text-sm font-medium mb-1">결제 상태</label>
        <Dropdown v-model="paymentFilter" :options="paymentOptions" placeholder="전체" />
      </div>

      <!-- 정렬 -->
      <div>
        <label class="block text-sm font-medium mb-1">정렬</label>
        <Dropdown v-model="sortOption" :options="sortOptions" placeholder="선택" />
      </div>
    </div>

    <!-- 예약 목록 테이블 -->
    <div class="bg-white rounded shadow p-4">
      <h2 class="text-lg font-semibold mb-4">예약 목록</h2>
      <table class="w-full border-collapse">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border">예약 번호</th>
          <th class="p-2 border">고객명</th>
          <th class="p-2 border">객실</th>
          <th class="p-2 border">체크인</th>
          <th class="p-2 border">체크아웃</th>
          <th class="p-2 border">예약 상태</th>
          <th class="p-2 border">결제 상태</th>
          <th class="p-2 border text-center">액션</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="reservation in filteredReservations" :key="reservation.id">
          <td class="p-2 border">{{ reservation.code }}</td>
          <td class="p-2 border">{{ reservation.customer }}</td>
          <td class="p-2 border">{{ reservation.room }}</td>
          <td class="p-2 border">{{ reservation.checkIn }}</td>
          <td class="p-2 border">{{ reservation.checkOut }}</td>
          <td class="p-2 border">{{ reservation.status }}</td>
          <td class="p-2 border">{{ reservation.paymentStatus }}</td>
          <td class="p-2 border text-center">
            <Button
              label="취소"
              icon="pi pi-times"
              class="p-button-danger p-button-sm"
              :disabled="reservation.status === '취소됨'"
              @click="cancelReservation(reservation.id)"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";

const searchQuery = ref("");
const statusFilter = ref("");
const paymentFilter = ref("");
const sortOption = ref("");

// 더미 데이터
const reservations = ref([
  {
    id: 1,
    code: "R-20250917-001",
    customer: "홍길동",
    room: "101",
    checkIn: "2025-09-20",
    checkOut: "2025-09-22",
    status: "확정",
    paymentStatus: "완료",
  },
  {
    id: 2,
    code: "R-20250917-002",
    customer: "김철수",
    room: "102",
    checkIn: "2025-09-21",
    checkOut: "2025-09-23",
    status: "취소됨",
    paymentStatus: "환불",
  },
  {
    id: 3,
    code: "R-20250917-003",
    customer: "이영희",
    room: "201",
    checkIn: "2025-09-25",
    checkOut: "2025-09-28",
    status: "확정",
    paymentStatus: "완료",
  },
]);

// 필터 + 검색 + 정렬
const filteredReservations = computed(() => {
  let result = [...reservations.value];

  // 검색
  if (searchQuery.value) {
    result = result.filter(
      (r) =>
        r.code.includes(searchQuery.value) ||
        r.customer.includes(searchQuery.value)
    );
  }

  // 상태 필터
  if (statusFilter.value) {
    result = result.filter((r) => r.status === statusFilter.value);
  }

  // 결제 상태 필터
  if (paymentFilter.value) {
    result = result.filter((r) => r.paymentStatus === paymentFilter.value);
  }

  // 정렬
  if (sortOption.value === "체크인↑") {
    result.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  } else if (sortOption.value === "체크인↓") {
    result.sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  } else if (sortOption.value === "예약번호") {
    result.sort((a, b) => a.code.localeCompare(b.code));
  }

  return result;
});

// 옵션
const statusOptions = ["확정", "취소됨"];
const paymentOptions = ["완료", "환불"];
const sortOptions = ["체크인↑", "체크인↓", "예약번호"];

// 예약 취소
const cancelReservation = (id: number) => {
  if (confirm("정말 예약을 취소하시겠습니까?")) {
    const reservation = reservations.value.find((r) => r.id === id);
    if (reservation) {
      reservation.status = "취소됨";
      reservation.paymentStatus = "환불";
    }
  }
};
</script>
