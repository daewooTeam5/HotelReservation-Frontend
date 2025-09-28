<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex flex-col gap-6">

      <!-- 상단 내보내기 버튼 -->
      <div class="flex justify-end">
        <button
          @click="exportAllCSV"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-download mr-2"></i>
          전체 내보내기
        </button>
      </div>

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
          :value="occupancyRate.toFixed(1) + '%'"
          icon="pi-chart-pie"
          subtitle="현재 기준"
          color="green"
        />
      </div>

      <!-- 📌 메인 그리드 레이아웃 (캘린더 + 객실 상태 분포) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 캘린더 (왼쪽 2칸, 2행 차지) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-3 px-2 col-span-2 row-span-2">
          <h3 class="text-lg font-bold text-gray-900 text-center mb-4">
            객실 가용률 캘린더
          </h3>
          <div class="w-full h-[800px] flex items-center justify-center">
            <HeatmapCalendar :data="availabilityData" class="w-full h-full" />
          </div>
        </div>

        <!-- 오른쪽: 객실 상태 분포 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">객실 상태 분포</h3>
          <Chart type="doughnut" :data="roomStatusData" :options="chartOptions" class="h-72" />
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
import { ref, onMounted, watch } from "vue";
import Chart from "primevue/chart";
import Dropdown from "primevue/dropdown";
import KpiCard from "./KpiCard.vue";
import HeatmapCalendar from "./HeatmapCalendar.vue";
import { apiClient } from "@/utils/axiosClient.ts";

// KPI 데이터
const totalRooms = ref(0);
const occupancyRate = ref(0);

// 객실 가용률 캘린더 데이터
interface RoomData {
  roomType: string;
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
    y: { // 예약 건수
      beginAtZero: true,
      position: "left",
      title: { display: true, text: "예약 건수 (건)" }
    },
    y1: { // 매출액
      beginAtZero: true,
      position: "right",
      title: { display: true, text: "매출액 (원)" },
      grid: { drawOnChartArea: false },
      ticks: {
        callback: (value: number) => value.toLocaleString() // 1000단위 콤마
      }
    },
    y2: { // 객실 점유율
      beginAtZero: true,
      position: "right",
      offset: true, // ✅ y1과 겹치지 않도록
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

// API 호출
async function fetchRoomSummary() {
  const { data } = await apiClient.get("/v1/statistics/rooms/summary");
  totalRooms.value = data.totalRooms;
  occupancyRate.value = data.occupancyRate;
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
  // 예: { available: 2, reserved: 1, cleaning: 0, availableTypes: ["스탠다드", "디럭스"] }

  roomStatusData.value.datasets[0].data = [
    data.available || 0,
    data.reserved || 0,
    data.cleaning || 0,
  ];
  availableTypes.value = data.availableTypes || [];
}

// 🔹 API 호출
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
      // ✅ 요일 라벨 고정
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
      // ✅ 1월~12월 라벨 고정
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
      // ✅ 최근 5년 고정 (원하는 기간 조정 가능)
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
      // ✅ 기타 (백엔드 그대로)
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
function exportAllCSV() {
  let csv = "";

  // KPI
  csv += "=== KPI ===\n";
  csv += `전체 객실 수,${totalRooms.value}\n`;
  csv += `객실 점유율,${occupancyRate.value.toFixed(1)}%\n\n`;

  // 객실 가용률 캘린더
  csv += "=== 객실 가용률 캘린더 ===\n";
  csv += "날짜,타입,사용 가능/전체\n";
  availabilityData.value.forEach((d) => {
    d.rooms.forEach((r) => {
      csv += `${d.date},${r.roomType},${r.available}/${r.total}\n`; // ✅ 수정
    });
  });
  csv += "\n";

  // 객실 상태 분포
  csv += "=== 객실 상태 분포 ===\n";
  roomStatusData.value.labels.forEach((label: string, i: number) => {
    csv += `${label},${roomStatusData.value.datasets[0].data[i]}\n`;
  });
  csv += "\n";

  // 피크 시즌 분석
  csv += `=== 피크 시즌 분석 (${peakType.value}) ===\n`;
  csv += "구분,예약 건수,매출액,객실 점유율(%)\n";

  const counts = peakSeasonData.value.datasets[0]?.data || [];
  const revenues = peakSeasonData.value.datasets[1]?.data || [];
  const occupancies = peakSeasonData.value.datasets[2]?.data || [];

  peakSeasonData.value.labels.forEach((label: string, i: number) => {
    csv += `${label},${counts[i]},${revenues[i]},${occupancies[i]}\n`;
  });

  // 다운로드
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "room-statistics.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

watch(peakType, fetchPeakSeason);

onMounted(async () => {
  await fetchRoomSummary();
  await fetchAvailability();
  await fetchRoomStatus();
  await fetchPeakSeason();
});
</script>
