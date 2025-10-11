<template>
  <!-- 상단 헤더 -->
  <header class="h-16 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="h-full w-full px-4 md:px-6 flex items-center justify-between">
      <!-- 왼쪽: 햄버거 메뉴 (모바일) + 로고 -->
      <div class="flex items-center gap-2">
        <!-- 햄버거 메뉴 버튼 (프로필 레이아웃에서만 표시) -->
        <button
          v-if="showMenuButton"
          @click="$emit('toggleSidebar')"
          class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-bars text-xl text-gray-700"></i>
        </button>

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
      </div>

      <!-- 오른쪽: 액션 버튼들 -->
      <div class="flex items-center gap-2 md:gap-3">
        <!-- 데스크톱: 모든 버튼 표시 -->
        <template v-if="!isMobile">
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
            class="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            label="내 호텔 관리"
            text
          />

          <!-- 관리자 페이지 버튼 -->
          <Button
            v-if="['admin', 'place_admin', 'user_admin'].includes(authStore.userAuth?.role ?? '')"
            @click="router.push('/admin')"
            class="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
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
                <span>로그인/회원가입</span>
              </button>
            </RouterLink>
          </template>
        </template>

        <!-- 모바일: 권한별 버튼 + 알림만 표시 -->
        <template v-else>
          <!-- 호텔 관리 버튼 (호텔 소유자) -->
          <button
            v-if="authStore.userAuth?.role === 'hotel_owner'"
            @click="router.push('/owner')"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <i class="pi pi-building text-gray-700"></i>
          </button>

          <!-- 관리자 페이지 버튼 -->
          <button
            v-if="['admin', 'place_admin', 'user_admin'].includes(authStore.userAuth?.role ?? '')"
            @click="router.push('/admin')"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <i class="pi pi-cog text-gray-700"></i>
          </button>

          <!-- 알림 버튼 (로그인 시) -->
          <div v-if="user" class="relative">
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
        </template>
      </div>
    </div>
  </header>

  <!-- 모바일 바텀 네비게이션 -->
  <nav v-if="isMobile" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
    <div class="flex items-center justify-around h-16 px-2">
      <!-- 홈 -->
      <button
        @click="router.push('/')"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="route.path === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
      >
        <i class="pi pi-home text-xl mb-1"></i>
        <span class="text-xs font-medium">홈</span>
      </button>

      <!-- 검색 -->
      <button
        @click="router.push('/places/search')"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="route.path.startsWith('/places') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
      >
        <i class="pi pi-search text-xl mb-1"></i>
        <span class="text-xs font-medium">검색</span>
      </button>

      <!-- 위시리스트 (로그인 시) -->
      <button
        v-if="user"
        @click="router.push('/profile/wishlist')"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="route.path === '/profile/wishlist' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
      >
        <i class="pi pi-heart text-xl mb-1"></i>
        <span class="text-xs font-medium">위시리스트</span>
      </button>

      <!-- 비회원 예약 조회 (비로그인 시) -->
      <button
        v-else
        @click="router.push('/guest/reservation-search')"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="route.path === '/guest/reservation-search' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
      >
        <i class="pi pi-calendar text-xl mb-1"></i>
        <span class="text-xs font-medium">예약조회</span>
      </button>

      <!-- 프로필 -->
      <button
        v-if="user"
        @click="router.push('/profile/account')"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="route.path.startsWith('/profile') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
      >
        <i class="pi pi-user text-xl mb-1"></i>
        <span class="text-xs font-medium">프로필</span>
      </button>

      <!-- 로그인 버튼 (비로그인 시) -->
      <button
        v-else
        @click="router.push('/auth/signin')"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors text-gray-600 hover:text-blue-600"
      >
        <i class="pi pi-sign-in text-xl mb-1"></i>
        <span class="text-xs font-medium">로그인</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import UserProfile from '@/components/common/UserProfile.vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import PrimeBadge from 'primevue/badge';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartCount = ref(0);

// 모바일 감지
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // md breakpoint
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// 프로필 레이아웃에서만 햄버거 메뉴 버튼 표시
const showMenuButton = computed(() => {
  return route.meta.layout === 'profile';
});

defineEmits<{
  toggleSidebar: [];
}>();

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
