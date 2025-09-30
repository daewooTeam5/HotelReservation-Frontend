<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col gap-4">
    <Toast/>
    <!-- 헤더 -->
    <div class="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">쿠폰 관리</h1>
        <p class="text-gray-600 mt-1">숙소 쿠폰을 생성하고 관리하세요</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showCreate = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 쿠폰 생성
        </button>
      </div>
    </div>

    <!-- 쿠폰 리스트 -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">쿠폰 목록</h2>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">
            마지막 업데이트: {{ timeAgo }}
          </span>

          <button
            @click="refreshData"
            :disabled="loading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="pi pi-spinner pi-spin mr-2"></i>
            <i v-else class="pi pi-refresh mr-2"></i>
            {{ loading ? '불러오는 중...' : '새로고침' }}
          </button>

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
            <option value="usedCount,desc">사용 횟수 많은순</option>
            <option value="usedCount,asc">사용 횟수 적은순</option>
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
            <th class="p-3 text-left">최대 주문 금액</th>
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
            <td class="p-3">{{ coupon.couponType === 'fixed' ? '정액 할인' : '정률 할인' }}</td>
            <td class="p-3">
                <span v-if="coupon.couponType === 'fixed'">
                  {{ coupon.amount === 0 ? '없음' : coupon.amount.toLocaleString() + '원' }}
                </span>
              <span v-else>
                  {{ coupon.amount === 0 ? '없음' : coupon.amount + '%' }}
                </span>
            </td>
            <td class="p-3">
              {{ coupon.minOrderAmount === 0 ? '없음' : coupon.minOrderAmount.toLocaleString() + '원' }}
            </td>
            <td class="p-3">
              {{ coupon.maxOrderAmount === 0 ? '없음' : coupon.maxOrderAmount.toLocaleString() + '원' }}
            </td>
            <td class="p-3">{{ coupon.createdAt }}</td>
            <td class="p-3">{{ coupon.expiredAt }}</td>
            <td class="p-3">{{ coupon.usedCount }}</td>
          </tr>
          </tbody>
        </table>
      </div>

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
      <div class="bg-white rounded-lg p-6 w-[500px] flex flex-col gap-4">
        <h2 class="text-xl font-semibold mb-4">쿠폰 생성</h2>

        <div class="space-y-3 flex flex-col gap-4">
          <!-- 쿠폰명 -->
          <div>
            <input v-model="form.couponName" placeholder="쿠폰명 (예: 여름특가할인)" class="w-full border p-2 rounded"
                   :class="{ 'border-red-500': errors.couponName }" />
            <p v-if="errors.couponName" class="text-sm text-red-500 mt-1">{{ errors.couponName }}</p>
          </div>

          <!-- 할인 유형 -->
          <div>
            <select v-model="form.couponType" class="w-full border p-2 rounded">
              <option value="fixed">정액 할인</option>
              <option value="rate">정률 할인</option>
            </select>
          </div>

          <!-- 할인 값 -->
          <div>
            <div class="relative">
              <input :value="displayAmount" @input="handleAmountInput($event.target.value)" type="text"
                     :placeholder="form.couponType === 'fixed' ? '할인 금액 (원)' : '할인 비율 (%)'"
                     class="w-full border p-2 rounded pr-10" :class="{ 'border-red-500': errors.amount }" />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{{ form.couponType === 'fixed' ?
                '원' : '%' }}</span>
            </div>
            <p v-if="errors.amount" class="text-sm text-red-500 mt-1">{{ errors.amount }}</p>
          </div>

          <!-- 최소 주문 금액 -->
          <div>
            <div class="relative">
              <input :value="displayMinOrderAmount" @input="handleMinOrderAmountInput($event.target.value)" type="text"
                     placeholder="최소 주문 금액 (원)" class="w-full border p-2 rounded pr-10"
                     :class="{ 'border-red-500': errors.minOrderAmount }" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
            </div>
            <p v-if="errors.minOrderAmount" class="text-sm text-red-500 mt-1">{{ errors.minOrderAmount }}</p>
          </div>

          <!-- 최대 주문 금액 -->
          <div>
            <div class="relative">
              <input :value="displayMaxOrderAmount" @input="handleMaxOrderAmountInput($event.target.value)" type="text"
                     placeholder="최대 주문 금액 (원)" class="w-full border p-2 rounded pr-10"
                     :class="{ 'border-red-500': errors.maxOrderAmount }" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
            </div>
            <p v-if="errors.maxOrderAmount" class="text-sm text-red-500 mt-1">{{ errors.maxOrderAmount }}</p>
          </div>

          <!-- 만료일 -->
          <div>
            <input v-model="form.expiredAt" type="date" :min="today" class="w-full border p-2 rounded"
                   :class="{ 'border-red-500': errors.expiredAt }" />
            <p v-if="errors.expiredAt" class="text-sm text-red-500 mt-1">{{ errors.expiredAt }}</p>
          </div>
        </div>

        <div class="flex justify-end mt-4 gap-4">
          <button @click="showCreate=false" class="px-4 py-2 bg-gray-200 rounded">취소</button>
          <button @click="validateAndSubmit" class="px-4 py-2 bg-blue-600 text-white rounded">생성</button>
        </div>
      </div>
    </div>

    <!-- ✅ 쿠폰 요약 확인 모달 -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-[500px] flex flex-col gap-4">
        <h2 class="text-xl font-semibold mb-4">쿠폰 생성 확인</h2>
        <ul class="text-gray-700 space-y-2">
          <li><strong>쿠폰명:</strong> {{ form.couponName }}</li>
          <li><strong>할인 유형:</strong> {{ form.couponType === 'fixed' ? '정액 할인' : '정률 할인' }}</li>
          <li><strong>할인 값:</strong>
            {{ form.couponType === 'fixed' ? (form.amount?.toLocaleString() + '원') : (form.amount + '%') }}</li>
          <li><strong>최소 주문 금액:</strong>
            {{ form.minOrderAmount ? form.minOrderAmount.toLocaleString() + '원' : '없음' }}</li>
          <li><strong>최대 주문 금액:</strong>
            {{ form.maxOrderAmount ? form.maxOrderAmount.toLocaleString() + '원' : '없음' }}</li>
          <li><strong>만료일:</strong> {{ form.expiredAt }}</li>
        </ul>
        <div class="flex justify-end mt-4 gap-4">
          <button @click="showConfirm=false" class="px-4 py-2 bg-gray-200 rounded">취소</button>
          <button @click="createCoupon" class="px-4 py-2 bg-green-600 text-white rounded">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/utils/axiosClient'
import { useToast } from 'primevue/usetoast';

const router = useRouter()
const toast = useToast()

const sort = ref('createdAt,desc')
const page = ref(0)
const size = ref(10)
const totalPages = ref(0)

const coupons = ref([])
const loading = ref(false)

const lastUpdated = ref(new Date())
const timeAgo = computed(() => {
  const diffSec = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diffSec < 60) return '방금 전'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`
  return `${Math.floor(diffSec / 86400)}일 전`
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(0, page.value - 2)
  const end = Math.min(totalPages.value - 1, page.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const fetchCoupons = async () => {
  try {
    loading.value = true
    const res = await apiClient.get(`/v1/owner/coupons`, {
      params: { page: page.value, size: size.value, sort: sort.value },
    })
    coupons.value = res.data.content
    totalPages.value = res.data.totalPages
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('쿠폰 불러오기 실패:', err)
  } finally {
    loading.value = false
  }
}

function refreshData() {
  fetchCoupons()
}

const goToPage = (p) => {
  if (p >= 0 && p < totalPages.value) {
    page.value = p
    fetchCoupons()
  }
}

const showCreate = ref(false)
const showConfirm = ref(false)

const form = ref({
  couponName: '',
  couponType: 'fixed',
  amount: null,
  minOrderAmount: null,
  maxOrderAmount: null,
  expiredAt: ''
})

const errors = ref({})
const today = new Date().toISOString().split('T')[0]

// ✅ 표시용 computed
const displayAmount = computed(() => {
  if (!form.value.amount) return ''
  return form.value.couponType === 'fixed'
    ? Number(form.value.amount).toLocaleString()
    : form.value.amount.toString()
})

const displayMinOrderAmount = computed(() =>
  form.value.minOrderAmount ? Number(form.value.minOrderAmount).toLocaleString() : ''
)

const displayMaxOrderAmount = computed(() =>
  form.value.maxOrderAmount ? Number(form.value.maxOrderAmount).toLocaleString() : ''
)

// ✅ 입력 핸들러
const handleAmountInput = (val) => {
  const raw = val.replace(/[^0-9]/g, '')
  if (form.value.couponType === 'fixed') {
    form.value.amount = raw ? Number(raw) : null
  } else {
    let num = raw ? Number(raw) : null
    if (num && num > 100) num = 100
    form.value.amount = num
  }
}

const handleMinOrderAmountInput = (val) => {
  const raw = val.replace(/[^0-9]/g, '')
  form.value.minOrderAmount = raw ? Number(raw) : null
}

const handleMaxOrderAmountInput = (val) => {
  const raw = val.replace(/[^0-9]/g, '')
  form.value.maxOrderAmount = raw ? Number(raw) : null
}

// ✅ 유효성 검사 + 제출 전 확인 모달 띄우기
const validateAndSubmit = async () => {
  errors.value = {}

  // 1. 쿠폰명
  if (!form.value.couponName) {
    errors.value.couponName = '쿠폰명을 입력해주세요'
  }

  // 2. 할인 값
  if (!form.value.amount || form.value.amount <= 0) {
    errors.value.amount =
      form.value.couponType === 'fixed'
        ? '할인 금액을 입력해주세요'
        : '할인 비율을 입력해주세요'
  } else if (form.value.couponType === 'rate' && form.value.amount > 100) {
    errors.value.amount = '할인 비율은 1~100 사이여야 합니다'
  }

  // 3. 최소 주문 금액
  if (form.value.couponType === 'fixed') {
    if (!form.value.minOrderAmount || form.value.minOrderAmount <= 0) {
      errors.value.minOrderAmount = '정액 할인은 최소 주문 금액이 필요합니다'
    }
  }

  // 4. 최대 주문 금액
  if (form.value.couponType === 'rate') {
    if (!form.value.maxOrderAmount || form.value.maxOrderAmount <= 0) {
      errors.value.maxOrderAmount = '정률 할인은 최대 주문 금액이 필요합니다'
    } else if (
      form.value.minOrderAmount &&
      form.value.maxOrderAmount < form.value.minOrderAmount
    ) {
      errors.value.maxOrderAmount =
        '최대 주문 금액은 최소 주문 금액 이상이어야 합니다'
    }
  } else {
    if (
      form.value.maxOrderAmount &&
      form.value.minOrderAmount &&
      form.value.maxOrderAmount < form.value.minOrderAmount
    ) {
      errors.value.maxOrderAmount =
        '최대 주문 금액은 최소 주문 금액 이상이어야 합니다'
    }
  }

  // 5. 만료일
  if (!form.value.expiredAt) {
    errors.value.expiredAt = '만료일을 선택해주세요'
  } else if (new Date(form.value.expiredAt) < new Date(today)) {
    errors.value.expiredAt = '만료일은 오늘 이후여야 합니다'
  }

  // ✅ 최종 확인 모달 띄우기
  if (Object.keys(errors.value).length === 0) {
    showConfirm.value = true
  }
}

// ✅ 실제 쿠폰 생성
const createCoupon = async () => {
  try {
    await apiClient.post(`/v1/owner/coupons`, form.value)
    showConfirm.value = false
    showCreate.value = false
    fetchCoupons()

    // ✅ 성공 Toast
    toast.add({
      severity: 'success',
      summary: '성공',
      detail: '쿠폰이 생성되었습니다.',
      life: 3000
    })
  } catch (err) {
    console.error('쿠폰 생성 실패:', err)

    // ✅ 실패 Toast
    toast.add({
      severity: 'error',
      summary: '실패',
      detail: '쿠폰 생성에 실패했습니다.',
      life: 3000
    })
  }
}

const goDetail = (id) => {
  router.push(`/owner/coupons/${id}`)
}

let intervalId1, intervalId2
onMounted(() => {
  fetchCoupons()
  intervalId1 = window.setInterval(() => {
    lastUpdated.value = new Date(lastUpdated.value)
  }, 30000)
  intervalId2 = window.setInterval(() => {
    refreshData()
  }, 5 * 60 * 1000)
})
onUnmounted(() => {
  clearInterval(intervalId1)
  clearInterval(intervalId2)
})
</script>
