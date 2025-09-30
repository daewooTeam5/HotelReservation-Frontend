<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center justify-between px-6 relative"
  >
    <!-- 사이드바 토글 버튼 -->
    <button
      @click="$emit('toggleSidebar')"
      class="p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 group"
    >
      <i
        class="pi pi-bars text-gray-700 group-hover:text-gray-900 transition-colors duration-200"
      ></i>
    </button>

    <!-- 타이틀 (클릭 시 대시보드 이동) -->
    <h1
      class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="$router.push('/admin')"
    >
      Hotel Reservation
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-3 relative">
      <!-- 프로필 버튼 -->
      <div class="relative" ref="profileRef">
        <Button
          @click.stop="toggleProfileMenu"
          class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 border-0 bg-transparent"
        >
          <!-- 동적 아바타 -->
          <Gravatar
            class="rounded-full w-8 h-8"
            :email="userAuth?.name +'@gmail.com'"
            :size="80"
            default="identicon"
          />
          <span class="text-sm font-medium text-gray-700 hidden md:inline">
            {{ user?.name || '관리자' }}
          </span>
          <i class="pi pi-angle-down text-gray-500 text-xs"></i>
        </Button>

        <!-- 프로필 드롭다운 -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 transform scale-95"
          enter-to-class="opacity-100 transform scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 transform scale-100"
          leave-to-class="opacity-0 transform scale-95"
        >
          <div
            v-if="isProfileMenuOpen"
            class="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-2xl z-[9999] overflow-hidden"
          >
            <div class="py-2">
              <button
                class="w-full text-left px-4 py-3 hover:bg-gray-50/50 transition-colors duration-200 flex items-center space-x-3"
                @click="navigateToProfile"
              >
                <i class="pi pi-user text-gray-500"></i>
                <span class="text-sm text-gray-700">내 프로필</span>
              </button>
              <button
                class="w-full text-left px-4 py-3 hover:bg-gray-50/50 transition-colors duration-200 flex items-center space-x-3"
                @click="navigateToSettings"
              >
                <i class="pi pi-cog text-gray-500"></i>
                <span class="text-sm text-gray-700">설정</span>
              </button>
              <hr class="my-2 border-gray-200/50" />
              <button
                class="w-full text-left px-4 py-3 hover:bg-red-50/50 text-red-600 transition-colors duration-200 flex items-center space-x-3"
                @click="logout"
              >
                <i class="pi pi-sign-out"></i>
                <span class="text-sm font-medium">로그아웃</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { Gravatar } from '@sauromates/vue-gravatar';
import { apiClient } from '@/utils/axiosClient.ts';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';

const router = useRouter();
const { setAccessToken, accessToken, userAuth, getAccessToken } = useAuthStore();

// 사용자 정보 추출
const user = ref<UserDto | null>(null);
if (accessToken) {
  user.value = parseJwt<UserDto>(accessToken);
}

// 상태
const isProfileMenuOpen = ref(false);
const profileRef = ref<HTMLElement | null>(null);

// 토글 함수
const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

// 네비게이션 함수
const navigateToProfile = () => {
  router.push('/admin/profile');
  isProfileMenuOpen.value = false;
};

const navigateToSettings = () => {
  router.push('/admin/settings');
  isProfileMenuOpen.value = false;
};

// 로그아웃
const logout = async () => {
  try {
    await apiClient.post('../logout', null, { withCredentials: true });
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('placeId');
    router.push('/login1');
  } catch (e) {
    console.error('로그아웃 실패:', e);
  } finally {
    isProfileMenuOpen.value = false;
  }
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (profileRef.value && !profileRef.value.contains(target)) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
