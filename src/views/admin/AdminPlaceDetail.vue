<template>
  <div class="flex flex-col gap-6">
    <!-- 헤더 -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ place.placeName }}</h1>
      </div>
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :class="getApprovalClass(place.status)"
      >
        {{ translateApproval(place.status) }}
      </span>
    </div>

    <!-- 핵심 지표 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <!-- 오늘 체크인 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-green-600">오늘 체크인</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ todayCheckIn }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-sign-in text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 오늘 체크아웃 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-red-600">오늘 체크아웃</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ todayCheckOut }}
              </p>
            </div>
            <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-sign-out text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 전체 객실 / 남은 객실 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-blue-600">객실 현황</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ totalRooms }} / {{ availableRooms }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-home text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 총 매출 -->
      <Card class="group border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
        <template #content>
          <div class="flex items-start justify-between p-4">
            <div>
              <p class="text-sm font-medium text-yellow-600">총 매출</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatCurrency(totalRevenue) }}원
              </p>
            </div>
            <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <i class="pi pi-wallet text-white text-lg"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 객실 카드 -->
    <div>
      <h2 class="text-xl font-semibold mb-2">객실 현황</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          v-for="room in rooms"
          :key="room.id"
          class="group border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
        >
          <template #content>
            <div class="p-4 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">{{ room.roomType }}</h3>
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getRoomStatusClass(room.status)"
                >
                  {{ translateRoomStatus(room.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600">침대: {{ room.bedType }}</p>
              <p class="text-sm text-gray-600">수용 인원: {{ room.capacityPeople }}명</p>
              <p class="text-sm text-gray-600">총 객실: {{ room.capacityRoom }}개</p>
              <p class="text-xl font-bold text-blue-600 mt-2">
                {{ formatCurrency(room?.price) }}원 / 1박
              </p>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- 예약 상태 -->
    <div>
      <h2 class="text-xl font-semibold mb-2">예약 상태</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card class="border-0 shadow bg-gradient-to-br from-green-50 to-green-100/50">
          <template #content>
            <div class="p-4">
              <p class="text-sm font-medium text-green-600">확정됨</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">
                {{ reservations.filter(r => r.status === 'confirmed').length }}
              </p>
            </div>
          </template>
        </Card>
        <Card class="border-0 shadow bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <template #content>
            <div class="p-4">
              <p class="text-sm font-medium text-yellow-600">대기 중</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">
                {{ reservations.filter(r => r.status === 'pending').length }}
              </p>
            </div>
          </template>
        </Card>
        <Card class="border-0 shadow bg-gradient-to-br from-gray-50 to-gray-100/50">
          <template #content>
            <div class="p-4">
              <p class="text-sm font-medium text-gray-600">퇴실 완료</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">
                {{ reservations.filter(r => r.status === 'checked_out').length }}
              </p>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- 결제 내역 -->
    <div>
      <h2 class="text-xl font-semibold mb-2">결제 내역</h2>
      <Card class="border-0 shadow-lg">
        <template #content>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded shadow text-sm">
              <thead>
              <tr class="text-left text-gray-600 border-b bg-gray-50">
                <th class="p-2">ID</th>
                <th class="p-2">방법</th>
                <th class="p-2">유형</th>
                <th class="p-2">금액</th>
                <th class="p-2">상태</th>
                <th class="p-2">일시</th>
              </tr>
              </thead>
              <tbody>
              <tr
                v-for="p in payments"
                :key="p.id"
                class="border-b text-sm text-gray-700"
              >
                <td class="p-2">{{ p.id }}</td>
                <td class="p-2">{{ p.method }}</td>
                <td class="p-2">{{ p.methodType }}</td>
                <td class="p-2">{{ formatCurrency(p.amount) }}원</td>
                <td class="p-2">{{ p.status }}</td>
                <td class="p-2">{{ p.transactionDate }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import Card from "primevue/card";
import { apiClient } from "@/utils/axiosClient";
import dayjs from "dayjs";

const route = useRoute();

const place = ref<any>({});
const rooms = ref<any[]>([]);
const reservations = ref<any[]>([]);
const payments = ref<any[]>([]);

const fetchDetail = async () => {
  try {
    const res = await apiClient.get(`/v1/admin/places/${route.params.id}`);
    place.value = res.data.data.place;
    rooms.value = res.data.data.rooms;
    reservations.value = res.data.data.reservations;
    payments.value = res.data.data.payments;
  } catch (err) {
    console.error("숙소 상세 조회 실패:", err);
  }
};

onMounted(fetchDetail);

const today = dayjs().format("YYYY-MM-DD");

// 오늘 체크인
const todayCheckIn = computed(() =>
  reservations.value.filter(r => r.resevStart === today).length
);

// 오늘 체크아웃
const todayCheckOut = computed(() =>
  reservations.value.filter(r => r.resevEnd === today).length
);

// 전체 객실 수
const totalRooms = computed(() =>
  rooms.value.reduce((sum, r) => sum + (r.capacityRoom || 0), 0)
);

// 남은 객실 수
const availableRooms = computed(() =>
  rooms.value
    .filter(r => r.status === "AVAILABLE")
    .reduce((sum, r) => sum + (r.capacityRoom || 0), 0)
);

// 총 매출 (payments 기준)
const totalRevenue = computed(() =>
  payments.value
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0)
);

// 상태 색상
const getApprovalClass = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    INACTIVE: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const translateApproval = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "승인",
    PENDING: "대기",
    REJECTED: "거절",
    INACTIVE: "정지",
  };
  return map[status] || status;
};

const getRoomStatusClass = (status: string) => {
  const map: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800",
    RESERVED: "bg-red-100 text-red-800",
    CLEANING: "bg-yellow-100 text-yellow-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const translateRoomStatus = (status: string) => {
  const map: Record<string, string> = {
    AVAILABLE: "예약 가능",
    RESERVED: "예약됨",
    CLEANING: "청소 중",
  };
  return map[status] || status;
};

const formatCurrency = (val: number | null | undefined) => {
  if (val == null) return "-";
  return val.toLocaleString();
};
</script>
