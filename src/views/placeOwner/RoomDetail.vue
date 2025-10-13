<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient";

// PrimeVue
import Button from "primevue/button";
import Dialog from "primevue/dialog";

// date-fns
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths } from "date-fns";

// Custom
import RoomDialog from "./RoomDialog.vue";

const route = useRoute();
const router = useRouter();

const room = ref<any>(null);

// 상태 분리
const showCalendarDialog = ref(false);
const showRoomDialog = ref(false);
const selectedDay = ref<{ date: string; available: number; total: number } | null>(null);

const allDays = ref<Record<string, { date: string; available: number; total: number }>>({});
const loading = ref(false);
const errorMsg = ref<string | null>(null);

// 캘린더 UI 상태
const currentDate = ref(new Date());
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const showDatePicker = ref(false);
const pickerYear = ref(new Date().getFullYear());

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

// 달력 날짜 생성
const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value));
  const end = endOfWeek(endOfMonth(currentDate.value));

  const days = [];
  let current = start;

  while (current <= end) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const isCurrentMonth = current.getMonth() === currentDate.value.getMonth();

    if (isCurrentMonth) {
      days.push({
        day: current.getDate(),
        dateStr: dateStr,
      });
    } else {
      days.push(null);
    }

    current = addDays(current, 1);
  }

  return days;
});

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

const preloadSevenYears = async () => {
  const nowYear = new Date().getFullYear();
  const startYear = nowYear - 3;
  const endYear = nowYear + 3;
  await Promise.all(
    Array.from({ length: endYear - startYear + 1 }, (_, i) => fetchInventory(startYear + i))
  );

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
  if (!day) return "bg-gray-200 text-gray-700";
  if (!day.total) return "bg-gray-200 text-gray-700";

  const ratio = (day.available / day.total) * 100;
  if (ratio === 100) return "bg-green-500 text-white";
  if (ratio >= 80) return "bg-green-300 text-gray-900";
  if (ratio >= 60) return "bg-yellow-300 text-gray-900";
  if (ratio >= 40) return "bg-orange-300 text-gray-900";
  if (ratio >= 20) return "bg-orange-500 text-white";
  if (ratio > 0) return "bg-red-400 text-white";
  return "bg-red-700 text-white";
}

function openDialogByDateStr(dateStr: string) {
  const day = allDays.value[dateStr];
  if (day) selectedDay.value = day;
  else {
    const total = Number(room.value?.capacityRoom ?? 0);
    selectedDay.value = { date: dateStr, available: total, total };
  }
  showCalendarDialog.value = true;
}

function changeMonth(delta: number) {
  currentDate.value = addMonths(currentDate.value, delta);
  selectedYear.value = currentDate.value.getFullYear();
  selectedMonth.value = currentDate.value.getMonth() + 1;
  pickerYear.value = selectedYear.value;
}

function changePickerYear(delta: number) {
  pickerYear.value += delta;
}

function selectMonthYear(month: number) {
  selectedMonth.value = month;
  selectedYear.value = pickerYear.value;
  currentDate.value = new Date(selectedYear.value, selectedMonth.value - 1, 1);
  showDatePicker.value = false;
}

const openRoomDialog = () => (showRoomDialog.value = true);
const closeRoomDialog = () => (showRoomDialog.value = false);

onMounted(async () => {
  loading.value = true;
  errorMsg.value = null;
  try {
    await fetchRoom();
    await preloadSevenYears();
    selectedYear.value = currentDate.value.getFullYear();
    selectedMonth.value = currentDate.value.getMonth() + 1;
    pickerYear.value = selectedYear.value;
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
      <h2 class="text-lg font-semibold text-gray-900 mb-6">객실 가용률 캘린더</h2>

      <div v-if="errorMsg" class="mb-4 text-red-600 text-sm">{{ errorMsg }}</div>
      <div v-if="loading" class="mb-4 text-gray-500 text-sm">데이터 불러오는 중...</div>

      <!-- 개선된 캘린더 UI -->
      <div class="max-w-5xl mx-auto">
        <!-- 월/연도 네비게이션 -->
        <div class="mb-6 flex items-center justify-between">
          <button
            @click="changeMonth(-1)"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="pi pi-chevron-left"></i>
          </button>

          <div class="relative">
            <button
              @click="showDatePicker = !showDatePicker"
              class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              {{ selectedYear }}년 {{ selectedMonth }}월
            </button>

            <!-- 날짜 선택 모달 -->
            <div
              v-if="showDatePicker"
              @click.stop
              class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50 w-80"
            >
              <!-- 연도 선택 -->
              <div class="flex items-center justify-between mb-4">
                <button @click="changePickerYear(-1)" class="p-2 hover:bg-gray-100 rounded-lg">
                  <i class="pi pi-chevron-left text-sm"></i>
                </button>
                <span class="text-lg font-bold">{{ pickerYear }}</span>
                <button @click="changePickerYear(1)" class="p-2 hover:bg-gray-100 rounded-lg">
                  <i class="pi pi-chevron-right text-sm"></i>
                </button>
              </div>

              <!-- 월 선택 그리드 -->
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="month in 12"
                  :key="month"
                  @click="selectMonthYear(month)"
                  class="py-3 px-4 rounded-lg font-semibold transition-all"
                  :class="month === selectedMonth && pickerYear === selectedYear
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'"
                >
                  {{ month }}월
                </button>
              </div>
            </div>
          </div>

          <button
            @click="changeMonth(1)"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>

        <!-- 요일 헤더 -->
        <div class="grid grid-cols-7 gap-3 mb-3">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {{ day }}
          </div>
        </div>

        <!-- 날짜 그리드 -->
        <div class="grid grid-cols-7 gap-3 mb-6">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="flex items-center justify-center"
          >
            <button
              v-if="day"
              @click="openDialogByDateStr(day.dateStr)"
              class="w-full h-full min-h-[80px] rounded-lg font-semibold transition-all border-2 flex flex-col items-center justify-center text-base"
              :class="[
                getColorByDateStr(day.dateStr),
                'border-transparent hover:border-gray-300 hover:scale-105'
              ]"
            >
              <span class="text-base">{{ day.day }}</span>
              <span class="text-xs mt-1 font-medium">
                {{ allDays[day.dateStr]
                ? allDays[day.dateStr].available + '/' + allDays[day.dateStr].total
                : '-' }}
              </span>
            </button>
          </div>
        </div>

        <!-- 범례 -->
        <div class="pt-6 border-t">
          <p class="text-sm font-semibold text-gray-700 mb-3">객실 가용률</p>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-green-500 rounded"></div>
              <span class="text-sm text-gray-600">100%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-green-300 rounded"></div>
              <span class="text-sm text-gray-600">80%+</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-yellow-300 rounded"></div>
              <span class="text-sm text-gray-600">60%+</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-orange-300 rounded"></div>
              <span class="text-sm text-gray-600">40%+</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-orange-500 rounded"></div>
              <span class="text-sm text-gray-600">20%+</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-red-400 rounded"></div>
              <span class="text-sm text-gray-600">1~20%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-red-700 rounded"></div>
              <span class="text-sm text-gray-600">0%</span>
            </div>
          </div>
        </div>
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
