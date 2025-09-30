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
      @click="router.push('/admin')"
    >
      Hotel Reservation
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-3 relative">
      <UserProfile type="admin"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import UserProfile from '@/components/common/UserProfile.vue';
import { useAuthStore } from '@/stores/authStore.ts';
import type { UserDto } from '@/types/users.ts';
import { onMounted, ref } from 'vue';
import { parseJwt } from '@/utils/jwtUtils.ts';
import { apiClient } from '@/utils/axiosClient.ts';

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

defineEmits<{
  toggleSidebar: []
}>();
</script>
