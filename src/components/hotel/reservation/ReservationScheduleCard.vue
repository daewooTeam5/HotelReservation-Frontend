<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  checkIn: string;
  checkOut: string;
}>();

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];

  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

// 숙박 일수 계산
const numberOfNights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0;

  const checkInDate = new Date(props.checkIn);
  const checkOutDate = new Date(props.checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// 체크인/체크아웃 시간
const checkInTime = '15:00';
const checkOutTime = '11:00';
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-calendar text-blue-500"></i>
          투숙 일정
        </h3>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-4">
        <!-- 체크인 정보 -->
        <div class="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="pi pi-sign-in text-white text-lg"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-green-800 mb-1">체크인</h4>
            <p class="text-green-700 text-sm mb-1">{{ formatDate(checkIn) }}</p>
            <p class="text-green-600 text-xs">{{ checkInTime }} 이후</p>
          </div>
        </div>

        <!-- 숙박 기간 표시 -->
        <div class="text-center py-2">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <i class="pi pi-moon text-blue-600"></i>
            <span class="font-semibold text-blue-800">{{ numberOfNights }}박 {{ numberOfNights + 1 }}일</span>
          </div>
        </div>

        <!-- 체크아웃 정보 -->
        <div class="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
          <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="pi pi-sign-out text-white text-lg"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 mb-1">체크아웃</h4>
            <p class="text-red-700 text-sm mb-1">{{ formatDate(checkOut) }}</p>
            <p class="text-red-600 text-xs">{{ checkOutTime }} 까지</p>
          </div>
        </div>

        <!-- 안내 메시지 -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-gray-500 mt-0.5"></i>
            <div class="text-xs text-gray-600">
              <p class="font-medium mb-1">체크인/아웃 시간 안내</p>
              <p>• 체크인: 오후 3시부터 가능</p>
              <p>• 체크아웃: 오전 11시까지</p>
              <p class="mt-1 text-gray-500">시간 변경이 필요하시면 호텔에 직접 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
</style>
