<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p class="mt-2 text-gray-500">데이터를 불러오는 중입니다...</p>
    </div>
  </div>

  <div v-else-if="error" class="flex items-center justify-center min-h-screen">
    <div class="text-center text-red-500">
      <i class="pi pi-exclamation-circle" style="font-size: 2rem"></i>
      <p class="mt-2">{{ error }}</p>
      <PrimeButton @click="fetchDetail" label="다시 시도" class="mt-4" />
    </div>
  </div>

  <div v-else class="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-4">
          <img
            v-if="place.fileUrl"
            :src="place.fileUrl"
            :alt="place.placeName"
            class="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ place.placeName }}</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ place.roadName }} {{ place.detailAddress }} · {{ place.sido }} {{ place.sigungu }}
            </p>
            <div class="flex items-center gap-3 mt-2">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getApprovalClass(place.status)"
              >{{ translateApproval(place.status) }}</span
              >
              <div class="flex items-center gap-1">
                <i class="pi pi-star-fill text-yellow-400 text-sm"></i>
                <span class="text-sm font-semibold">{{ place.avgRating?.toFixed(1) || 0 }}</span>
                <span class="text-sm text-gray-500">(리뷰 {{ place.reviewCount }}개)</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <PrimeButton
            icon="pi pi-cog"
            label="숙소 상태 관리"
            severity="secondary"
            outlined
            @click="statusPopover.toggle($event)"
          />
          <PrimePopover ref="statusPopover">
            <div class="flex flex-col gap-1 w-40">
              <p class="text-xs text-gray-400 px-3 pb-2">상태 변경</p>
              <div
                v-for="status in statusOptions"
                :key="status.code"
                @click="updatePlaceStatus(status.code)"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                :class="{ 'bg-gray-100 font-bold': place.status === status.code }"
              >
                <span class="w-2 h-2 rounded-full" :class="status.class"></span>
                <span class="text-sm">{{ status.text }}</span>
              </div>
            </div>
          </PrimePopover>
        </div>
      </div>
    </div>
    <div v-if="alerts.length > 0" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <ul class="mt-2 space-y-1">
            <li v-for="alert in alerts" :key="alert" class="text-sm text-red-700">• {{ alert }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4!">
              <span class="text-sm! font-medium! text-gray-600">오늘 숙소 현황</span>
              <i class="pi pi-calendar text-blue-500"></i>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-xs! text-gray-500">체크인</span>
                <span class="text-sm! font-bold! text-green-600">{{ todayCheckIn }}건</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs! text-gray-500">체크아웃</span>
                <span class="text-sm! font-bold! text-red-600">{{ todayCheckOut }}건</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs! text-gray-500">점유율</span>
                <span class="text-sm! font-bold!">{{ occupancyRate }}%</span>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>

      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4!">
              <span class="text-sm! font-medium! text-gray-600">수익 현황</span>
              <i class="pi pi-chart-line text-green-500"></i>
            </div>
            <div class="space-y-2">
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(thisMonthRevenue) }}원</p>
                <p class="text-xs text-gray-500 mt-1">이번 달 총 수익</p>
              </div>
              <div class="flex items-center gap-1">
                <i
                  :class="
                    revenueGrowth >= 0
                      ? 'pi pi-arrow-up text-green-500'
                      : 'pi pi-arrow-down text-red-500'
                  "
                  class="text-xs"
                ></i>
                <span
                  :class="revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
                  class="text-xs font-semibold"
                >
                  {{ Math.abs(revenueGrowth) }}% 전월 대비
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
              <span class="text-sm! font-medium! text-gray-600">이번 달 예약 현황</span>
              <i class="pi pi-users text-purple-500"></i>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div>
                <p class="text-lg font-bold text-green-600">{{ confirmedCount }}</p>
                <p class="text-xs text-gray-500">확정</p>
              </div>
              <div>
                <p class="text-lg font-bold text-yellow-600">{{ pendingCount }}</p>
                <p class="text-xs text-gray-500">대기</p>
              </div>
              <div>
                <p class="text-lg font-bold text-red-600">{{ cancelledCount }}</p>
                <p class="text-xs text-gray-500">취소</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t">
              <p class="text-xs text-gray-500">취소율</p>
              <p
                class="text-sm font-bold"
                :class="cancellationRate > 10 ? 'text-red-600' : 'text-gray-900'"
              >
                {{ cancellationRate.toFixed(1) }}%
              </p>
            </div>
          </div>
        </template>
      </PrimeCard>
      <PrimeCard class="border-0 shadow-sm">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-600">고객 만족도</span>
              <i class="pi pi-heart text-pink-500"></i>
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <p class="text-2xl font-bold text-gray-900">
                  {{ place.avgRating?.toFixed(1) || 0 }}
                </p>
                <div class="flex">
                  <i
                    v-for="i in 5"
                    :key="i"
                    :class="
                      i <= Math.floor(place.avgRating || 0)
                        ? 'pi pi-star-fill text-yellow-400'
                        : 'pi pi-star text-gray-300'
                    "
                    class="text-sm"
                  ></i>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">총 {{ place.reviewCount }}개 리뷰</p>
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimeTabs value="0">
      <PrimeTabList>
        <PrimeTab value="0">예약 관리</PrimeTab>
        <PrimeTab value="1">객실 관리</PrimeTab>
        <PrimeTab value="2">결제 내역</PrimeTab>
        <PrimeTab value="3">리뷰 관리</PrimeTab>
        <PrimeTab value="4">통계 분석</PrimeTab>
      </PrimeTabList>

      <PrimeTabPanels>
        <PrimeTabPanel value="0">
          <div class="bg-white rounded-xl shadow-sm mt-4">
            <div class="p-4 border-b flex items-center justify-between">
              <div class="flex gap-2">
                <PrimeButton
                  label="전체"
                  :outlined="selectedFilter !== 'all'"
                  @click="selectedFilter = 'all'"
                  size="small"
                />
                <PrimeButton
                  label="오늘 체크인"
                  :outlined="selectedFilter !== 'today'"
                  @click="selectedFilter = 'today'"
                  size="small"
                />
                <PrimeButton
                  label="대기중"
                  :outlined="selectedFilter !== 'pending'"
                  @click="selectedFilter = 'pending'"
                  size="small"
                />
              </div>
              <PrimeInputText placeholder="예약자 검색" class="w-64" />
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th class="p-3 text-left">예약 ID</th>
                  <th class="p-3 text-left">예약자</th>
                  <th class="p-3 text-left">객실</th>
                  <th class="p-3 text-left">체크인/아웃</th>
                  <th class="p-3 text-left">금액</th>
                  <th class="p-3 text-left">결제상태</th>
                  <th class="p-3 text-left">예약상태</th>
                  <th class="p-3 text-left">액션</th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="r in filteredReservations"
                  :key="r.reservationId"
                  class="border-b hover:bg-gray-50 transition-colors"
                >
                  <td class="p-3 font-medium">#{{ r.reservationId }}</td>
                  <td class="p-3">
                    <div>
                      <p class="font-medium">{{ r.userName }}</p>
                      <p class="text-xs text-gray-500">{{ r.phone }}</p>
                    </div>
                  </td>
                  <td class="p-3">스탠다드 더블</td>
                  <td class="p-3">
                    <div>
                      <p class="text-xs">{{ r.resevStart }}</p>
                      <p class="text-xs text-gray-500">→ {{ r.resevEnd }}</p>
                    </div>
                  </td>
                  <td class="p-3 font-semibold">{{ formatCurrency(r.finalAmount) }}원</td>
                  <td class="p-3">
                      <span
                        :class="getPaymentStatusClass(r.paymentStatus)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ translatePaymentStatus(r.paymentStatus) }}
                      </span>
                  </td>
                  <td class="p-3">
                      <span
                        :class="getReservationStatusClass(r.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ translateReservationStatus(r.status) }}
                      </span>
                  </td>
                  <td class="p-3">
                    <div class="flex gap-1">
                      <PrimeButton
                        icon="pi pi-trash"
                        text
                        rounded
                        size="small"
                        severity="danger"
                      />
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="1">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">{{ room.roomType }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ room.bedType }} · 최대 {{ room.capacityPeople }}명
                  </p>
                </div>
                <span
                  :class="getRoomStatusClass(room.status)"
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ translateRoomStatus(room.status) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-500">기본 가격</p>
                  <p class="text-lg font-bold text-blue-600">{{ formatCurrency(room.price) }}원</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">총 객실 수</p>
                  <p class="text-lg font-bold">{{ room.capacityRoom }}개</p>
                </div>
              </div>

              <div class="pt-4 border-t flex justify-between items-center">
                <div class="text-sm">
                  <span class="text-gray-500">오늘 점유율:</span>
                  <span class="font-semibold ml-1">{{ getOccupancyRateForRoom(room) }}%</span>
                </div>
                <div class="flex gap-2">
                  <PrimeButton label="가격 수정" size="small" outlined />
                  <PrimeButton label="상태 변경" size="small" />
                </div>
              </div>
            </div>
          </div>
        </PrimeTabPanel>

        <PrimeTabPanel value="2">
          <div class="bg-white rounded-xl shadow-sm mt-4">
            <div class="p-4 border-b">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">결제 내역</h3>
                <div class="flex gap-2">
                  <PrimeDatePicker placeholder="시작일" />
                  <PrimeDatePicker placeholder="종료일" />
                  <PrimeButton label="조회" icon="pi pi-search" />
                </div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th class="p-3 text-left">결제 ID</th>
                  <th class="p-3 text-left">주문 번호</th>
                  <th class="p-3 text-left">결제 방법</th>
                  <th class="p-3 text-left">금액</th>
                  <th class="p-3 text-left">상태</th>
                  <th class="p-3 text-left">결제일시</th>
                  <th class="p-3 text-left">액션</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="p in payments" :key="p.id" class="border-b hover:bg-gray-50">
                  <td class="p-3 font-medium">#{{ p.id }}</td>
                  <td class="p-3 text-xs font-mono">{{ p.orderId }}</td>
                  <td class="p-3">
                    <div>
                      <p>{{ p.method }}</p>
                      <p class="text-xs text-gray-500">{{ p.methodType }}</p>
                    </div>
                  </td>
                  <td class="p-3 font-semibold">{{ formatCurrency(p.amount) }}원</td>
                  <td class="p-3">
                      <span
                        :class="
                          p.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        "
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ p.status === 'paid' ? '결제완료' : '대기중' }}
                      </span>
                  </td>
                  <td class="p-3 text-xs">{{ formatDate(p.transactionDate) }}</td>
                  <td class="p-3">
                    <PrimeButton
                      icon="pi pi-file-pdf"
                      text
                      rounded
                      size="small"
                      v-tooltip="'영수증'"
                    />
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="p-4 bg-gray-50 border-t">
              <div class="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p class="text-xs text-gray-500">총 결제 건수</p>
                  <p class="text-lg font-bold">{{ payments.length }}건</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">완료된 결제</p>
                  <p class="text-lg font-bold text-green-600">
                    {{ payments.filter((p) => p.status === 'paid').length }}건
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">대기중 결제</p>
                  <p class="text-lg font-bold text-yellow-600">
                    {{ payments.filter((p) => p.status !== 'paid').length }}건
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">총 결제 금액</p>
                  <p class="text-lg font-bold text-blue-600">
                    {{ formatCurrency(totalRevenue) }}원
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PrimeTabPanel>
        <PrimeTabPanel value="3">
          <div class="space-y-4 mt-4">
            <div class="bg-white rounded-xl shadow-sm p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">리뷰 관리</h3>
              </div>
              <div v-if="reviews && reviews.length > 0" class="space-y-4">
                <div
                  v-for="review in reviews"
                  :key="review.reviewId"
                  class="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="font-semibold">{{ review.userName }}</p>
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
                    <span class="text-xs text-gray-500">2일 전</span>
                  </div>
                  <p class="text-sm text-gray-700 mb-3">{{ review.comment }}</p>
                  <div v-if="!review.ownerComment" class="flex gap-2">
                    <PrimeButton label="답글 작성" size="small" icon="pi pi-reply" />
                    <PrimeButton label="신고" size="small" outlined severity="danger" />
                  </div>
                  <div v-else class="bg-blue-50 rounded-lg p-3 mt-3">
                    <p class="text-xs font-semibold text-blue-700 mb-1">숙소 답변</p>
                    <p class="text-sm">{{ review.ownerComment }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">아직 등록된 리뷰가 없습니다.</div>
            </div>
          </div>
        </PrimeTabPanel>
        <PrimeTabPanel value="4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold">매출 추이</h3>
                <div class="flex gap-1">
                  <PrimeButton
                    label="연간"
                    :outlined="salesPeriod !== 'yearly'"
                    @click="salesPeriod = 'yearly'"
                    size="small"
                  />
                  <PrimeButton
                    label="월간"
                    :outlined="salesPeriod !== 'monthly'"
                    @click="salesPeriod = 'monthly'"
                    size="small"
                  />
                  <PrimeButton
                    label="최근 30일"
                    :outlined="salesPeriod !== 'daily'"
                    @click="salesPeriod = 'daily'"
                    size="small"
                  />
                </div>
              </div>
              <div class="h-80">
                <Bar v-if="!loading" :data="salesChartData" :options="chartOptions" />
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold">예약률 추이</h3>
                <div class="flex gap-1">
                  <PrimeButton
                    label="연간"
                    :outlined="occupancyPeriod !== 'yearly'"
                    @click="occupancyPeriod = 'yearly'"
                    size="small"
                  />
                  <PrimeButton
                    label="월간"
                    :outlined="occupancyPeriod !== 'monthly'"
                    @click="occupancyPeriod = 'monthly'"
                    size="small"
                  />
                  <PrimeButton
                    label="최근 30일"
                    :outlined="occupancyPeriod !== 'daily'"
                    @click="occupancyPeriod = 'daily'"
                    size="small"
                  />
                </div>
              </div>
              <div class="h-80">
                <Line v-if="!loading" :data="occupancyChartData" :options="occupancyChartOptions" />
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <h3 class="font-semibold mb-4">주요 운영 지표</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">평균 체류 기간</p>
                  <p class="text-2xl font-bold mt-1">{{ averageLengthOfStay }}일</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">재방문율</p>
                  <p class="text-2xl font-bold mt-1">{{ revisitRate }}%</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">객단가 (ADR)</p>
                  <p class="text-2xl font-bold mt-1">{{ formatCurrency(averageDailyRate) }}원</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-500">평균 예약 리드타임</p>
                  <p class="text-2xl font-bold mt-1">{{ averageBookingLeadTime }}일</p>
                </div>
              </div>
            </div>
          </div>
        </PrimeTabPanel>
      </PrimeTabPanels>
    </PrimeTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/ko';
import Popover from 'primevue/popover';

dayjs.locale('ko');
dayjs.extend(isBetween);

// Chart.js import
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

// Chart.js 구성요소 등록
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
);

// Helper functions for formatting, translation, and styling
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('ko-KR').format(value);
};
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};
const translateApproval = (status: string): string => {
  const map: { [key: string]: string } = {
    APPROVED: '승인 완료',
    PENDING: '승인 대기',
    REJECTED: '승인 거절',
    INACTIVE: '비활성',
  };
  return map[status] || '알 수 없음';
};
const getApprovalClass = (status: string): string => {
  const map: { [key: string]: string } = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};
const translatePaymentStatus = (status: string): string => {
  return status === 'paid' ? '결제 완료' : '결제 대기';
};
const getPaymentStatusClass = (status: string): string => {
  return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
};
const translateReservationStatus = (status: string): string => {
  const map: { [key: string]: string } = {
    confirmed: '예약 확정',
    pending: '예약 대기',
    cancelled: '예약 취소',
    checked_out: '체크아웃',
  };
  return map[status] || status;
};
const getReservationStatusClass = (status: string): string => {
  const map: { [key: string]: string } = {
    confirmed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    checked_out: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};
const translateRoomStatus = (status: string): string => {
  return status === 'AVAILABLE' ? '판매중' : '판매 중지';
};
const getRoomStatusClass = (status: string): string => {
  return status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

// Component Logic
const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const place = ref<any>({});
const rooms = ref<any[]>([]);
const reservations = ref<any[]>([]);
const payments = ref<any[]>([]);
const reviews = ref<any[]>([]);
const selectedFilter = ref('all');
const statusPopover = ref();

const statusOptions = ref([
  { code: 'APPROVED', text: '승인 완료', class: 'bg-green-500', endpoint: 'approve' },
  { code: 'REJECTED', text: '승인 거절', class: 'bg-red-500', endpoint: 'reject' },
  { code: 'PENDING', text: '승인 대기', class: 'bg-yellow-500', endpoint: 'pending' },
  { code: 'INACTIVE', text: '비활성', class: 'bg-gray-500', endpoint: 'inactive' },
]);

const updatePlaceStatus = async (newStatus: string) => {
  if (place.value.status === newStatus) {
    statusPopover.value.hide();
    return;
  }
  const statusOption = statusOptions.value.find((s) => s.code === newStatus);
  if (!statusOption) {
    console.error('유효하지 않은 상태입니다:', newStatus);
    return;
  }
  try {
    const endpoint = `/v1/admin/places/${route.params.id}/${statusOption.endpoint}`;
    await apiClient.patch(endpoint);
    place.value.status = newStatus;
  } catch (err) {
    console.error('숙소 상태 변경 실패:', err);
  } finally {
    statusPopover.value.hide();
  }
};

const fetchDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await apiClient.get(`/v1/admin/places/${route.params.id}`);
    place.value = res.data.data.place;
    rooms.value = res.data.data.rooms;
    reservations.value = res.data.data.reservations.map((r: any) => ({
      ...r,
      userName: r.userName || `고객 ${r.reservationId}`,
      phone: r.phone || '010-****-****',
    }));
    payments.value = res.data.data.payments;
    reviews.value = res.data.data.reviews || [];
  } catch (err) {
    console.error('숙소 상세 조회 실패:', err);
    error.value = '데이터를 불러오는 데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetail);

const today = dayjs().format('YYYY-MM-DD');
const todayCheckIn = computed(
  () => reservations.value.filter((r) => r.resevStart === today).length,
);
const todayCheckOut = computed(() => reservations.value.filter((r) => r.resevEnd === today).length);
const totalRooms = computed(() => rooms.value.reduce((sum, r) => sum + (r.capacityRoom || 0), 0));
const currentlyStayingReservations = computed(() => {
  if (reservations.value.length === 0) return [];
  return reservations.value.filter((r) => {
    if (r.status === 'cancelled') return false;
    const start = dayjs(r.resevStart);
    const end = dayjs(r.resevEnd);
    return dayjs().isBetween(start, end, 'day', '[)');
  });
});
const occupancyRate = computed(() => {
  if (totalRooms.value === 0) return 0;
  const occupiedCount = currentlyStayingReservations.value.length;
  return Math.round((occupiedCount / totalRooms.value) * 100);
});
const getOccupancyRateForRoom = (room: any) => {
  const totalRoomCapacity = room.capacityRoom;
  if (!totalRoomCapacity || totalRoomCapacity === 0) return 0;
  const occupiedCountForRoomType = currentlyStayingReservations.value.filter(
    (res) => res.roomId === room.id,
  ).length;
  return Math.round((occupiedCountForRoomType / totalRoomCapacity) * 100);
};
const thisMonthReservations = computed(() => {
  const startOfMonth = dayjs().startOf('month');
  const endOfMonth = dayjs().endOf('month');
  return reservations.value.filter((r) => {
    const resevDate = dayjs(r.resevStart);
    return resevDate.isBetween(startOfMonth, endOfMonth, null, '[]');
  });
});
const confirmedCount = computed(
  () => thisMonthReservations.value.filter((r) => r.status === 'confirmed').length,
);
const pendingCount = computed(
  () => thisMonthReservations.value.filter((r) => r.status === 'pending').length,
);
const cancelledCount = computed(
  () => thisMonthReservations.value.filter((r) => r.status === 'cancelled').length,
);
const cancellationRate = computed(() => {
  const totalThisMonth = thisMonthReservations.value.length;
  if (totalThisMonth === 0) return 0;
  return (cancelledCount.value / totalThisMonth) * 100;
});

// ✅ [MODIFIED] 전체 기간 총 수익 (결제내역 탭에서 사용)
const totalRevenue = computed(() =>
  payments.value.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
);

// ✅ [ADD] 이번 달 수익 계산
const thisMonthRevenue = computed(() => {
  const startOfMonth = dayjs().startOf('month');
  const endOfMonth = dayjs().endOf('month');
  return payments.value
    .filter(p => p.status === 'paid' && dayjs(p.transactionDate).isBetween(startOfMonth, endOfMonth, null, '[]'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

// ✅ [ADD] 지난달 수익 계산
const lastMonthRevenue = computed(() => {
  const startOfLastMonth = dayjs().subtract(1, 'month').startOf('month');
  const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month');
  return payments.value
    .filter(p => p.status === 'paid' && dayjs(p.transactionDate).isBetween(startOfLastMonth, endOfLastMonth, null, '[]'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);
});

// ✅ [MODIFIED] 전월 대비 성장률 동적 계산
const revenueGrowth = computed(() => {
  const current = thisMonthRevenue.value;
  const previous = lastMonthRevenue.value;

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  const growth = ((current - previous) / previous) * 100;
  return parseFloat(growth.toFixed(1));
});

const alerts = computed(() => {
  const alertList = [];
  if (pendingCount.value > 10) {
    alertList.push(`대기 중인 예약이 ${pendingCount.value}건 있습니다. 확인이 필요합니다.`);
  }
  if (cancellationRate.value > 10) {
    alertList.push('최근 취소율이 평균보다 높습니다. 원인 분석이 필요할 수 있습니다.');
  }
  const unpaidReservations = reservations.value.filter(
    (r) => r.paymentStatus !== 'paid' && r.status !== 'cancelled',
  ).length;
  if (unpaidReservations > 0) {
    alertList.push(`결제가 완료되지 않은 예약이 ${unpaidReservations}건 있습니다.`);
  }
  return alertList;
});
const filteredReservations = computed(() => {
  switch (selectedFilter.value) {
    case 'today':
      return reservations.value.filter((r) => r.resevStart === today);
    case 'pending':
      return reservations.value.filter((r) => r.status === 'pending');
    case 'issue':
      return reservations.value.filter((r) => r.paymentStatus === 'unpaid' || r.finalAmount < 0);
    default:
      return reservations.value;
  }
});

// 주요 운영 지표(KPI) 동적 계산
const validReservations = computed(() =>
  reservations.value.filter((r) => r.status === 'confirmed' || r.status === 'checked_out'),
);
const averageLengthOfStay = computed(() => {
  if (validReservations.value.length === 0) return 0;
  const totalNights = validReservations.value.reduce((sum, r) => {
    const start = dayjs(r.resevStart);
    const end = dayjs(r.resevEnd);
    return sum + end.diff(start, 'day');
  }, 0);
  return (totalNights / validReservations.value.length).toFixed(1);
});
const revisitRate = computed(() => {
  if (validReservations.value.length < 2) return 0;
  const customerEmails = validReservations.value.map((r) => r.email).filter((email) => email);
  if (customerEmails.length === 0) return 0;
  const visitCounts = customerEmails.reduce(
    (acc, email) => {
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const uniqueCustomers = Object.keys(visitCounts).length;
  const repeatCustomers = Object.values(visitCounts).filter((count) => count > 1).length;
  if (uniqueCustomers === 0) return 0;
  return Math.round((repeatCustomers / uniqueCustomers) * 100);
});
const averageDailyRate = computed(() => {
  if (validReservations.value.length === 0) return 0;
  const totalRevenueFromStays = validReservations.value.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalNights = validReservations.value.reduce((sum, r) => {
    const start = dayjs(r.resevStart);
    const end = dayjs(r.resevEnd);
    return sum + end.diff(start, 'day');
  }, 0);
  if (totalNights === 0) return 0;
  return Math.round(totalRevenueFromStays / totalNights);
});
const averageBookingLeadTime = computed(() => {
  const reservationsWithCreationDate = validReservations.value.filter((r) => r.createdAt);
  if (reservationsWithCreationDate.length === 0) return 0;
  const totalLeadTime = reservationsWithCreationDate.reduce((sum, r) => {
    const creationDate = dayjs(r.createdAt);
    const checkinDate = dayjs(r.resevStart);
    return sum + checkinDate.diff(creationDate, 'day');
  }, 0);
  return (totalLeadTime / reservationsWithCreationDate.length).toFixed(1);
});

// 통계 차트 로직
const salesPeriod = ref<'yearly' | 'monthly' | 'daily'>('yearly');
const occupancyPeriod = ref<'yearly' | 'monthly' | 'daily'>('monthly');
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { ticks: { callback: (value: any) => `${(value / 1000).toLocaleString()}k` } } },
});
const occupancyChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { max: 100, ticks: { callback: (value: any) => `${value}%` } } },
});
const salesChartData = computed(() => {
  const paidPayments = payments.value.filter((p) => p.status === 'paid');
  let labels: string[] = [];
  let data: number[] = [];
  switch (salesPeriod.value) {
    case 'yearly': {
      labels = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
      const monthlySales = Array(12).fill(0);
      paidPayments
        .filter((p) => dayjs(p.transactionDate).isSame(dayjs(), 'year'))
        .forEach((p) => {
          const month = dayjs(p.transactionDate).month();
          monthlySales[month] += p.amount;
        });
      data = monthlySales;
      break;
    }
    case 'monthly': {
      const daysInMonth = dayjs().daysInMonth();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);
      const dailySales = Array(daysInMonth).fill(0);
      paidPayments
        .filter((p) => dayjs(p.transactionDate).isSame(dayjs(), 'month'))
        .forEach((p) => {
          const day = dayjs(p.transactionDate).date() - 1;
          dailySales[day] += p.amount;
        });
      data = dailySales;
      break;
    }
    case 'daily': {
      const dailyData = Array(30).fill(0);
      const dateLabels: string[] = [];
      const today = dayjs();
      for (let i = 29; i >= 0; i--) {
        const date = today.subtract(i, 'day');
        dateLabels.push(date.format('M/D'));
        dailyData[29 - i] = paidPayments
          .filter((p) => dayjs(p.transactionDate).isSame(date, 'day'))
          .reduce((sum, p) => sum + p.amount, 0);
      }
      labels = dateLabels;
      data = dailyData;
      break;
    }
  }
  return {
    labels,
    datasets: [{ label: '매출', backgroundColor: '#3b82f6', borderColor: '#3b82f6', data }],
  };
});
const occupancyChartData = computed(() => {
  let labels: string[] = [];
  let data: number[] = [];
  if (totalRooms.value === 0) return { labels, datasets: [] };
  switch (occupancyPeriod.value) {
    case 'yearly': {
      labels = Array.from({ length: 12 }, (_, i) => `${dayjs().year()}년 ${i + 1}월`);
      data = labels.map((_, i) => {
        const monthDate = dayjs().month(i);
        const daysInMonth = monthDate.daysInMonth();
        let totalOccupiedRoomDays = 0;
        for (let j = 1; j <= daysInMonth; j++) {
          const currentDay = monthDate.date(j);
          totalOccupiedRoomDays += reservations.value.filter(
            (r) =>
              r.status !== 'cancelled' &&
              currentDay.isBetween(dayjs(r.resevStart), dayjs(r.resevEnd), 'day', '[)'),
          ).length;
        }
        return Math.round((totalOccupiedRoomDays / (totalRooms.value * daysInMonth)) * 100);
      });
      break;
    }
    case 'monthly': {
      const daysInMonth = dayjs().daysInMonth();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);
      data = labels.map((_, i) => {
        const currentDay = dayjs().date(i + 1);
        const occupiedCount = reservations.value.filter(
          (r) =>
            r.status !== 'cancelled' &&
            currentDay.isBetween(dayjs(r.resevStart), dayjs(r.resevEnd), 'day', '[)'),
        ).length;
        return Math.round((occupiedCount / totalRooms.value) * 100);
      });
      break;
    }
    case 'daily': {
      const dailyData: number[] = [];
      const dateLabels: string[] = [];
      const today = dayjs();
      for (let i = 29; i >= 0; i--) {
        const currentDay = today.subtract(i, 'day');
        dateLabels.push(currentDay.format('M/D'));
        const occupiedCount = reservations.value.filter(
          (r) =>
            r.status !== 'cancelled' &&
            currentDay.isBetween(dayjs(r.resevStart), dayjs(r.resevEnd), 'day', '[)'),
        ).length;
        dailyData.push(Math.round((occupiedCount / totalRooms.value) * 100));
      }
      labels = dateLabels;
      data = dailyData;
      break;
    }
  }
  return {
    labels,
    datasets: [
      {
        label: '예약률',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        data,
        fill: true,
        tension: 0.3,
      },
    ],
  };
});
</script>
