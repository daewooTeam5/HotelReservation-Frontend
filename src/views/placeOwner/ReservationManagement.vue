<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col gap-4">
    <!-- 헤더 -->
    <div class="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-12">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">예약 관리</h1>
          <p class="text-gray-600 mt-1">호텔 예약 현황을 관리하고 모니터링하세요</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-blue-50 px-4 py-2 rounded-lg">
            <span class="text-sm font-medium text-blue-700">총 {{ reservations.length }}건</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 검색 필터 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">검색 필터</h2>
        <button
          @click="showAdvanced = !showAdvanced"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
          </svg>
          {{ showAdvanced ? "간단히 보기" : "고급 검색" }}
        </button>
      </div>

      <!-- 기본 검색 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">예약 번호</label>
          <input
            v-model="search.reservationId"
            placeholder="예약 ID 입력"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">예약자 이름</label>
          <input
            v-model="search.userName"
            placeholder="이름 입력"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">예약 상태</label>
          <select
            v-model="search.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">전체</option>
            <option value="pending">대기</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
            <option value="checked_in">체크인</option>
            <option value="checked_out">체크아웃</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">결제 상태</label>
          <select
            v-model="search.paymentStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">전체</option>
            <option value="unpaid">미결제</option>
            <option value="paid">결제완료</option>
            <option value="refunded">환불</option>
            <option value="rejected">실패</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      <!-- 고급 검색 -->
      <div v-if="showAdvanced" class="border-t pt-4 mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">이메일</label>
            <input
              v-model="search.email"
              placeholder="이메일 입력"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">전화번호</label>
            <input
              v-model="search.phone"
              placeholder="전화번호 입력"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">객실 유형</label>
            <input
              v-model="search.roomType"
              placeholder="객실 유형 입력"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <!-- 금액 범위 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">금액 범위</label>
            <div class="flex gap-3">
              <input
                type="number"
                v-model="search.minAmount"
                placeholder="최소 금액"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <span class="flex items-center text-gray-500">~</span>
              <input
                type="number"
                v-model="search.maxAmount"
                placeholder="최대 금액"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
        </div>

        <!-- 날짜 범위 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- 체크인 ~ 체크아웃 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">체크인 ~ 체크아웃</label>
            <Calendar
              v-model="dateRange"
              selectionMode="range"
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="날짜 선택"
              class="w-full"
            />
          </div>

          <!-- 예약 생성일 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">예약 생성일</label>
            <Calendar
              v-model="createdRange"
              selectionMode="range"
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="날짜 선택"
              class="w-full"
            />
          </div>
        </div>

      <!-- 버튼 영역 -->
      <div class="flex flex-wrap items-center gap-3 pt-4 border-t">
        <button
          @click="fetchReservations"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          검색
        </button>
        <button
          v-if="hasSearchValues"
          @click="resetSearch"
          class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>

    <!-- 예약 목록 -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">예약 목록</h2>
        <div class="flex items-center gap-3">
          <!-- 새로고침 버튼 -->
          <button
            @click="handleRefresh"
            :disabled="loading"
            class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5l1 1" />
            </svg>
            <!-- 로딩 중일 때 스피너 -->
            <svg v-else class="animate-spin h-4 w-4 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            새로고침
          </button>

          <!-- 마지막 업데이트 시간 -->
          <span class="text-xs text-gray-500">
            {{ lastUpdated ? `${timeAgo} 전 업데이트됨` : "아직 업데이트 기록 없음" }}
          </span>

          <label class="text-sm font-medium text-gray-700">정렬:</label>
          <select
            v-model="sort"
            @change="fetchReservations"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="createdAt,desc">예약일 최신순</option>
            <option value="createdAt,asc">예약일 오래된순</option>
            <option value="resevStart,asc">체크인 빠른순</option>
            <option value="resevStart,desc">체크인 늦은순</option>
            <option value="finalAmount,asc">금액 낮은순</option>
            <option value="finalAmount,desc">금액 높은순</option>
          </select>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 정보</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약자</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일정</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="r in reservations" :key="r.reservationId" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">#{{ r.reservationId }}</div>
                <div class="text-sm text-gray-500">{{ r.roomType }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ r.guestName }}</div>
                <div class="flex items-center mt-1">
                    <span v-if="r.member" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      회원
                    </span>
                  <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      비회원
                    </span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="space-y-1">
                  <span :class="getStatusClass(r.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ translateStatus(r.status) }}
                  </span>
                <div>
                    <span :class="getPaymentStatusClass(r.paymentStatus)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ translatePaymentStatus(r.paymentStatus) }}
                    </span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div>
                <div>체크인: {{ formatDateTime(r.resevStart) }}</div>
                <div>체크아웃: {{ formatDateTime(r.resevEnd) }}</div>
                <div class="text-xs text-gray-400 mt-1">예약일: {{ formatDateTime(r.createdAt) }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ formatCurrency(r.finalAmount) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center gap-3">
                <router-link
                  :to="`/owner/reservations/${r.reservationId}`"
                  class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  상세
                </router-link>
                <button
                  @click="openEdit(r)"
                  class="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  수정
                </button>
                <button
                  @click="cancelReservation(r.reservationId)"
                  class="text-red-600 hover:text-red-700 font-medium transition-colors"
                  :disabled="r.status === 'cancelled'"
                >
                  취소
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 빈 상태 -->
      <div v-if="reservations.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">예약 데이터가 없습니다</h3>
        <p class="mt-1 text-sm text-gray-500">검색 조건을 변경해보세요.</p>
      </div>
    </div>

    <!-- 수정 다이얼로그 -->
    <ReservationEditDialog
      v-if="selectedReservation"
      :reservation="selectedReservation"
      @close="selectedReservation = null; fetchReservations()"
    />
  </div>

  <!-- 풀 페이징 네비게이션 -->
  <div class="flex justify-center items-center gap-2 p-4 border-t bg-gray-50">
    <!-- 이전 버튼 -->
    <button
      @click="goToPage(page - 1)"
      :disabled="page === 0"
      class="px-3 py-1 rounded border text-sm"
      :class="page === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'"
    >
      이전
    </button>

    <!-- 페이지 번호 -->
    <button
      v-for="p in visiblePages"
      :key="p"
      @click="goToPage(p)"
      class="px-3 py-1 rounded border text-sm"
      :class="p === page ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'"
    >
      {{ p + 1 }}
    </button>

    <!-- 다음 버튼 -->
    <button
      @click="goToPage(page + 1)"
      :disabled="page === totalPages - 1"
      class="px-3 py-1 rounded border text-sm"
      :class="page === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'"
    >
      다음
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { apiClient } from "@/utils/axiosClient";
import ReservationEditDialog from "./ReservationEditDialog.vue";
import { useAuthStore } from "@/stores/authStore.js";
import axios from "axios";

import {
  formatDateTime,
  formatCurrency,
  translateStatus,
  translatePaymentStatus,
} from "@/utils/placeOwner/formatters.js";

import Calendar from "primevue/calendar";

const reservations = ref([]);
const search = ref({
  reservationId: "",
  userName: "",
  email: "",
  phone: "",
  roomType: "",
  hotelName: "",
  status: "",
  paymentStatus: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  createdStartDate: "",
  createdEndDate: "",
});

const sort = ref("createdAt,desc");
const selectedReservation = ref(null);
const showAdvanced = ref(false);

// 날짜 관련
const dateRange = ref(null);
const createdRange = ref(null);

// 검색 값 확인
const hasSearchValues = computed(() => {
  return Object.values(search.value).some(v => v !== "") || dateRange.value || createdRange.value;
});

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// 날짜 범위 watch
watch(dateRange, (val) => {
  if (Array.isArray(val) && val.length === 2) {
    search.value.startDate = formatDate(val[0]);
    search.value.endDate = formatDate(val[1]);
  } else {
    search.value.startDate = "";
    search.value.endDate = "";
  }
});

watch(createdRange, (val) => {
  if (Array.isArray(val) && val.length === 2) {
    search.value.createdStartDate = formatDate(val[0]);
    search.value.createdEndDate = formatDate(val[1]);
  } else {
    search.value.createdStartDate = "";
    search.value.createdEndDate = "";
  }
});

// API
const page = ref(0);
const size = ref(10);
const totalPages = ref(0);

const lastUpdated = ref(null);
const loading = ref(false);
const timeAgo = ref("");

// 시간차 계산
const updateTimeAgo = () => {
  if (!lastUpdated.value) {
    timeAgo.value = "";
    return;
  }
  const diff = Math.floor((Date.now() - lastUpdated.value) / 1000);
  if (diff < 5) timeAgo.value = "방금";
  else if (diff < 60) timeAgo.value = `${diff}초`;
  else if (diff < 3600) timeAgo.value = `${Math.floor(diff / 60)}분`;
  else timeAgo.value = `${Math.floor(diff / 3600)}시간`;
};

// 예약 데이터 불러오기
const fetchReservations = async () => {
  try {
    const refreshClient = axios.create({
      baseURL: apiClient.defaults.baseURL,
      withCredentials: true,
    });
    const res1 = await refreshClient.post("../auth/token");
    const newAccessToken = res1.data.data.accessToken;

    const { setAccessToken } = useAuthStore();
    setAccessToken(newAccessToken);

    const res = await apiClient.post(
      `/v1/reservations/search?page=${page.value}&size=${size.value}&sort=${sort.value}`,
      search.value
    );

    reservations.value = res.data.content;
    totalPages.value = res.data.totalPages;

    // ✅ 업데이트 시간 갱신
    lastUpdated.value = Date.now();
    updateTimeAgo();
  } catch (error) {
    console.error("예약 데이터를 불러오는 중 오류:", error);
  }
};

// 수동 새로고침 버튼
const handleRefresh = async () => {
  loading.value = true;
  await fetchReservations();
  loading.value = false;
};

// 페이지 이동
const goToPage = (p) => {
  if (p >= 0 && p < totalPages.value) {
    page.value = p;
    fetchReservations();
  }
};

// 페이지 버튼 계산
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(0, page.value - 2);
  const end = Math.min(totalPages.value - 1, page.value + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// 예약 취소
const cancelReservation = async (id) => {
  if (!confirm("정말 이 예약을 취소하시겠습니까?")) return;
  try {
    await apiClient.put(`/v1/reservations/${id}/cancel`);
    await fetchReservations();
  } catch (error) {
    console.error("예약 취소 중 오류:", error);
    alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
  }
};

// 상태 클래스
const getStatusClass = (status) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    checked_in: "bg-blue-100 text-blue-800",
    checked_out: "bg-gray-100 text-gray-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

const getPaymentStatusClass = (paymentStatus) => {
  const paymentClasses = {
    unpaid: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-orange-100 text-orange-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return paymentClasses[paymentStatus] || "bg-gray-100 text-gray-800";
};

// 수정 다이얼로그 열기
const openEdit = (r) => {
  selectedReservation.value = r;
};

// 검색 초기화
const resetSearch = () => {
  search.value = {
    reservationId: "",
    userName: "",
    email: "",
    phone: "",
    roomType: "",
    hotelName: "",
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    createdStartDate: "",
    createdEndDate: "",
  };
  dateRange.value = null;
  createdRange.value = null;
  sort.value = "createdAt,desc";
  showAdvanced.value = false;
  fetchReservations();
};

// 폴링 + timeAgo 갱신
let intervalId;
let timerId;
onMounted(() => {
  fetchReservations();

  // 5초마다 자동 새로고침
  intervalId = setInterval(() => {
    if (!hasSearchValues.value) {
      fetchReservations();
    }
  }, 5 * 60 * 1000);

  // 1초마다 "몇 초 전" 갱신
  timerId = setInterval(() => {
    updateTimeAgo();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearInterval(timerId);
});
</script>
