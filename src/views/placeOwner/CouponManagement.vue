<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col gap-4">
    <!-- 헤더 -->
    <div class="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">쿠폰 관리</h1>
        <p class="text-gray-600 mt-1">숙소 쿠폰을 생성하고 관리하세요</p>
      </div>
      <button
        @click="showCreate = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        + 쿠폰 생성
      </button>
    </div>

    <!-- 쿠폰 리스트 -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">쿠폰 목록</h2>
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700">정렬:</label>
          <select
            v-model="sort"
            @change="fetchCoupons"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="createdAt,desc">생성일 최신순</option>
            <option value="createdAt,asc">생성일 오래된순</option>
            <option value="expiredAt,asc">만료일 빠른순</option>
            <option value="expiredAt,desc">만료일 늦은순</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
          <tr class="bg-gray-50 text-gray-700">
            <th class="p-3 text-left">쿠폰명</th>
            <th class="p-3 text-left">쿠폰코드</th>
            <th class="p-3 text-left">할인 유형</th>
            <th class="p-3 text-left">할인 값</th>
            <th class="p-3 text-left">최소 주문 금액</th>
            <th class="p-3 text-left">최대 할인 금액</th>
            <th class="p-3 text-left">생성일</th>
            <th class="p-3 text-left">만료일</th>
            <th class="p-3 text-left">사용 횟수</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="coupon in coupons"
            :key="coupon.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="goDetail(coupon.id)"
          >
            <td class="p-3">{{ coupon.couponName }}</td>
            <td class="p-3">{{ coupon.couponCode }}</td>
            <td class="p-3">{{ coupon.couponType }}</td>
            <td class="p-3">{{ coupon.amount }}</td>
            <td class="p-3">{{ coupon.minOrderAmount ?? '-' }}</td>
            <td class="p-3">{{ coupon.maxOrderAmount === -1 ? '무제한' : coupon.maxOrderAmount }}</td>
            <td class="p-3">{{ coupon.createdAt }}</td>
            <td class="p-3">{{ coupon.expiredAt }}</td>
            <td class="p-3">{{ coupon.usedCount }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 빈 상태 -->
      <div v-if="coupons.length === 0" class="text-center py-12">
        <h3 class="mt-2 text-sm font-medium text-gray-900">쿠폰 데이터가 없습니다</h3>
        <p class="mt-1 text-sm text-gray-500">검색 조건을 변경해보세요.</p>
      </div>
    </div>

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

    <!-- 쿠폰 생성 모달 -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-[500px]">
        <h2 class="text-xl font-semibold mb-4">쿠폰 생성</h2>
        <div class="space-y-3">
          <input v-model="form.couponName" placeholder="쿠폰명" class="w-full border p-2 rounded" />
          <select v-model="form.couponType" class="w-full border p-2 rounded">
            <option value="fixed">정액 할인</option>
            <option value="rate">정률 할인</option>
          </select>
          <input v-model="form.amount" type="number" placeholder="할인 값" class="w-full border p-2 rounded" />
          <input v-model="form.minOrderAmount" type="number" placeholder="최소 주문 금액" class="w-full border p-2 rounded" />
          <input v-model="form.maxOrderAmount" type="number" placeholder="최대 할인 금액" class="w-full border p-2 rounded" />
          <input v-model="form.expiredAt" type="date" class="w-full border p-2 rounded" />
        </div>
        <div class="flex justify-end mt-4 gap-2">
          <button @click="showCreate=false" class="px-4 py-2 bg-gray-200 rounded">취소</button>
          <button @click="createCoupon" class="px-4 py-2 bg-blue-600 text-white rounded">생성</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/utils/axiosClient'

const router = useRouter()

// 정렬
const sort = ref('createdAt,desc')

// 페이지네이션 상태
const page = ref(0)
const size = ref(10)
const totalPages = ref(0)

// 쿠폰 데이터
const coupons = ref([])

// 페이지 버튼 계산
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(0, page.value - 2)
  const end = Math.min(totalPages.value - 1, page.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// 쿠폰 불러오기
const fetchCoupons = async () => {
  try {
    const res = await apiClient.get(`/v1/owner/coupons`, {
      params: {
        page: page.value,
        size: size.value,
        sort: sort.value,
      },
    })
    coupons.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.error('쿠폰 불러오기 실패:', err)
  }
}

// 페이지 이동
const goToPage = (p) => {
  if (p >= 0 && p < totalPages.value) {
    page.value = p
    fetchCoupons()
  }
}

const showCreate = ref(false)
const form = ref({
  couponName: '',
  couponType: 'fixed',
  amount: '',
  minOrderAmount: '',
  maxOrderAmount: '',
  expiredAt: '',
})

const goDetail = (id) => {
  router.push(`/owner/coupons/${id}`)
}

const createCoupon = async () => {
  try {
    await apiClient.post(`/v1/owner/coupons`, form.value)
    showCreate.value = false
    fetchCoupons()
  } catch (err) {
    console.error('쿠폰 생성 실패:', err)
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>
