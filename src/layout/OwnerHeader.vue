<template>
  <header class="h-16 bg-white shadow flex items-center justify-between px-6 relative">
    <!-- 사이드바 토글 버튼 -->
    <button
      @click="$emit('toggleSidebar')"
      class="p-2 rounded-md hover:bg-gray-100"
    >
      <i class="pi pi-bars text-gray-700"></i>
    </button>

    <!-- 타이틀 (클릭 시 대시보드 이동) -->
    <h1
      class="text-lg font-semibold cursor-pointer hover:text-blue-600"
      @click="$router.push('/owner')"
    >
      숙소 관리자 페이지
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-4 relative">
      <!-- 알림 버튼 -->
      <div class="relative" ref="notificationRef">
        <Button
          icon="pi pi-bell"
          class="p-button-text"
          @click.stop="toggleNotifications"
        />
        <span
          v-if="unreadCount > 0"
          class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1"
        >
          {{ unreadCount }}
        </span>

        <!-- 알림 드롭다운 -->
        <div
          v-if="isNotificationsOpen"
          class="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50"
        >
          <ul>
            <li class="p-3 border-b hover:bg-gray-50 cursor-pointer">
              새 예약이 들어왔습니다.
            </li>
            <li class="p-3 border-b hover:bg-gray-50 cursor-pointer">
              오늘 체크인 고객이 있습니다.
            </li>
            <li class="p-3 hover:bg-gray-50 cursor-pointer">
              리뷰가 작성되었습니다.
            </li>
          </ul>
        </div>
      </div>

      <!-- 프로필 버튼 -->
      <div class="relative" ref="profileRef">
        <Button
          icon="pi pi-user"
          class="p-button-text"
          @click.stop="toggleProfileMenu"
        />
        <!-- 프로필 드롭다운 -->
        <div
          v-if="isProfileMenuOpen"
          class="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50"
        >
          <ul>
            <li
              class="p-3 border-b hover:bg-gray-50 cursor-pointer"
              @click="$router.push('/owner/profile')"
            >
              내 프로필
            </li>
            <li
              class="p-3 border-b hover:bg-gray-50 cursor-pointer"
              @click="$router.push('/owner/settings')"
            >
              설정
            </li>
            <li class="p-3 hover:bg-gray-50 text-red-500 cursor-pointer">
              로그아웃
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Button from "primevue/button";

const emit = defineEmits<{
  (e: "toggleSidebar"): void;
}>();

// 상태
const isNotificationsOpen = ref(false);
const isProfileMenuOpen = ref(false);
const unreadCount = ref(3);

// ref (드롭다운 영역)
const notificationRef = ref<HTMLElement | null>(null);
const profileRef = ref<HTMLElement | null>(null);

// 토글 함수
const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  isProfileMenuOpen.value = false;
};
const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
  isNotificationsOpen.value = false;
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    notificationRef.value &&
    !notificationRef.value.contains(target) &&
    profileRef.value &&
    !profileRef.value.contains(target)
  ) {
    isNotificationsOpen.value = false;
    isProfileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>
