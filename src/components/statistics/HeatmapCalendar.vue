<script setup lang="ts">
import { ref, onMounted } from "vue";
import Dialog from "primevue/dialog";
import { format, addDays } from "date-fns";
import { apiClient } from "@/utils/axiosClient";

interface RoomData {
  type: string;
  available: number;
  total: number;
}
interface DayData {
  date: string; // yyyy-MM-dd
  rooms: RoomData[];
}

/* =========================
   상태
========================= */
const showDialog = ref(false);
const selectedDay = ref<DayData | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

// ✅ 7년치(현재 연도 -3 ~ +3) 전체 데이터 맵 (yyyy-MM-dd → DayData)
const allDays = ref<Record<string, DayData>>({});

// ✅ 관찰된 객실 타입별 총 객실 수의 최댓값 (빈 날짜 채우기용)
const roomTypeTotals = ref<Record<string, number>>({});

/* =========================
   유틸
========================= */
function fmt(d: Date) {
  return format(d, "yyyy-MM-dd");
}

// 구간의 모든 날짜 문자열 생성
function makeDateRange(from: Date, to: Date): string[] {
  const out: string[] = [];
  let cur = new Date(from);
  while (cur <= to) {
    out.push(fmt(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/* =========================
   백엔드 호출
========================= */
// 1년치 데이터 로드 → allDays/roomTypeTotals 갱신
async function fetchYear(year: number) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { data } = await apiClient.get("/v1/statistics/rooms/availability", {
    params: { startDate: start, endDate: end },
  });

  (data || []).forEach((d: any) => {
    const dateStr: string = d.date;
    const rooms: RoomData[] = (d.rooms || []).map((r: any) => {
      const type = String(r.roomType);
      const available = Number(r.available ?? 0);
      const total = Number(r.total ?? 0);
      // 타입별 최대 total 갱신
      roomTypeTotals.value[type] = Math.max(roomTypeTotals.value[type] ?? 0, total);
      return { type, available, total };
    });
    allDays.value[dateStr] = { date: dateStr, rooms };
  });
}

// 현재 연도 기준 -3 ~ +3년(총 7년) 병렬 로드
async function preloadSevenYears() {
  const nowYear = new Date().getFullYear();
  const startYear = nowYear - 3;
  const endYear = nowYear + 3;
  await Promise.all(
    Array.from({ length: endYear - startYear + 1 }, (_, i) => fetchYear(startYear + i))
  );

  // 전체 날짜 범위를 선 채움 (available = total)
  const from = new Date(startYear, 0, 1);
  const to = new Date(endYear, 11, 31);
  const dates = makeDateRange(from, to);

  const types = Object.keys(roomTypeTotals.value);
  for (const dateStr of dates) {
    if (!allDays.value[dateStr]) {
      // 예약 데이터 없는 날짜 → available = total 로 채움
      allDays.value[dateStr] =
        types.length === 0
          ? { date: dateStr, rooms: [] } // (극초기) 타입 정보 없을 때는 회색
          : {
            date: dateStr,
            rooms: types.map((t) => {
              const total = roomTypeTotals.value[t] ?? 0;
              return { type: t, available: total, total };
            }),
          };
    } else {
      // 데이터는 있으나 total 누락 타입이 있다면 보정(선택 사항)
      if (types.length) {
        const have = new Set(allDays.value[dateStr].rooms.map((r) => r.type));
        const missing = types.filter((t) => !have.has(t));
        if (missing.length) {
          allDays.value[dateStr].rooms.push(
            ...missing.map((t) => {
              const total = roomTypeTotals.value[t] ?? 0;
              return { type: t, available: total, total };
            })
          );
        }
      }
    }
  }
}

/* =========================
   히트맵 색상 / 팝업
========================= */
function getColorByDateStr(dateStr: string): string {
  const day = allDays.value[dateStr];
  if (!day || day.rooms.length === 0) return "bg-gray-200";

  const totalAvailable = day.rooms.reduce((s, r) => s + r.available, 0);
  const totalRooms = day.rooms.reduce((s, r) => s + r.total, 0);
  if (totalRooms === 0) return "bg-gray-200";

  const ratio = (totalAvailable / totalRooms) * 100;
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
  else selectedDay.value = { date: dateStr, rooms: [] };
  showDialog.value = true;
}

/* ✅ 팝업 뱃지 색상: 객실 유형별 가용률 기준 */
function getRoomBadgeClass(room: RoomData): string {
  const total = Number(room.total ?? 0);
  const avail = Number(room.available ?? 0);
  if (!total || total <= 0) return "bg-gray-200 text-gray-700";

  const ratio = (avail / total) * 100;

  // 히트맵과 동일 레벨로 맞춤
  if (ratio === 100) return "bg-green-100 text-green-700";
  if (ratio >= 80) return "bg-green-200 text-green-700";
  if (ratio >= 60) return "bg-yellow-100 text-yellow-700";
  if (ratio >= 40) return "bg-orange-100 text-orange-700";
  if (ratio >= 20) return "bg-orange-200 text-orange-700";
  if (ratio > 0) return "bg-red-100 text-red-700";
  return "bg-red-200 text-red-800";
}

/* =========================
   초기 로드
========================= */
onMounted(async () => {
  loading.value = true;
  errorMsg.value = null;
  try {
    await preloadSevenYears();
  } catch (e: any) {
    console.error("7년치 선로드 실패:", e);
    errorMsg.value = "데이터 로드 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <!-- 로딩/에러는 캘린더와 독립적으로 표시 -->
  <div v-if="errorMsg" class="mb-2 text-red-600 text-sm">{{ errorMsg }}</div>
  <div v-if="loading" class="mb-2 text-gray-500 text-sm">데이터 불러오는 중...</div>

  <VCalendar
    is-expanded
    title-position="center"
    class="w-full h-[800px]"
  >
    <template #day-content="{ day }">
      <div
        class="w-20 h-20 flex items-center justify-center rounded-lg cursor-pointer transition text-gray-900 font-bold"
        :class="getColorByDateStr(format(day.date, 'yyyy-MM-dd'))"
        @click="openDialogByDateStr(format(day.date, 'yyyy-MM-dd'))"
      >
        {{ day.day }}
      </div>
    </template>
  </VCalendar>

  <!-- 팝업 -->
  <Dialog v-model:visible="showDialog" modal header="객실 가용 정보" :style="{ width: '420px' }">
    <div v-if="selectedDay">
      <p class="font-bold mb-4 text-lg">📅 {{ selectedDay.date }}</p>
      <ul class="space-y-2">
        <li
          v-for="room in selectedDay.rooms"
          :key="room.type"
          class="flex justify-between items-center p-2 rounded border bg-gray-50"
        >
          <span class="font-medium">{{ room.type }}</span>

          <!-- ✅ 가용률 기반 색상 뱃지 -->
          <span
            class="px-2 py-1 rounded text-sm font-semibold"
            :class="getRoomBadgeClass(room)"
          >
            <!-- 가용률 %도 함께 표시 (가독성 향상) -->
            사용 가능 {{ room.available }}개 / 전체 {{ room.total }}개
            <span class="ml-1 opacity-70">
              ({{ room.total ? Math.round((room.available / room.total) * 100) : 0 }}%)
            </span>
          </span>
        </li>
      </ul>
    </div>
  </Dialog>
</template>
