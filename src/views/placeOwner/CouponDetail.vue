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
            <h1 class="text-2xl font-bold text-gray-900">{{ coupon.coupon_name }}</h1>
            <p class="text-gray-500 text-sm mt-1">쿠폰 상세 정보와 사용 내역을 확인하세요</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 쿠폰 정보 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ coupon.coupon_name }}</h1>
      <p class="text-gray-600 mt-1">쿠폰 상세 정보와 사용 내역을 확인하세요</p>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div><span class="font-medium">쿠폰 코드:</span> {{ coupon.coupon_code }}</div>
        <div><span class="font-medium">할인 유형:</span> {{ coupon.coupon_type }}</div>
        <div><span class="font-medium">할인 값:</span> {{ coupon.amount }}</div>
        <div><span class="font-medium">최소 주문 금액:</span> {{ coupon.min_order_amount ?? '-' }}</div>
        <div><span class="font-medium">최대 할인 금액:</span> {{ coupon.max_order_amount === -1 ? '무제한' : coupon.max_order_amount }}</div>
        <div><span class="font-medium">생성일:</span> {{ coupon.created_at }}</div>
        <div><span class="font-medium">만료일:</span> {{ coupon.expired_at }}</div>
        <div><span class="font-medium">상태:</span> 사용가능</div>
      </div>
    </div>

    <!-- 사용 내역 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">사용 내역</h2>
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700">정렬:</label>
          <select
            v-model="sort"
            @change="fetchUsageHistory"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="usedAt,desc">사용일 최신순</option>
            <option value="usedAt,asc">사용일 오래된순</option>
            <option value="discount,desc">할인액 높은순</option>
            <option value="discount,asc">할인액 낮은순</option>
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
          v-for="history in pagedHistory"
          :key="history.id"
          class="hover:bg-gray-50"
        >
          <td class="p-3">{{ history.user }}</td>
          <td class="p-3">#{{ history.userCouponId }}</td>
          <td class="p-3">#{{ history.reservationId }}</td>
          <td class="p-3">{{ history.usedAt }}</td>
          <td class="p-3">{{ history.discount }}</td>
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const couponId = route.params.id;

const coupon = ref({
  id: couponId,
  coupon_name: '여름 특별 할인',
  coupon_code: 'UUID-456',
  coupon_type: 'rate',
  amount: '10%',
  min_order_amount: null,
  max_order_amount: -1,
  created_at: '2025-06-01',
  expired_at: '2025-08-31'
});

// 전체 사용 내역 (하드코딩 예시, 실제는 API 응답 데이터)
const allHistory = [
  { id: 1, user: '홍길동', reservationId: 101, usedAt: '2025-07-01', discount: 10000, status: 'used' },
  { id: 2, user: '이몽룡', reservationId: 102, usedAt: '2025-07-05', discount: 5000, status: 'refunded' },
  { id: 3, user: '성춘향', reservationId: 103, usedAt: '2025-07-10', discount: 15000, status: 'used' },
  { id: 4, user: '변학도', reservationId: 104, usedAt: '2025-07-15', discount: 7000, status: 'canceled' },
  { id: 5, user: '임꺽정', reservationId: 105, usedAt: '2025-07-20', discount: 12000, status: 'used' },
  { id: 6, user: '장보고', reservationId: 106, usedAt: '2025-07-25', discount: 8000, status: 'refunded' },
  { id: 7, user: '강감찬', reservationId: 107, usedAt: '2025-07-28', discount: 11000, status: 'used' },
  { id: 8, user: '을지문덕', reservationId: 108, usedAt: '2025-07-29', discount: 6000, status: 'canceled' },
  { id: 9, user: '최영', reservationId: 109, usedAt: '2025-07-30', discount: 9000, status: 'used' },
  { id: 10, user: '이순신', reservationId: 110, usedAt: '2025-08-01', discount: 20000, status: 'used' },
  { id: 11, user: '김유신', reservationId: 111, usedAt: '2025-08-02', discount: 7500, status: 'refunded' }
];

// 정렬, 페이징 상태
const sort = ref('usedAt,desc');
const page = ref(0);
const size = ref(10); // ✅ 한 페이지당 10개
const totalPages = ref(Math.ceil(allHistory.length / size.value));

// 화면에 보여줄 데이터
const pagedHistory = ref([]);

// 정렬 + 페이징 처리
const fetchUsageHistory = () => {
  let sorted = [...allHistory];
  const [field, direction] = sort.value.split(',');
  sorted.sort((a, b) => {
    if (direction === 'asc') return (a[field] > b[field] ? 1 : -1);
    else return (a[field] < b[field] ? 1 : -1);
  });

  const start = page.value * size.value;
  const end = start + size.value;
  pagedHistory.value = sorted.slice(start, end);

  totalPages.value = Math.ceil(sorted.length / size.value);
};

// 페이지 버튼 계산
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(0, page.value - 2);
  const end = Math.min(totalPages.value - 1, page.value + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// 페이지 이동
const goToPage = (p) => {
  if (p >= 0 && p < totalPages.value) {
    page.value = p;
    fetchUsageHistory();
  }
};

// 초기 로드
fetchUsageHistory();
</script>
