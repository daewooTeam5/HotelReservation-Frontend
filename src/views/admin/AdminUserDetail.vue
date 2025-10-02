<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p class="mt-2 text-gray-500">사용자 정보를 불러오는 중입니다...</p>
    </div>
  </div>

  <div v-else-if="error" class="flex items-center justify-center min-h-screen">
    <div class="text-center text-red-500">
      <i class="pi pi-exclamation-circle" style="font-size: 2rem"></i>
      <p class="mt-2">{{ error }}</p>
      <PrimeButton @click="fetchUserDetail" label="다시 시도" class="mt-4" />
    </div>
  </div>

  <div v-else class="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {{ user.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ user.name }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ user.email }} · {{ user.phone || '-' }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getRoleClass(user.role)"
              >
                {{ translateRole(user.role) }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getStatusClass(user.status)"
              >
                {{ translateStatus(user.status) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <PrimeButton
            icon="pi pi-cog"
            label="계정 관리"
            severity="secondary"
            outlined
            @click="accountPopover.toggle($event)"
          />
          <PrimePopover ref="accountPopover">
            <div class="flex flex-col gap-1 w-48">
              <p class="text-xs text-gray-400 px-3 pb-2">계정 상태 변경</p>
              <div
                v-for="status in statusOptions"
                :key="status.code"
                @click="updateUserStatus(status.code)"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                :class="{ 'bg-gray-100 font-bold': user.status === status.code }"
              >
                <span class="w-2 h-2 rounded-full" :class="status.class"></span>
                <span class="text-sm">{{ status.text }}</span>
              </div>
              <Divider class="my-2" />
              <div
                @click="resetPassword"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <i class="pi pi-key text-blue-500"></i>
                <span class="text-sm">비밀번호 초기화</span>
              </div>
            </div>
          </PrimePopover>
        </div>
      </div>
    </div>

    <div v-if="alerts.length > 0" class="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <i class="pi pi-exclamation-triangle text-orange-500 mt-1"></i>
        <div class="flex-1">
          <h4 class="font-semibold text-orange-800">주의 사항</h4>
          <ul class="mt-2 space-y-1">
            <li v-for="alert in alerts" :key="alert" class="text-sm text-orange-700">• {{ alert }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-600">포인트 잔액</span>
              <i class="pi pi-wallet text-green-500"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(currentPoints) }}P</p>
              <p class="text-xs text-gray-500 mt-1">가입일: {{ formatDate(user?.createdAt) }}</p>
            </div>
          </div>
        </template>
      </PrimeCard>

      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-600">총 예약 수</span>
              <i class="pi pi-calendar text-blue-500"></i>
            </div>
            <div class="space-y-2">
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ reservations.length }}건</p>
                <p class="text-xs text-gray-500 mt-1">이번 달 {{ thisMonthReservations }}건</p>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-xs font-semibold text-green-600">
                  완료: {{ completedReservations }}건
                </span>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>

      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-600">총 결제 금액</span>
              <i class="pi pi-credit-card text-purple-500"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalPaymentAmount) }}원</p>
              <p class="text-xs text-gray-500 mt-1">환불: {{ formatCurrency(refundAmount) }}원</p>
            </div>
          </div>
        </template>
      </PrimeCard>

      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-600">리뷰 활동</span>
              <i class="pi pi-star text-yellow-500"></i>
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <p class="text-2xl font-bold text-gray-900">{{ reviews.length }}</p>
                <span class="text-sm text-gray-500">개</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">평균 평점: {{ averageRating.toFixed(1) }}점</p>
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimeTabs value="0">
      <PrimeTabList>
        <PrimeTab value="0">예약 내역</PrimeTab>
        <PrimeTab value="1">결제 내역</PrimeTab>
        <PrimeTab value="2">포인트 관리</PrimeTab>
        <PrimeTab value="3">쿠폰 관리</PrimeTab>
        <PrimeTab value="4">리뷰 관리</PrimeTab>
      </PrimeTabList>

      <PrimeTabPanels>
        <PrimeTabPanel value="0">
          <div class="bg-white rounded-xl shadow-sm mt-4">
            <div class="p-4 border-b flex items-center justify-between">
              <div class="flex gap-2">
                <PrimeButton
                  label="전체"
                  :outlined="reservationFilter !== 'all'"
                  @click="reservationFilter = 'all'"
                  size="small"
                />
                <PrimeButton
                  label="예정"
                  :outlined="reservationFilter !== 'upcoming'"
                  @click="reservationFilter = 'upcoming'"
                  size="small"
                />
                <PrimeButton
                  label="완료"
                  :outlined="reservationFilter !== 'completed'"
                  @click="reservationFilter = 'completed'"
                  size="small"
                />
                <PrimeButton
                  label="취소"
                  :outlined="reservationFilter !== 'cancelled'"
                  @click="reservationFilter = 'cancelled'"
                  size="small"
                  severity="danger"
                />
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th class="p-3 text-left">예약 ID</th>
                  <th class="p-3 text-left">숙소명</th>
                  <th class="p-3 text-left">체크인/아웃</th>
                  <th class="p-3 text-left">금액</th>
                  <th class="p-3 text-left">결제상태</th>
                  <th class="p-3 text-left">예약상태</th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="reservation in filteredReservations"
                  :key="reservation.reservationId"
                  class="border-b hover:bg-gray-50 transition-colors"
                >
                  <td class="p-3 font-medium">#{{ reservation.reservationId }}</td>
                  <td class="p-3">
                    <div>
                      <p class="font-medium">{{ reservation.room_place_name || '숙소명' }}</p>
                      <p class="text-xs text-gray-500">{{ reservation.room_roomType || '객실타입' }}</p>
                    </div>
                  </td>
                  <td class="p-3">
                    <div>
                      <p class="text-xs">{{ reservation.resevStart }}</p>
                      <p class="text-xs text-gray-500">→ {{ reservation.resevEnd }}</p>
                    </div>
                  </td>
                  <td class="p-3 font-semibold">{{ formatCurrency(reservation.finalAmount) }}원</td>
                  <td class="p-3">
                      <span
                        :class="getPaymentStatusClass(reservation.paymentStatus)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ translatePaymentStatus(reservation.paymentStatus) }}
                      </span>
                  </td>
                  <td class="p-3">
                      <span
                        :class="getReservationStatusClass(reservation.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ translateReservationStatus(reservation.status) }}
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="1">
          <div class="bg-white rounded-xl shadow-sm mt-4">
            <div class="p-4 border-b">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">결제 내역</h3>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th class="p-3 text-left">결제 ID</th>
                  <th class="p-3 text-left">주문번호</th>
                  <th class="p-3 text-left">결제방법</th>
                  <th class="p-3 text-left">금액</th>
                  <th class="p-3 text-left">상태</th>
                  <th class="p-3 text-left">결제일시</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="payment in payments" :key="payment.id" class="border-b hover:bg-gray-50">
                  <td class="p-3 font-medium">#{{ payment.id }}</td>
                  <td class="p-3 text-xs font-mono">{{ payment.orderId }}</td>
                  <td class="p-3">
                    <div>
                      <p>{{ translatePaymentMethod(payment.method) }}</p>
                      <p class="text-xs text-gray-500">{{ payment.methodType }}</p>
                    </div>
                  </td>
                  <td class="p-3 font-semibold">{{ formatCurrency(payment.amount) }}원</td>
                  <td class="p-3">
                      <span
                        :class="getPaymentStatusClass(payment.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ translatePaymentStatus(payment.status) }}
                      </span>
                  </td>
                  <td class="p-3 text-xs">{{ formatDate(payment.transactionDate) }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="2">
          <div class="space-y-4 mt-4">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">포인트 관리</h3>
                <div class="flex gap-2">
                  <PrimeButton label="포인트 지급" icon="pi pi-plus" @click="showPointDialog = true" />
                  <PrimeButton
                    label="포인트 차감"
                    icon="pi pi-minus"
                    severity="danger"
                    outlined
                    @click="showPointDialog = true"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <p class="text-xs text-blue-600">현재 포인트</p>
                  <p class="text-2xl font-bold text-blue-800 mt-1">{{ formatCurrency(currentPoints) }}P</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <p class="text-xs text-green-600">총 적립</p>
                  <p class="text-2xl font-bold text-green-800 mt-1">{{ formatCurrency(totalEarnedPoints) }}P</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-lg">
                  <p class="text-xs text-red-600">총 사용</p>
                  <p class="text-2xl font-bold text-red-800 mt-1">{{ formatCurrency(totalUsedPoints) }}P</p>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th class="p-3 text-left">일시</th>
                    <th class="p-3 text-left">유형</th>
                    <th class="p-3 text-left">변동 포인트</th>
                    <th class="p-3 text-left">잔액</th>
                    <th class="p-3 text-left">만료일</th>
                    <th class="p-3 text-left">관련 예약</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="point in pointHistory" :key="point.id" class="border-b hover:bg-gray-50">
                    <td class="p-3 text-xs">{{ formatDate(point.createdAt) }}</td>
                    <td class="p-3">
                        <span
                          :class="point.type === 'EARN' ? 'text-green-600' : 'text-red-600'"
                          class="font-medium"
                        >
                          {{ point.type === 'EARN' ? '적립' : '사용' }}
                        </span>
                    </td>
                    <td class="p-3 font-semibold" :class="point.type === 'EARN' ? 'text-green-600' : 'text-red-600'">
                      {{ point.type === 'EARN' ? '+' : '-' }}{{ formatCurrency(point.amount) }}P
                    </td>
                    <td class="p-3">{{ formatCurrency(point.balanceAfter) }}P</td>
                    <td class="p-3 text-xs">{{ point.expireAt || '-' }}</td>
                    <td class="p-3 text-xs">{{ point.reservationId ? `#${point.reservationId}` : '-' }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="3">
          <div class="space-y-4 mt-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-semibold mb-4">보유 쿠폰</h3>
                <div v-if="userCoupons.length > 0" class="space-y-3">
                  <div
                    v-for="userCoupon in userCoupons"
                    :key="userCoupon.couponId"
                    class="border rounded-lg p-4"
                    :class="userCoupon.isUsed ? 'bg-gray-50 opacity-60' : 'bg-blue-50'"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-semibold text-sm">{{ userCoupon.couponName }}</h4>
                        <p class="text-xs text-gray-600">{{ userCoupon.couponCode }}</p>
                        <p class="text-sm font-bold text-blue-600 mt-1">
                          {{ userCoupon.couponType === 'FIXED'
                          ? formatCurrency(userCoupon.amount) + '원 할인'
                          : userCoupon.amount + '% 할인' }}
                        </p>
                      </div>
                      <span
                        :class="userCoupon.isUsed ? 'bg-gray-500' : 'bg-green-500'"
                        class="px-2 py-1 rounded text-xs text-white font-medium"
                      >
                        {{ userCoupon.isUsed ? '사용완료' : '미사용' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  보유한 쿠폰이 없습니다.
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-semibold mb-4">쿠폰 사용 내역</h3>
                <div v-if="couponHistory.length > 0" class="space-y-3">
                  <div
                    v-for="history in couponHistory"
                    :key="history.couponId"
                    class="border rounded-lg p-4 bg-gray-50"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-semibold text-sm">{{ history.couponName }}</h4>
                        <p class="text-xs text-gray-600">할인 금액:</p>
                        <p class="text-sm font-bold text-red-600 mt-1">
                          -{{ history.couponType === 'FIXED'
                          ? formatCurrency(history.amount) + '원'
                          : history.amount + '%' }}
                        </p>
                      </div>
                      <span class="text-xs text-gray-500">
                        {{ formatDate(history.issuedAt) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  사용한 쿠폰이 없습니다.
                </div>
              </div>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="4">
          <div class="bg-white rounded-xl shadow-sm mt-4 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold!">작성한 리뷰</h3>
            </div>
            <div v-if="reviews.length > 0" class="space-y-4">
              <div
                v-for="review in reviews"
                :key="review.reviewId"
                class="shadow-sm rounded-lg p-4! hover:bg-gray-50"
              >
                <div class="flex justify-between items-start mb-2!">
                  <div>
                    <p class="font-semibold!">{{ review.place_name || '숙소명' }}</p>
                    <div class="flex items-center gap-1 mt-1">
                      <i
                        v-for="i in 5"
                        :key="i"
                        :class="
                          i <= review.rating
                            ? 'pi pi-star-fill text-yellow-400'
                            : 'pi pi-star text-gray-300'
                        "
                        class="text-sm"
                      ></i>
                      <span class="text-sm text-gray-500 ml-2">{{ review.rating }}.0</span>
                    </div>
                  </div>
                  <span class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-700 mb-3">{{ review.comment }}</p>
                <div v-if="getOwnerComment(review.reviewId)" class="bg-blue-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-blue-700 mb-1">숙소 답변</p>
                  <p class="text-sm">{{ getOwnerComment(review.reviewId) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              작성한 리뷰가 없습니다.
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="5" v-if="user.role === 'hotel_owner'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div
              v-for="place in ownedPlaces"
              :key="place.id"
              class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">{{ place.name }}</h3>
                  <p class="text-sm text-gray-500">{{ place.description }}</p>
                </div>
                <span
                  :class="getPlaceStatusClass(place.status)"
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ translatePlaceStatus(place.status) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-500">평균 평점</p>
                  <p class="text-lg font-bold text-blue-600">{{ place.avgRating?.toFixed(1) || '0.0' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">리뷰 수</p>
                  <p class="text-lg font-bold">{{ place.reviewCount || 0 }}개</p>
                </div>
              </div>
              <div class="pt-4 border-t flex justify-between items-center">
                <div class="text-sm">
                  <span class="text-gray-500">최소 가격:</span>
                  <span class="font-semibold ml-1">{{ formatCurrency(place.minPrice) }}원</span>
                </div>
                <PrimeButton label="관리" size="small" />
              </div>
            </div>
          </div>
        </PrimeTabPanel>
      </PrimeTabPanels>
    </PrimeTabs>

    <Dialog v-model:visible="showPointDialog" modal header="포인트 관리" style="width: 30rem">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">포인트 금액</label>
          <PrimeInputText
            v-model="pointAmount"
            placeholder="포인트 입력"
            type="number"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">사유</label>
          <Textarea
            v-model="pointReason"
            placeholder="포인트 지급/차감 사유를 입력하세요"
            rows="3"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <PrimeButton label="취소" severity="secondary" @click="showPointDialog = false" />
        <PrimeButton label="지급" @click="addPoints" />
        <PrimeButton label="차감" severity="danger" @click="deductPoints" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Popover from 'primevue/popover';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale('ko');
dayjs.extend(isBetween);


// Route
const route = useRoute();

// 반응형 데이터
const loading = ref(true);
const error = ref<string | null>(null);
const user = ref<any>({});
const reservations = ref<any[]>([]);
const payments = ref<any[]>([]);
const pointHistory = ref<any[]>([]);
const userCoupons = ref<any[]>([]);
const reviewComments = ref<any[]>([]);
const reviewImages = ref<any[]>([]);
const reviews = ref<any[]>([]);
const ownedPlaces = ref<any[]>([]);

// 필터링 상태
const reservationFilter = ref('all');
const showPointDialog = ref(false);
const pointAmount = ref('');
const pointReason = ref('');

// 팝오버 참조
const accountPopover = ref();

// 상태 옵션
const statusOptions = ref([
  { code: 'active', text: '활성', class: 'bg-green-500' },
  { code: 'inactive', text: '비활성', class: 'bg-yellow-500' },
  { code: 'banned', text: '정지', class: 'bg-red-500' },
]);

// 유틸리티 함수들
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('ko-KR').format(value);
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// 역할 번역 및 스타일
const translateRole = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    customer: '일반 고객',
    hotel_owner: '숙소 사업자',
    admin: '전체 관리자',
    place_admin: '숙소 관리자',
    user_admin: '회원 관리자',
  };
  return roleMap[role] || role;
};

const getRoleClass = (role: string): string => {
  const roleClassMap: { [key: string]: string } = {
    customer: 'bg-blue-100 text-blue-800',
    hotel_owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    place_admin: 'bg-orange-100 text-orange-800',
    user_admin: 'bg-green-100 text-green-800',
  };
  return roleClassMap[role] || 'bg-gray-100 text-gray-800';
};

// 상태 번역 및 스타일
const translateStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    active: '활성',
    inactive: '비활성',
    banned: '정지',
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string): string => {
  const statusClassMap: { [key: string]: string } = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
  };
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

// 결제 상태 번역 및 스타일
const translatePaymentStatus = (status: string): string => {
  const paymentStatusMap: { [key: string]: string } = {
    PAID: '결제완료',
    UNPAID: '결제대기',
    REFUNDED: '환불완료',
    CANCELLED: '결제취소'
  };
  return paymentStatusMap[status.toUpperCase()] || status;
};

const getPaymentStatusClass = (status: string): string => {
  const paymentStatusClassMap: { [key: string]: string } = {
    PAID: 'bg-green-100 text-green-800',
    UNPAID: 'bg-yellow-100 text-yellow-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };
  return paymentStatusClassMap[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

// 예약 상태 번역 및 스타일
const translateReservationStatus = (status: string): string => {
  const reservationStatusMap: { [key: string]: string } = {
    PENDING: '예약대기',
    CONFIRMED: '예약확정',
    CANCELLED: '예약취소',
    CHECKED_IN: '체크인완료',
    CHECKED_OUT: '체크아웃완료',
  };
  return reservationStatusMap[status.toUpperCase()] || status;
};

const getReservationStatusClass = (status: string): string => {
  const reservationStatusClassMap: { [key: string]: string } = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    CHECKED_IN: 'bg-green-100 text-green-800',
    CHECKED_OUT: 'bg-gray-100 text-gray-800',
  };
  return reservationStatusClassMap[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

// 결제 방법 번역 (Enum 값을 소문자로 변환하여 매핑)
const translatePaymentMethod = (method: string): string => {
  if (!method) return '알 수 없음';
  const paymentMethodMap: { [key: string]: string } = {
    card: '카드결제',
    bank_transfer: '계좌이체',
    points: '포인트결제',
    coupon: '쿠폰결제',
  };
  return paymentMethodMap[method.toLowerCase()] || method;
};


// 숙소 상태 번역 및 스타일 (호텔 오너용)
const translatePlaceStatus = (status: string): string => {
  const placeStatusMap: { [key: string]: string } = {
    PENDING: '승인대기',
    APPROVED: '승인완료',
    REJECTED: '승인거절',
    INACTIVE: '비활성',
  };
  return placeStatusMap[status] || status;
};

const getPlaceStatusClass = (status: string): string => {
  const placeStatusClassMap: { [key: string]: string } = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  };
  return placeStatusClassMap[status] || 'bg-gray-100 text-gray-800';
};

const getOwnerComment = (reviewId: number): string | null => {
  const comment = reviewComments.value.find(c => c.review_reviewId === reviewId);
  return comment ? comment.comment : null;
};


// 계산된 속성들
const thisMonthReservations = computed(() => {
  const startOfMonth = dayjs().startOf('month');
  const endOfMonth = dayjs().endOf('month');
  return reservations.value.filter((r) => {
    const resevDate = dayjs(r.resevStart);
    return resevDate.isBetween(startOfMonth, endOfMonth, null, '[]');
  }).length;
});

const completedReservations = computed(() => {
  const completedStatuses = ['CONFIRMED', 'CHECKED_OUT'];
  return reservations.value.filter(r => completedStatuses.includes(r.status.toUpperCase())).length;
});

const totalPaymentAmount = computed(() => {
  return payments.value
    .filter(p => p.status.toUpperCase() === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

const refundAmount = computed(() => {
  return reservations.value
    .filter(r => r.paymentStatus.toUpperCase() === 'REFUNDED')
    .reduce((sum, r) => sum + (r.baseAmount || 0), 0);
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const totalRating = reviews.value.reduce((sum, r) => sum + (r.rating || 0), 0);
  return totalRating / reviews.value.length;
});

const totalEarnedPoints = computed(() => {
  return pointHistory.value
    .filter(p => p.type === 'EARN')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

const totalUsedPoints = computed(() => {
  return pointHistory.value
    .filter(p => p.type === 'USE')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

// ✅ [ADD] 현재 포인트를 계산하는 새로운 computed 속성
const currentPoints = computed(() => {
  return totalEarnedPoints.value - totalUsedPoints.value;
});

const couponHistory = computed(() => {
  return userCoupons.value.filter(c => c.isUsed);
});


// 필터링된 예약 목록
const filteredReservations = computed(() => {
  const now = dayjs();
  switch (reservationFilter.value) {
    case 'upcoming':
      return reservations.value.filter(r =>
        dayjs(r.resevStart).isAfter(now) && r.status.toUpperCase() === 'CONFIRMED'
      );
    case 'completed':
      return reservations.value.filter(r => r.status.toUpperCase() === 'CHECKED_OUT');
    case 'cancelled':
      return reservations.value.filter(r => r.status.toUpperCase() === 'CANCELLED');
    default:
      return reservations.value;
  }
});

// 알림 계산
const alerts = computed(() => {
  const alertList = [];
  if (!user.value || !reservations.value) return [];


  const unpaidReservations = reservations.value.filter(
    r => r.paymentStatus.toUpperCase() === 'UNPAID' && r.status.toUpperCase() !== 'CANCELLED'
  ).length;
  if (unpaidReservations > 0) {
    alertList.push(`미결제 예약이 ${unpaidReservations}건 있습니다.`);
  }

  if (user.value.status === 'banned') {
    alertList.push('이 계정은 현재 정지 상태입니다.');
  } else if (user.value.status === 'inactive') {
    alertList.push('이 계정은 현재 비활성 상태입니다.');
  }

  if (totalPaymentAmount.value > 0 && refundAmount.value > totalPaymentAmount.value * 0.2) {
    alertList.push('환불 비율이 높습니다. 예약 패턴을 확인해보세요.');
  }

  return alertList;
});

// API 함수들
const fetchUserDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const userId = route.params.id;
    const response = await apiClient.get(`/v1/admin/users/${userId}/all-data`);

    const data = response.data;

    if (!data || !data.user) {
      throw new Error("API로부터 유효한 사용자 데이터를 받지 못했습니다.");
    }

    user.value = data.user;
    reservations.value = data.reservations || [];
    payments.value = data.payments || [];
    reviews.value = data.reviews || [];
    reviewComments.value = data.reviewComments || [];
    reviewImages.value = data.reviewImages || [];
    userCoupons.value = data.coupons || [];
    pointHistory.value = data.points || [];
    ownedPlaces.value = data.ownedPlaces || [];

  } catch (err) {
    console.error('사용자 정보 조회 실패:', err);
    error.value = '사용자 정보를 불러오는 데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

// 사용자 상태 업데이트
const updateUserStatus = async (newStatus: string) => {
  if (user.value.status === newStatus) {
    accountPopover.value.hide();
    return;
  }

  try {
    await apiClient.patch(`/v1/admin/users/${user.value.id}/status`, {
      status: newStatus
    });

    user.value.status = newStatus;
  } catch (err) {
    console.error('사용자 상태 변경 실패:', err);
    alert('상태 변경에 실패했습니다.');
  } finally {
    accountPopover.value.hide();
  }
};

// 비밀번호 초기화
const resetPassword = async () => {
  const confirmed = confirm('이 사용자의 비밀번호를 초기화하시겠습니까?');
  if (!confirmed) return;

  try {
    await apiClient.post(`/v1/admin/users/${user.value.id}/reset-password`);
    alert('비밀번호가 초기화되었습니다. 사용자에게 새 비밀번호를 안내해주세요.');
  } catch (err) {
    console.error('비밀번호 초기화 실패:', err);
    alert('비밀번호 초기화에 실패했습니다.');
  } finally {
    accountPopover.value.hide();
  }
};

// 포인트 지급
const addPoints = async () => {
  if (!pointAmount.value || !pointReason.value) {
    alert('포인트 금액과 사유를 입력해주세요.');
    return;
  }

  try {
    await apiClient.post(`/v1/admin/users/${user.value.id}/points/add`, {
      amount: parseInt(pointAmount.value),
      reason: pointReason.value
    });

    await fetchUserDetail(); // 데이터 새로고침
    pointAmount.value = '';
    pointReason.value = '';
    showPointDialog.value = false;
    alert('포인트가 지급되었습니다.');
  } catch (err) {
    console.error('포인트 지급 실패:', err);
    alert('포인트 지급에 실패했습니다.');
  }
};

// 포인트 차감
const deductPoints = async () => {
  if (!pointAmount.value || !pointReason.value) {
    alert('포인트 금액과 사유를 입력해주세요.');
    return;
  }
  const amount = parseInt(pointAmount.value);
  // ✅ [FIX] user.point 대신 계산된 currentPoints 사용
  if (amount > currentPoints.value) {
    alert('차감할 포인트가 보유 포인트보다 많습니다.');
    return;
  }
  try {
    await apiClient.post(`/v1/admin/users/${user.value.id}/points/deduct`, {
      amount: amount,
      reason: pointReason.value
    });

    await fetchUserDetail(); // 데이터 새로고침
    pointAmount.value = '';
    pointReason.value = '';
    showPointDialog.value = false;
    alert('포인트가 차감되었습니다.');
  } catch (err) {
    console.error('포인트 차감 실패:', err);
    alert('포인트 차감에 실패했습니다.');
  }
};

// 컴포넌트 마운트 시 데이터 조회
onMounted(() => {
  fetchUserDetail();
});
</script>
