<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col gap-6">
    <!-- 헤더 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 gap-6">
          <!-- 뒤로가기 버튼 -->
          <button
            @click="$router.go(-1)"
            class="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ coupon?.couponName }}</h1>
            <p class="text-gray-500 text-sm mt-1">쿠폰 상세 정보와 사용 내역을 확인하세요</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 쿠폰 정보 -->
    <div v-if="coupon" class="bg-white rounded-lg shadow-sm p-6">
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div><span class="font-medium">쿠폰 코드:</span> {{ coupon.couponCode }}</div>
        <div><span class="font-medium">할인 유형:</span>
          {{ coupon.couponType === 'fixed' ? '정액 할인' : '정률 할인' }}
        </div>

        <div><span class="font-medium">할인 값:</span>
          <span v-if="coupon.couponType === 'fixed'">
            {{ coupon.amount === 0 ? '없음' : coupon.amount.toLocaleString() + '원' }}
          </span>
          <span v-else>
            {{ coupon.amount === 0 ? '없음' : coupon.amount + '%' }}
          </span>
        </div>
        <div><span class="font-medium">최소 주문 금액:</span>
          {{ coupon.minOrderAmount === 0 ? '없음' : coupon.minOrderAmount.toLocaleString() + '원' }}
        </div>
        <div><span class="font-medium">최대 할인 금액:</span>
          {{ coupon.maxOrderAmount === -1 ? '무제한' : (coupon.maxOrderAmount === 0 ? '없음' : coupon.maxOrderAmount.toLocaleString() + '원') }}
        </div>
        <div><span class="font-medium">생성일:</span> {{ coupon.createdAt }}</div>
        <div><span class="font-medium">만료일:</span> {{ coupon.expiredAt }}</div>
        <div><span class="font-medium">사용 횟수:</span> {{ coupon.usedCount }}</div>
      </div>
    </div>

    <!-- 사용 내역 -->
    <div class="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">사용 내역</h2>

        <div class="flex items-center gap-3">
          <!-- 마지막 업데이트 -->
          <span class="text-sm text-gray-500">
        마지막 업데이트: {{ timeAgo }}
      </span>

          <!-- 새로고침 버튼 -->
          <button
            @click="refreshUsageHistory"
            :disabled="loading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="pi pi-spinner pi-spin mr-2"></i>
            <i v-else class="pi pi-refresh mr-2"></i>
            {{ loading ? '불러오는 중...' : '새로고침' }}
          </button>

          <!-- 정렬 -->
          <label class="text-sm font-medium text-gray-700">정렬:</label>
          <select
            v-model="sort"
            @change="fetchUsageHistory"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="usedAt,desc">사용일 최신순</option>
            <option value="usedAt,asc">사용일 오래된순</option>
            <option value="discountAmount,desc">할인액 높은순</option>
            <option value="discountAmount,asc">할인액 낮은순</option>
            <option value="status,asc">상태 오름차순</option>
            <option value="status,desc">상태 내림차순</option>
          </select>
        </div>
      </div>

      <table class="w-full text-sm">
        <thead>
        <tr class="bg-gray-50 text-gray-700">
          <th class="p-3 text-left">사용자</th>
          <th class="p-3 text-left">사용자 쿠폰 ID</th>
          <th class="p-3 text-left">예약번호</th>
          <th class="p-3 text-left">사용일</th>
          <th class="p-3 text-left">할인액</th>
          <th class="p-3 text-left">상태</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="history in historyList"
          :key="history.id"
          class="hover:bg-gray-50"
        >
          <td class="p-3">{{ history.userName }}</td>
          <td class="p-3">#{{ history.userCouponId }}</td>
          <td class="p-3">#{{ history.reservationId }}</td>
          <td class="p-3">{{ history.usedAt }}</td>
          <td class="p-3">
            {{ history.discountAmount === 0 ? '없음' : history.discountAmount.toLocaleString() + '원' }}
          </td>

          <td class="p-3">
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                {{ history.status }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 페이징 -->
      <div class="flex justify-center items-center gap-2 p-4 border-t bg-gray-50">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 0"
          class="px-3 py-1 rounded border text-sm"
          :class="page === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'"
        >
          이전
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          @click="goToPage(p)"
          class="px-3 py-1 rounded border text-sm"
          :class="p === page ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'"
        >
          {{ p + 1 }}
        </button>

        <button
          @click="goToPage(page + 1)"
          :disabled="page === totalPages - 1"
          class="px-3 py-1 rounded border text-sm"
          :class="page === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiClient } from '@/utils/axiosClient'

const route = useRoute()
const couponId = route.params.id

const loading = ref(false)

// 쿠폰 정보
const coupon = ref(null)

// 사용 내역
const historyList = ref([])
const page = ref(0)
const size = ref(10)
const totalPages = ref(0)
const sort = ref('usedAt,desc')

// 마지막 업데이트 시간
const lastUpdated = ref(new Date())

// 사람이 읽기 좋은 시간 계산
const timeAgo = computed(() => {
  const diffSec = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diffSec < 60) return "방금 전"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`
  return `${Math.floor(diffSec / 86400)}일 전`
})

// 쿠폰 상세 조회
const fetchCouponDetail = async () => {
  try {
    const res = await apiClient.get(`/v1/owner/coupons/${couponId}`)
    coupon.value = res.data
  } catch (err) {
    console.error('쿠폰 상세 조회 실패:', err)
  }
}

// 사용 내역 조회
const fetchUsageHistory = async () => {
  try {
    loading.value = true
    const res = await apiClient.get(`/v1/owner/coupons/${couponId}/history`, {
      params: { page: page.value, size: size.value, sort: sort.value }
    })
    historyList.value = res.data.content
    totalPages.value = res.data.totalPages
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('쿠폰 사용 내역 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

// 새로고침 함수
const refreshUsageHistory = () => {
  fetchUsageHistory()
}

// 페이지 이동
const goToPage = (p) => {
  if (p >= 0 && p < totalPages.value) {
    page.value = p
    fetchUsageHistory()
  }
}

// 인터벌 관리
let intervalId1
let intervalId2

onMounted(() => {
  fetchCouponDetail()
  fetchUsageHistory()

  // 30초마다 timeAgo 갱신
  intervalId1 = setInterval(() => {
    lastUpdated.value = new Date(lastUpdated.value)
  }, 30000)

  // 5분마다 자동 새로고침
  intervalId2 = setInterval(() => {
    refreshUsageHistory()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(intervalId1)
  clearInterval(intervalId2)
})
</script>
