<template>
  <header class="h-16 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="h-full w-full px-4 md:px-6 flex items-center justify-between">
      <!-- 왼쪽: 로고 -->
      <div
        class="flex items-center gap-2 cursor-pointer group"
        @click="router.push('/')"
      >
        <div class="w-12 h-12 flex items-center justify-center">
          <img src="/images/logo.png"/>
        </div>
        <h1 class="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          Hotel Reservation
        </h1>
      </div>

      <!-- 오른쪽: 액션 버튼들 -->
      <div class="flex items-center gap-2 md:gap-3">
        <!-- 비회원 예약 조회 -->
        <Button
          v-if="!accessToken"
          @click="router.push('/guest/reservation-search')"
          class="text-sm md:text-base px-3 md:px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
          label="비회원 예약 조회"
          text
        />

        <!-- 호텔 관리 버튼 (호텔 소유자) -->
        <Button
          v-if="authStore.userAuth?.role === 'hotel_owner'"
          @click="router.push('/owner')"
          class="hidden md:inline-flex text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
          label="내 호텔 관리"
          text
        />

        <!-- 관리자 페이지 버튼 -->
        <Button
          v-if="['admin', 'place_admin', 'user_admin'].includes(authStore.userAuth?.role ?? '')"
          @click="router.push('/admin')"
          class="hidden md:inline-flex text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
          label="관리자 페이지"
          text
        />

        <!-- 로그인된 경우 -->
        <template v-if="user">
          <!-- 알림 버튼 -->
          <div class="relative">
            <button
              @click="router.push('/notifications')"
              class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors relative"
            >
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <PrimeBadge
                v-if="notificationCount > 0"
                :value="notificationCount > 9 ? '9+' : notificationCount.toString()"
                severity="danger"
                class="absolute -top-1 -right-1 !rounded-full !text-xs !min-w-[18px] !h-[18px] !leading-[18px]"
              />
            </button>
          </div>

          <!-- 프로필 -->
          <UserProfile type="user" />
        </template>

        <!-- 로그인 안 된 경우 -->
        <template v-else>
          <RouterLink to="/auth/signin">
            <button class="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span class="hidden md:inline">로그인/회원가입</span>
              <span class="md:hidden">로그인</span>
            </button>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import UserProfile from '@/components/common/UserProfile.vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import PrimeBadge from 'primevue/badge';

const router = useRouter();
const authStore = useAuthStore();
const cartCount = ref(0);

const accessToken = computed(() => authStore.accessToken);
const user = computed<UserDto | null>(() => {
  if (!accessToken.value) return null;
  return parseJwt<UserDto>(accessToken.value);
});

const {isLoading, data} = useQuery<ApiResult<number>>({
  queryKey:['v1','notification','my','count'],
  queryFn:httpFetcher,
  enabled: computed(() => !!accessToken.value),
  refetchInterval: 30000
});

const notificationCount = computed(() => {
  return data.value?.data ?? 0;
});

watch(
  () => accessToken.value,
  async (newToken) => {
    if (newToken) {
      try {
        const res = await apiClient.get('/v1/cart');
        cartCount.value = res.data.data ?? 0;
      } catch (err) {
        console.error('장바구니 개수 불러오기 실패:', err);
      }
    } else {
      cartCount.value = 0;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
</style>
