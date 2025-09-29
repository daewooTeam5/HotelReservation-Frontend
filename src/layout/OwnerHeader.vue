<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center justify-between px-6 relative"
  >

    <h1
      class="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold
             bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
             cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="router.push('/')"
    >
      Hotel Reservation
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-3 absolute right-6">
      <div class="relative" ref="profileRef">
        <Button
          @click.stop="toggleProfileMenu"
          class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 border-0 bg-transparent"
        >
          <!-- ✅ ProfileStore에서 이미지 가져오기 -->
          <img
            v-if="images.length"
            :src="images[0]"
            alt="프로필 이미지"
            class="rounded-full w-8 h-8 object-cover border"
          />
          <div
            v-else
            class="rounded-full w-8 h-8 bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <i class="pi pi-user text-sm"></i>
          </div>

          <!-- ✅ ProfileStore에서 이름 가져오기 -->
          <span class="text-sm font-medium text-gray-700 hidden md:inline">
        {{ profile.name }}
      </span>
          <i class="pi pi-angle-down text-gray-500 text-xs"></i>
        </Button>

        <!-- 드롭다운 -->
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
import { apiClient } from '@/utils/axiosClient.ts';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/publishing/ProfileStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const { profile, images } = storeToRefs(profileStore);

const isProfileMenuOpen = ref(false);
const profileRef = ref<HTMLElement | null>(null);

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const navigateToProfile = () => {
  router.push('/owner/profile');
  isProfileMenuOpen.value = false;
};

const navigateToSettings = () => {
  router.push('/owner/settings');
  isProfileMenuOpen.value = false;
};

const logout = async () => {
  try {
    await apiClient.post('../logout', null, { withCredentials: true });
    authStore.setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('placeId');
    await router.push('/auth/signin');
  } catch (e) {
    console.error('로그아웃 실패:', e);
  } finally {
    isProfileMenuOpen.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (profileRef.value && !profileRef.value.contains(target)) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
