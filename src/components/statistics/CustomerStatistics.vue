<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex flex-col gap-6">
      <!-- KPI 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 신규 고객 수 -->
        <KpiCard
          title="오늘 신규 고객 수"
          :value="todayNewGuests"
          icon="pi-user-plus"
          :change="newGuestGrowthRate"
          subtitle="전일 대비"
          color="blue"
        />

        <!-- 재방문 고객 수 -->
        <KpiCard
          title="오늘 재방문 고객 수"
          :value="todayReturnGuests"
          icon="pi-users"
          :change="returnGuestGrowthRate"
          subtitle="전일 대비"
          color="green"
        />

        <!-- 평균 체류 기간 -->
        <KpiCard
          title="이번 달 평균 체류 기간"
          :value="avgStayDuration + '일'"
          icon="pi-calendar"
          :change="stayDurationGrowthRate"
          subtitle="전월 대비"
          color="purple"
        />
      </div>

      <!-- 필터 바 -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap items-center gap-4"
      >
        <div class="flex items-center space-x-2 text-gray-700">
          <i class="pi pi-filter text-gray-400"></i>
          <span class="text-sm font-medium">기간 선택</span>
        </div>
        <Calendar
          v-model="dateRange"
          selectionMode="range"
          showIcon
          placeholder="기간 선택"
          class="min-w-[14rem]"
        />
        <button
          @click="resetDateRange"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-refresh mr-2"></i>
          초기화
        </button>
      </div>

      <!-- 고객 차트 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 회원 vs 비회원 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 class="text-lg font-bold text-gray-900 mb-4">회원 vs 비회원 고객 비율</h3>
          <div class="flex-1 h-72">
            <Chart type="doughnut" :data="memberRatioData" :options="guestRatioOptions" />
          </div>
        </div>

        <!-- 신규 vs 재방문 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 class="text-lg font-bold text-gray-900 mb-4">신규 vs 재방문 고객 비율</h3>
          <div class="flex-1 h-72">
            <!-- ✅ % 표시 포함된 doughnutOptions 적용 -->
            <Chart type="doughnut" :data="guestRatioData" :options="guestRatioOptions" />
          </div>
        </div>

        <!-- 체류 기간 분포 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 class="text-lg font-bold text-gray-900 mb-4">체류 기간 분포</h3>
          <div class="flex-1 h-72">
            <Chart type="bar" :data="stayDurationData" :options="barOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Calendar from 'primevue/calendar';
import Chart from 'primevue/chart';
import KpiCard from './KpiCard.vue';
import { apiClient } from '@/utils/axiosClient.ts';

// 🔹 상태값
const dateRange = ref<[Date, Date] | null>(null);

// KPI 데이터
const todayNewGuests = ref(0);
const newGuestGrowthRate = ref(0);

const todayReturnGuests = ref(0);
const returnGuestGrowthRate = ref(0);

const avgStayDuration = ref(0);
const stayDurationGrowthRate = ref(0);

// 신규 vs 재방문 고객 차트
const guestRatioData = ref<any>({
  labels: ['신규 고객', '재방문 고객'],
  datasets: [
    {
      data: [0, 0], // 초기값
      backgroundColor: ['#3b82f6', '#10b981'],
    },
  ],
});

// 체류 기간 분포 차트
const stayDurationData = ref<any>({
  labels: ['1일', '2일', '3일', '4일', '5일', '6일+'],
  datasets: [
    {
      label: '체류 고객 수',
      data: [0, 0, 0, 0, 0, 0], // 초기값
      backgroundColor: 'rgba(59,130,246,0.8)',
    },
  ],
});

// 회원 vs 비회원 고객 차트
const memberRatioData = ref<any>({
  labels: ['회원', '비회원'],
  datasets: [
    {
      data: [0, 0],
      backgroundColor: ['#6366f1', '#f59e0b'],
    },
  ],
});

// 🔹 이번 달 기본값으로 세팅
function setThisMonthRange() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  dateRange.value = [firstDay, lastDay];
}

// 🔹 초기화 버튼
function resetDateRange() {
  setThisMonthRange();
}

// 🔹 신규 vs 재방문 고객 차트 옵션 (% 표시)
const guestRatioOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        generateLabels: function (chart: any) {
          const data = chart.data;
          if (!data.datasets.length) return [];

          const dataset = data.datasets[0];
          const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);

          return data.labels.map((label: string, i: number) => {
            const value = dataset.data[i];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return {
              text: `${label} (${percentage}%)`,
              fillStyle: dataset.backgroundColor[i],
              hidden: !chart.getDataVisibility(i),
              index: i,
            };
          });
        },
      },
      onClick: (e: any, legendItem: any, legend: any) => {
        const index = legendItem.index;
        const ci = legend.chart;
        ci.toggleDataVisibility(index);
        ci.update();
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const dataset = context.dataset;
          const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
          const value = dataset.data[context.dataIndex];
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${context.label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

// 🔹 내보내기 CSV
function exportToCSV() {
  const rows: any[] = [];
  rows.push([
    '오늘 신규 고객 수',
    todayNewGuests.value,
    '전일 대비',
    newGuestGrowthRate.value + '%',
  ]);
  rows.push([
    '오늘 재방문 고객 수',
    todayReturnGuests.value,
    '전일 대비',
    returnGuestGrowthRate.value + '%',
  ]);
  rows.push([
    '이번 달 평균 체류 기간',
    avgStayDuration.value + '일',
    '전월 대비',
    stayDurationGrowthRate.value + '%',
  ]);
  rows.push([]);
  rows.push(['고객 유형', '비율']);
  guestRatioData.value.labels.forEach((label: string, idx: number) => {
    rows.push([label, guestRatioData.value.datasets[0].data[idx]]);
  });
  rows.push([]);
  rows.push(['체류 일수', '고객 수']);
  stayDurationData.value.labels.forEach((label: string, idx: number) => {
    rows.push([label, stayDurationData.value.datasets[0].data[idx]]);
  });

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'customer_statistics.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 📌 API 연동 함수들
async function fetchTodayNewGuests() {
  try {
    const { data } = await apiClient.get('/v1/statistics/customers/new/today');
    todayNewGuests.value = data.todayNewGuests;
    newGuestGrowthRate.value = data.growthRate;
  } catch (err) {
    console.error('📌 신규 고객 수 데이터 불러오기 실패:', err);
  }
}

async function fetchTodayReturnGuests() {
  try {
    const { data } = await apiClient.get('/v1/statistics/customers/return/today');
    todayReturnGuests.value = data.todayReturnGuests;
    returnGuestGrowthRate.value = data.growthRate;
  } catch (err) {
    console.error('📌 재방문 고객 수 데이터 불러오기 실패:', err);
  }
}

async function fetchAvgStayDuration() {
  try {
    const { data } = await apiClient.get('/v1/statistics/customers/stay-duration/monthly');
    avgStayDuration.value = Number(data.avgStayDuration.toFixed(1));
    stayDurationGrowthRate.value = Number(data.growthRate.toFixed(1));
  } catch (err) {
    console.error('📌 평균 체류 기간 데이터 불러오기 실패:', err);
  }
}

async function fetchGuestRatio() {
  if (!dateRange.value || dateRange.value.length < 2) return;

  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  try {
    const { data } = await apiClient.get('/v1/statistics/customers/ratio', {
      params: { startDate, endDate },
    });

    guestRatioData.value.datasets[0].data = [data.newGuests, data.returnGuests];
  } catch (err) {
    console.error('📌 신규 vs 재방문 고객 비율 불러오기 실패:', err);
  }
}

async function fetchStayDurationDistribution() {
  if (!dateRange.value || dateRange.value.length < 2) return;

  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  try {
    const { data } = await apiClient.get('/v1/statistics/customers/stay-duration/distribution', {
      params: { startDate, endDate },
    });

    const allLabels = ['1일', '2일', '3일', '4일', '5일', '6일+'];
    const counts: Record<string, number> = {};
    data.forEach((d: any) => {
      counts[d.label] = d.count;
    });

    stayDurationData.value = {
      labels: allLabels,
      datasets: [
        {
          label: '체류 고객 수',
          data: allLabels.map((l) => counts[l] || 0),
          backgroundColor: 'rgba(59,130,246,0.8)',
        },
      ],
    };
  } catch (err) {
    console.error('📌 체류 기간 분포 데이터 불러오기 실패:', err);
  }
}

async function fetchMemberRatio() {
  if (!dateRange.value || dateRange.value.length < 2) return;

  const [start, end] = dateRange.value;
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  try {
    const { data } = await apiClient.get('/v1/statistics/customers/member-ratio', {
      params: { startDate, endDate },
    });
    memberRatioData.value.datasets[0].data = [data.members, data.nonMembers];
  } catch (err) {
    console.error('📌 회원 vs 비회원 고객 비율 불러오기 실패:', err);
  }
}

defineExpose({ exportToCSV });

// 📌 날짜 변경 감시
watch(dateRange, async () => {
  await fetchGuestRatio();
  await fetchStayDurationDistribution();
  await fetchMemberRatio();
});

// 📌 초기 로딩
onMounted(async () => {
  setThisMonthRange();
  await fetchTodayNewGuests();
  await fetchTodayReturnGuests();
  await fetchAvgStayDuration();
  await fetchGuestRatio();
  await fetchStayDurationDistribution();
  await fetchMemberRatio();
});
</script>
