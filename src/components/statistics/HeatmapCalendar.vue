<template>
  <div class="flex gap-6 h-[calc(100vh-12rem)]">
    <!-- 달력 영역 -->
    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
      <div class="mb-6 flex items-center justify-between">
        <button
          @click="changeMonth(-1)"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i class="pi pi-chevron-left"></i>
        </button>

        <h3 class="text-xl font-bold text-gray-900">
          {{ currentYear }}년 {{ currentMonth }}월
        </h3>

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
      <div class="grid grid-cols-7 gap-3 flex-1">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="flex items-center justify-center"
        >
          <button
            v-if="day"
            @click="selectDate(day.dateStr)"
            class="w-full h-full min-h-[60px] rounded-lg font-semibold transition-all border-2 flex items-center justify-center text-base"
            :class="[
              getColorClass(day.dateStr),
              selectedDate === day.dateStr
                ? 'border-blue-600 ring-2 ring-blue-200 scale-105'
                : 'border-transparent hover:border-gray-300 hover:scale-105'
            ]"
          >
            {{ day.day }}
          </button>
        </div>
      </div>

      <!-- 범례 -->
      <div class="mt-6 pt-6 border-t">
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

    <!-- 객실 상태 패널 -->
    <div class="w-96 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
      <div class="pb-4 border-b mb-4">
        <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="pi pi-calendar text-blue-600"></i>
          {{ selectedDate }}
        </h4>
        <p class="text-sm text-gray-600 mt-1">객실 가용 현황</p>
      </div>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-blue-600"></i>
          <p class="text-sm text-gray-500 mt-3">데이터 로딩 중...</p>
        </div>
      </div>

      <div v-else-if="selectedDayData && selectedDayData.rooms.length > 0" class="flex-1 overflow-y-auto space-y-3">
        <div
          v-for="room in selectedDayData.rooms"
          :key="room.type"
          class="p-4 rounded-xl border-2 transition-all hover:shadow-md"
          :class="getRoomBorderClass(room)"
        >
          <div class="flex items-center justify-between mb-3">
            <h5 class="font-bold text-gray-900">{{ room.type }}</h5>
            <span
              class="px-3 py-1 rounded-full text-sm font-bold"
              :class="getRoomBadgeClass(room)"
            >
              {{ getRoomPercentage(room) }}%
            </span>
          </div>

          <div class="flex items-center justify-between text-sm mb-3">
            <span class="text-gray-600">사용 가능</span>
            <span class="font-bold text-gray-900">
              {{ room.available }}개 / {{ room.total }}개
            </span>
          </div>

          <!-- 프로그레스 바 -->
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full transition-all"
              :class="getRoomProgressClass(room)"
              :style="{ width: getRoomPercentage(room) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <i class="pi pi-inbox text-5xl text-gray-300"></i>
          <p class="text-sm text-gray-500 mt-3">객실 정보가 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths } from 'date-fns';
import { apiClient } from '@/utils/axiosClient';

interface RoomData {
  type: string;
  available: number;
  total: number;
}

interface DayData {
  date: string;
  rooms: RoomData[];
}

const loading = ref(false);
const currentDate = ref(new Date());
const selectedDate = ref('');
const allDays = ref<Record<string, DayData>>({});
const roomTypeTotals = ref<Record<string, number>>({});

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

const selectedDayData = computed(() => {
  return allDays.value[selectedDate.value] || null;
});

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

function changeMonth(delta: number) {
  currentDate.value = addMonths(currentDate.value, delta);
  selectDate(format(startOfMonth(currentDate.value), 'yyyy-MM-dd'));
}

function selectDate(dateStr: string) {
  selectedDate.value = dateStr;
}

function getColorClass(dateStr: string): string {
  const day = allDays.value[dateStr];
  if (!day || day.rooms.length === 0) return 'bg-gray-200 text-gray-700';

  const totalAvailable = day.rooms.reduce((s, r) => s + r.available, 0);
  const totalRooms = day.rooms.reduce((s, r) => s + r.total, 0);
  if (totalRooms === 0) return 'bg-gray-200 text-gray-700';

  const ratio = (totalAvailable / totalRooms) * 100;

  if (ratio === 100) return 'bg-green-500 text-white';
  if (ratio >= 80) return 'bg-green-300 text-gray-900';
  if (ratio >= 60) return 'bg-yellow-300 text-gray-900';
  if (ratio >= 40) return 'bg-orange-300 text-gray-900';
  if (ratio >= 20) return 'bg-orange-500 text-white';
  if (ratio > 0) return 'bg-red-400 text-white';
  return 'bg-red-700 text-white';
}

function getRoomBorderClass(room: RoomData): string {
  const ratio = getRoomPercentage(room);
  if (ratio === 100) return 'border-green-300 bg-green-50';
  if (ratio >= 80) return 'border-green-200 bg-green-50';
  if (ratio >= 60) return 'border-yellow-200 bg-yellow-50';
  if (ratio >= 40) return 'border-orange-200 bg-orange-50';
  if (ratio >= 20) return 'border-orange-300 bg-orange-50';
  if (ratio > 0) return 'border-red-200 bg-red-50';
  return 'border-red-300 bg-red-50';
}

function getRoomBadgeClass(room: RoomData): string {
  const ratio = getRoomPercentage(room);
  if (ratio === 100) return 'bg-green-500 text-white';
  if (ratio >= 80) return 'bg-green-400 text-white';
  if (ratio >= 60) return 'bg-yellow-400 text-gray-900';
  if (ratio >= 40) return 'bg-orange-400 text-white';
  if (ratio >= 20) return 'bg-orange-500 text-white';
  if (ratio > 0) return 'bg-red-400 text-white';
  return 'bg-red-600 text-white';
}

function getRoomProgressClass(room: RoomData): string {
  const ratio = getRoomPercentage(room);
  if (ratio === 100) return 'bg-green-500';
  if (ratio >= 80) return 'bg-green-400';
  if (ratio >= 60) return 'bg-yellow-400';
  if (ratio >= 40) return 'bg-orange-400';
  if (ratio >= 20) return 'bg-orange-500';
  if (ratio > 0) return 'bg-red-400';
  return 'bg-red-600';
}

function getRoomPercentage(room: RoomData): number {
  if (!room.total) return 0;
  return Math.round((room.available / room.total) * 100);
}

async function fetchYear(year: number) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { data } = await apiClient.get('/v1/statistics/rooms/availability', {
    params: { startDate: start, endDate: end },
  });

  (data || []).forEach((d: any) => {
    const dateStr: string = d.date;
    const rooms: RoomData[] = (d.rooms || []).map((r: any) => {
      const type = String(r.roomType);
      const available = Number(r.available ?? 0);
      const total = Number(r.total ?? 0);
      roomTypeTotals.value[type] = Math.max(roomTypeTotals.value[type] ?? 0, total);
      return { type, available, total };
    });
    allDays.value[dateStr] = { date: dateStr, rooms };
  });
}

async function preloadSevenYears() {
  const nowYear = new Date().getFullYear();
  const startYear = nowYear - 3;
  const endYear = nowYear + 3;

  await Promise.all(
    Array.from({ length: endYear - startYear + 1 }, (_, i) => fetchYear(startYear + i))
  );

  const from = new Date(startYear, 0, 1);
  const to = new Date(endYear, 11, 31);
  const dates = [];
  let current = from;

  while (current <= to) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }

  const types = Object.keys(roomTypeTotals.value);
  for (const dateStr of dates) {
    if (!allDays.value[dateStr]) {
      allDays.value[dateStr] = types.length === 0
        ? { date: dateStr, rooms: [] }
        : {
          date: dateStr,
          rooms: types.map((t) => {
            const total = roomTypeTotals.value[t] ?? 0;
            return { type: t, available: total, total };
          }),
        };
    }
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await preloadSevenYears();
    selectedDate.value = format(startOfMonth(currentDate.value), 'yyyy-MM-dd');
  } catch (e) {
    console.error('데이터 로드 실패:', e);
  } finally {
    loading.value = false;
  }
});
</script>
