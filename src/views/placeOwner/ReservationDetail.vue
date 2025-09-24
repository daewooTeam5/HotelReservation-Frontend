<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="$router.go(-1)"
          class="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">예약 상세</h1>
      </div>
    </div>

    <div v-if="reservation" class="space-y-6">
      <!-- 예약 상태 카드 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">예약 상태</h2>
          <div class="flex space-x-2">
            <span
              :class="getStatusColor(reservation.status)"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ translateStatus(reservation.status) }}
            </span>
            <span
              :class="getPaymentStatusColor(reservation.paymentStatus)"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ translatePaymentStatus(reservation.paymentStatus) }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-500">예약일</span>
            <p class="font-medium">{{ formatDateTime(reservation.createdAt) }}</p>
          </div>
          <div>
            <span class="text-gray-500">결제수단</span>
            <p class="font-medium">{{ reservation.method }}</p>
          </div>
          <div>
            <span class="text-gray-500">최종 결제 금액</span>
            <p class="text-semibold text-lg text-blue-600">{{ formatCurrency(reservation.finalAmount) }}</p>
          </div>
        </div>
      </div>

      <!-- 예약자 정보 카드 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">예약자 정보</h2>
        <div class="space-y-3">
          <div class="flex items-center">
            <span class="w-20 text-gray-500 text-sm">이름</span>
            <div class="flex items-center space-x-2">
              <span class="font-medium">{{ reservation.guestName }}</span>
              <span
                v-if="reservation.member"
                class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                회원
              </span>
              <span
                v-else
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                비회원
              </span>
            </div>
          </div>
          <div class="flex">
            <span class="w-20 text-gray-500 text-sm">이메일</span>
            <span class="font-medium">{{ reservation.email }}</span>
          </div>
          <div class="flex">
            <span class="w-20 text-gray-500 text-sm">전화번호</span>
            <span class="font-medium">{{ reservation.phone }}</span>
          </div>
        </div>
      </div>

      <!-- 객실 정보 카드 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">객실 정보</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span class="text-gray-500 text-sm">객실 유형</span>
            <p class="font-semibold text-lg">{{ reservation.roomType }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">수용 인원</span>
            <p class="font-medium">{{ reservation.capacityPeople }}명</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">예약 인원</span>
            <p class="font-medium text-blue-600">{{ reservation.resevAmount }}명</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">1박 가격</span>
            <p class="font-medium">₩{{ Number(reservation.price).toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- 예약 기간 카드 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">예약 기간</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <span class="text-green-600 text-sm font-medium">체크인</span>
            <p class="font-semibold text-lg text-green-700 mt-1">
              {{ formatDate(reservation.resevStart) }}
            </p>
          </div>
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <span class="text-red-600 text-sm font-medium">체크아웃</span>
            <p class="font-semibold text-lg text-red-700 mt-1">
              {{ formatDate(reservation.resevEnd) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 요청사항 카드 -->
      <div v-if="reservation.request" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">요청사항</h2>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-gray-700 leading-relaxed">
            {{ reservation.request || '요청사항이 없습니다.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-3 text-gray-600">예약 정보를 불러오는 중...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { apiClient } from "@/utils/axiosClient";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  translateStatus,
  translatePaymentStatus,
} from "@/utils/placeOwner/formatters.js";

const route = useRoute();
const reservation = ref(null);

// 예약 상태 색상
const getStatusColor = (status) => {
  const statusColors = {
    'CONFIRMED': 'bg-green-100 text-green-700',
    'PENDING': 'bg-yellow-100 text-yellow-700',
    'CANCELLED': 'bg-red-100 text-red-700',
    'COMPLETED': 'bg-blue-100 text-blue-700',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-700';
};

// 결제 상태 색상
const getPaymentStatusColor = (paymentStatus) => {
  const paymentColors = {
    'PAID': 'bg-green-100 text-green-700',
    'PENDING': 'bg-yellow-100 text-yellow-700',
    'FAILED': 'bg-red-100 text-red-700',
    'REFUNDED': 'bg-purple-100 text-purple-700',
  };
  return paymentColors[paymentStatus] || 'bg-gray-100 text-gray-700';
};

onMounted(async () => {
  try {
    const res = await apiClient.get(`/v1/reservations/${route.params.id}`);
    reservation.value = res.data;
  } catch (error) {
    console.error('예약 정보를 불러오는데 실패했습니다:', error);
  }
});
</script>
