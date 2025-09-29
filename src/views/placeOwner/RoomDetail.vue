<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient";

// PrimeVue
import Button from "primevue/button";
import Dialog from "primevue/dialog";

// VCalendar
import { format, addDays } from "date-fns";

// Custom
import RoomDialog from "./RoomDialog.vue";

const route = useRoute();
const router = useRouter();

const room = ref<any>(null);

// ✅ 상태 분리
const showCalendarDialog = ref(false); // 달력 팝업
const showRoomDialog = ref(false);     // 객실 수정 다이얼로그
const selectedDay = ref<{ date: string; available: number; total: number } | null>(null);

const allDays = ref<Record<string, { date: string; available: number; total: number }>>({});
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const formatPrice = (price: number) =>
  price ? `${Number(price).toLocaleString()}원` : "-";

const fetchRoom = async () => {
  const res = await apiClient.get(`/v1/owner/rooms/${route.params.id}`);
  room.value = res.data;
};

const fetchInventory = async (year: number) => {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const res = await apiClient.get(`/v1/owner/inventory/${route.params.id}`, {
    params: { start, end },
  });

  (res.data || []).forEach((item: any) => {
    const dateStr: string = item.date;
    const available = Number(item.availableRoom ?? 0);
    const total = Number(room.value?.capacityRoom ?? 0);
    allDays.value[dateStr] = { date: dateStr, available, total };
  });
};

function makeDateRange(from: Date, to: Date): string[] {
  const out: string[] = [];
  let cur = new Date(from);
  while (cur <= to) {
    out.push(format(cur, "yyyy-MM-dd"));
    cur = addDays(cur, 1);
  }
  return out;
}

// 3년 전 ~ 3년 후 데이터 프리로드
const preloadSevenYears = async () => {
  const nowYear = new Date().getFullYear();
  const startYear = nowYear - 3;
  const endYear = nowYear + 3;
  await Promise.all(
    Array.from({ length: endYear - startYear + 1 }, (_, i) => fetchInventory(startYear + i))
  );

  // 누락 날짜를 기본 total=capacityRoom, available=total로 채움
  if (!room.value) return;
  const from = new Date(startYear, 0, 1);
  const to = new Date(endYear, 11, 31);
  const dates = makeDateRange(from, to);

  for (const dateStr of dates) {
    if (!allDays.value[dateStr]) {
      const total = Number(room.value.capacityRoom ?? 0);
      allDays.value[dateStr] = { date: dateStr, available: total, total };
    }
  }
};

function getColorByDateStr(dateStr: string): string {
  const day = allDays.value[dateStr];
  if (!day) return "bg-gray-200";
  if (!day.total) return "bg-gray-200";

  const ratio = (day.available / day.total) * 100;
  if (ratio === 100) return "bg-green-500";
  if (ratio >= 80) return "bg-green-300";
  if (ratio >= 60) return "bg-yellow-300";
  if (ratio >= 40) return "bg-orange-300";
  if (ratio >= 20) return "bg-orange-500";
  if (ratio > 0) return "bg-red-400";
  return "bg-red-700";
}

function openDialogByDateStr(dateStr: string) {
  const day = allDays.value[dateStr];
  if (day) selectedDay.value = day;
  else {
    const total = Number(room.value?.capacityRoom ?? 0);
    selectedDay.value = { date: dateStr, available: total, total };
  }
  showCalendarDialog.value = true; // ✅ 달력 팝업만 열림
}

const deleteRoom = async () => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await apiClient.delete(`/v1/owner/rooms/${route.params.id}`);
    router.push("/owner/rooms");
  }
};

const openRoomDialog = () => (showRoomDialog.value = true);
const closeRoomDialog = () => (showRoomDialog.value = false);

onMounted(async () => {
  loading.value = true;
  errorMsg.value = null;
  try {
    await fetchRoom();
    await preloadSevenYears();
  } catch (e) {
    console.error("재고 캘린더 로드 실패", e);
    errorMsg.value = "재고 데이터를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
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
          <Button
            label="수정"
            icon="pi pi-pencil"
            @click="openRoomDialog"
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
      </div>
    </div>

    <!-- 재고 관리 캘린더 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">객실 가용률 캘린더</h2>

      <div v-if="errorMsg" class="mb-2 text-red-600 text-sm">{{ errorMsg }}</div>
      <div v-if="loading" class="mb-2 text-gray-500 text-sm">데이터 불러오는 중...</div>

      <!-- ✅ 가운데 정렬을 유지하되, 살짝 오른쪽으로 이동 (md 이상) -->
      <div class="max-w-5xl mx-auto flex justify-center">
        <VCalendar
          title-position="center"
          class="inline-block h-[700px] md:ml-6"
        >
          <template #day-content="{ day }">
            <div
              class="w-14 h-14 flex items-center justify-center rounded-lg cursor-pointer font-bold text-gray-900"
              :class="getColorByDateStr(format(day.date, 'yyyy-MM-dd'))"
              @click="openDialogByDateStr(format(day.date, 'yyyy-MM-dd'))"
            >
              {{ day.day }}
            </div>
          </template>
        </VCalendar>
      </div>
    </div>

    <!-- 달력 팝업 -->
    <Dialog v-model:visible="showCalendarDialog" modal header="객실 가용 정보" :style="{ width: '360px' }">
      <div v-if="selectedDay">
        <p class="font-bold mb-4 text-lg">📅 {{ selectedDay.date }}</p>
        <div class="flex justify-between items-center p-2 rounded border bg-gray-50">
          <span class="font-medium">남은 객실</span>
          <span class="font-semibold">
            {{ selectedDay.available }} / {{ selectedDay.total }}개
          </span>
        </div>
      </div>
    </Dialog>

    <!-- 객실 수정 다이얼로그 -->
    <RoomDialog
      v-if="showRoomDialog"
      :room="room"
      @close="closeRoomDialog"
      @save="fetchRoom"
    />
  </div>
</template>
