<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex flex-col gap-6">
      <!-- KPI 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard
          title="전체 객실 수"
          :value="totalRooms"
          icon="pi-home"
          subtitle="등록된 객실"
          color="blue"
        />
        <KpiCard
          title="객실 점유율"
          :value="occupancyRate + '%'"
          icon="pi-chart-pie"
          subtitle="현재 기준"
          color="green"
        />
      </div>

      <!-- 📌 캘린더 영역 (가로 전체) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-6 px-4">
        <div class="w-full">
          <div class="w-full h-auto flex items-center justify-center">
            <!-- HeatmapCalendar 컴포넌트 내용 -->
            <div class="flex gap-6 h-full w-full">
              <!-- 달력 영역 -->
              <div class="flex-1 flex flex-col">
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
                      @click="selectDate(day.dateStr)"
                      class="w-full h-full min-h-[80px] rounded-lg font-semibold transition-all border-2 flex items-center justify-center text-base"
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

              <!-- 객실 상태 패널 -->
              <div class="w-96 bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col gap-3">
                <div class="pb-4 border-b mb-4">
                  <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <i class="pi pi-calendar text-blue-600"></i>
                    {{ selectedDate }}
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">객실 가용 현황</p>
                </div>

                <div v-if="calendarLoading" class="flex-1 flex items-center justify-center">
                  <div class="text-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-blue-600"></i>
                    <p class="text-sm text-gray-500 mt-3">데이터 로딩 중...</p>
                  </div>
                </div>

                <div v-else-if="selectedDayData && selectedDayData.rooms.length > 0" class="flex-1 overflow-y-auto space-y-4 flex flex-col gap-3">
                  <div
                    v-for="room in selectedDayData.rooms"
                    :key="room.type"
                    class="p-5 rounded-xl border-2 transition-all hover:shadow-md bg-white"
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
          </div>
        </div>
      </div>

      <!-- 피크 시즌 분석 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-bold text-gray-900">피크 시즌 분석</h3>
          <select v-model="peakType" class="border rounded px-3 py-1 text-sm">
            <option value="weekday">요일별 패턴</option>
            <option value="monthly_pattern">월별 패턴</option>
            <option value="yearly_pattern">연도별 패턴</option>
          </select>
        </div>
        <div class="flex-1 h-80">
          <Chart type="bar" :data="peakSeasonData" :options="mixedOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import Chart from "primevue/chart";
import Dropdown from "primevue/dropdown";
import KpiCard from "./KpiCard.vue";
import { apiClient } from "@/utils/axiosClient.ts";
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths } from 'date-fns';

// KPI 데이터
const totalRooms = ref(0);
const occupancyRate = ref(0);

// 캘린더 관련 상태
const calendarLoading = ref(false);
const currentDate = ref(new Date());
const selectedDate = ref('');
const allDays = ref<Record<string, DayData>>({});
const roomTypeTotals = ref<Record<string, number>>({});

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const showDatePicker = ref(false);
const pickerYear = ref(new Date().getFullYear());

const yearOptions = computed(() => {
  const nowYear = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, i) => nowYear - 3 + i);
});

const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i + 1);
});

const selectedDayData = computed(() => {
  return allDays.value[selectedDate.value] || null;
});

// 객실 가용률 캘린더 데이터
interface RoomData {
  type: string;
  available: number;
  total: number;
}
interface DayData {
  date: string;
  rooms: RoomData[];
}
const availabilityData = ref<DayData[]>([]);

// 객실 상태 분포 데이터
const roomStatusData = ref<any>({
  labels: ["예약 가능", "매진", "청소 중"],
  datasets: [
    {
      data: [0, 0, 0],
      backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
    },
  ],
});

const availableTypes = ref<string[]>([]);

// 🔹 상태
const peakType = ref("weekday");
const peakSeasonData = ref<any>({ labels: [], datasets: [] });

// 🔹 옵션 (혼합형)
const mixedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  scales: {
    y: {
      beginAtZero: true,
      position: "left",
      title: { display: true, text: "예약 건수 (건)" }
    },
    y1: {
      beginAtZero: true,
      position: "right",
      title: { display: true, text: "매출액 (원)" },
      grid: { drawOnChartArea: false },
      ticks: {
        callback: (value: number) => value.toLocaleString()
      }
    },
    y2: {
      beginAtZero: true,
      position: "right",
      offset: true,
      title: { display: true, text: "객실 점유율 (%)" },
      min: 0,
      max: 100,
      grid: { drawOnChartArea: false }
    }
  }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.raw;

          if (label === "예약 가능" && availableTypes.value.length > 0) {
            return `${label}: ${value}개 (${availableTypes.value.join(", ")})`;
          }
          return `${label}: ${value}개`;
        },
      },
    },
  },
};

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
  selectedYear.value = currentDate.value.getFullYear();
  selectedMonth.value = currentDate.value.getMonth() + 1;
  pickerYear.value = selectedYear.value;
  selectDate(format(startOfMonth(currentDate.value), 'yyyy-MM-dd'));
}

function changePickerYear(delta: number) {
  pickerYear.value += delta;
}

function selectMonthYear(month: number) {
  selectedMonth.value = month;
  selectedYear.value = pickerYear.value;
  currentDate.value = new Date(selectedYear.value, selectedMonth.value - 1, 1);
  selectDate(format(startOfMonth(currentDate.value), 'yyyy-MM-dd'));
  showDatePicker.value = false;
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

// API 호출 함수들
async function fetchRoomSummary() {
  const { data } = await apiClient.get("/v1/statistics/rooms/summary");
  totalRooms.value = data.totalRooms;
  occupancyRate.value = Math.round(data.occupancyRate * 100) / 100;
}

async function fetchAvailability() {
  const { data } = await apiClient.get("/v1/statistics/rooms/availability");

  availabilityData.value = data.map((d: any) => ({
    date: d.date,
    rooms: d.rooms.map((r: any) => ({
      type: r.roomType,
      available: r.available,
      total: r.total,
    })),
  }));

  console.log("가공된 availabilityData", availabilityData.value);
}

async function fetchRoomStatus() {
  const { data } = await apiClient.get("/v1/statistics/rooms/status");

  roomStatusData.value.datasets[0].data = [
    data.available || 0,
    data.reserved || 0,
    data.cleaning || 0,
  ];
  availableTypes.value = data.availableTypes || [];
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

async function fetchPeakSeason() {
  try {
    const { data } = await apiClient.get("/v1/statistics/rooms/peak/pattern", {
      params: { type: peakType.value }
    });

    let labels: string[] = [];
    let counts: number[] = [];
    let revenues: number[] = [];
    let occupancies: number[] = [];

    if (peakType.value === "weekday") {
      const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];
      const dataMap = new Map(
        data.map((d: any) => [d.label, { count: d.count, revenue: d.revenue, occupancy: d.occupancy }])
      );

      labels = weekLabels;
      counts = weekLabels.map(label => dataMap.get(label)?.count || 0);
      revenues = weekLabels.map(label => dataMap.get(label)?.revenue || 0);
      occupancies = weekLabels.map(label => dataMap.get(label)?.occupancy || 0);
    }
    else if (peakType.value === "monthly_pattern") {
      const monthLabels = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
      const dataMap = new Map(
        data.map((d: any) => [d.label.replace(/^0/, ""), { count: d.count, revenue: d.revenue, occupancy: d.occupancy }])
      );

      labels = monthLabels;
      counts = monthLabels.map(label => dataMap.get(label.replace("월",""))?.count || 0);
      revenues = monthLabels.map(label => dataMap.get(label.replace("월",""))?.revenue || 0);
      occupancies = monthLabels.map(label => dataMap.get(label.replace("월",""))?.occupancy || 0);
    }
    else if (peakType.value === "yearly_pattern") {
      const currentYear = new Date().getFullYear();
      const yearLabels = Array.from({ length: 5 }, (_, i) => `${currentYear - 4 + i}년`);
      const dataMap = new Map(
        data.map((d: any) => [d.label, { count: d.count, revenue: d.revenue, occupancy: d.occupancy }])
      );

      labels = yearLabels;
      counts = yearLabels.map(label => dataMap.get(label.replace("년",""))?.count || 0);
      revenues = yearLabels.map(label => dataMap.get(label.replace("년",""))?.revenue || 0);
      occupancies = yearLabels.map(label => dataMap.get(label.replace("년",""))?.occupancy || 0);
    }
    else {
      labels = data.map((d: any) => d.label);
      counts = data.map((d: any) => d.count);
      revenues = data.map((d: any) => d.revenue);
      occupancies = data.map((d: any) => d.occupancy);
    }

    peakSeasonData.value = {
      labels,
      datasets: [
        {
          label: "예약 건수",
          type: "bar",
          data: counts,
          backgroundColor: "rgba(59,130,246,0.8)",
          yAxisID: "y"
        },
        {
          label: "매출액",
          type: "bar",
          data: revenues,
          backgroundColor: "rgba(16,185,129,0.8)",
          yAxisID: "y1"
        },
        {
          label: "객실 점유율 (%)",
          type: "line",
          data: occupancies,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.3)",
          fill: false,
          yAxisID: "y2"
        }
      ]
    };
  } catch (err) {
    console.error("📌 피크 시즌 데이터 불러오기 실패:", err);
  }
}

// 전체 CSV 내보내기
function exportToCSV() {
  let csv = "";

  csv += "=== KPI ===\n";
  csv += `전체 객실 수,${totalRooms.value}\n`;
  csv += `객실 점유율,${occupancyRate.value}%\n\n`;

  csv += "=== 객실 가용률 캘린더 ===\n";
  csv += "날짜,타입,사용 가능/전체\n";
  availabilityData.value.forEach((d) => {
    d.rooms.forEach((r) => {
      csv += `${d.date},${r.type},${r.available}/${r.total}\n`;
    });
  });
  csv += "\n";

  csv += "=== 객실 상태 분포 ===\n";
  roomStatusData.value.labels.forEach((label: string, i: number) => {
    csv += `${label},${roomStatusData.value.datasets[0].data[i]}\n`;
  });
  csv += "\n";

  csv += `=== 피크 시즌 분석 (${peakType.value}) ===\n`;
  csv += "구분,예약 건수,매출액,객실 점유율(%)\n";

  const counts = peakSeasonData.value.datasets[0]?.data || [];
  const revenues = peakSeasonData.value.datasets[1]?.data || [];
  const occupancies = peakSeasonData.value.datasets[2]?.data || [];

  peakSeasonData.value.labels.forEach((label: string, i: number) => {
    csv += `${label},${counts[i]},${revenues[i]},${occupancies[i]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "room-statistics.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

defineExpose({ exportToCSV });

watch(peakType, fetchPeakSeason);

onMounted(async () => {
  calendarLoading.value = true;
  try {
    await fetchRoomSummary();
    await fetchAvailability();
    await fetchRoomStatus();
    await preloadSevenYears();
    await fetchPeakSeason();
    selectedYear.value = currentDate.value.getFullYear();
    selectedMonth.value = currentDate.value.getMonth() + 1;
    pickerYear.value = selectedYear.value;
    selectedDate.value = format(startOfMonth(currentDate.value), 'yyyy-MM-dd');
  } catch (e) {
    console.error('데이터 로드 실패:', e);
  } finally {
    calendarLoading.value = false;
  }
});
</script>
