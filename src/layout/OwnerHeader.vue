<template>
  <header class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center justify-between px-6 relative">
    <!-- 사이드바 토글 버튼 -->
    <button
      @click="$emit('toggleSidebar')"
      class="p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 group"
    >
      <i class="pi pi-bars text-gray-700 group-hover:text-gray-900 transition-colors duration-200"></i>
    </button>

    <!-- 타이틀 (클릭 시 대시보드 이동) -->
    <h1
      class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="$router.push('/owner')"
    >
      호텔 관리자
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-3 relative">
      <!-- 알림 버튼 -->
      <div class="relative" ref="notificationRef">
        <Button
          @click.stop="toggleNotifications"
          class="relative p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 border-0 bg-transparent"
        >
          <i class="pi pi-bell text-gray-700 text-lg"></i>
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg animate-pulse"
          >
            {{ unreadCount }}
          </span>
        </Button>

        <!-- 알림 드롭다운 -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 transform scale-95"
          enter-to-class="opacity-100 transform scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 transform scale-100"
          leave-to-class="opacity-0 transform scale-95"
        >
          <div
            v-if="isNotificationsOpen"
            class="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/30">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <i class="pi pi-bell mr-2 text-blue-600"></i>
                알림
              </h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div
                v-for="(notification, index) in notifications"
                :key="index"
                class="p-4 border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer group"
                @click="markAsRead(index)"
              >
                <div class="flex items-start space-x-3">
                  <div :class="notification.iconClass" class="w-8 h-8 rounded-lg flex items-center justify-center">
                    <i :class="notification.icon" class="text-sm text-white"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                  </div>
                  <div v-if="!notification.read" class="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div class="p-3 bg-gray-50/50 text-center">
              <button class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                모든 알림 보기
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 프로필 버튼 -->
      <div class="relative" ref="profileRef">
        <Button
          @click.stop="toggleProfileMenu"
          class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 border-0 bg-transparent"
        >
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <i class="pi pi-user text-white text-sm"></i>
          </div>
          <span class="text-sm font-medium text-gray-700 hidden md:inline">관리자</span>
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
            class="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-2xl z-50 overflow-hidden"
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";

const router = useRouter();

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

// 알림 데이터
const notifications = ref([
  {
    title: "새 예약",
    message: "디럭스 룸 예약이 접수되었습니다.",
    time: "5분 전",
    icon: "pi pi-calendar-plus",
    iconClass: "bg-green-500",
    read: false
  },
  {
    title: "체크인 알림",
    message: "오늘 체크인 예정인 고객이 3명 있습니다.",
    time: "1시간 전",
    icon: "pi pi-home",
    iconClass: "bg-blue-500",
    read: false
  },
  {
    title: "새 리뷰",
    message: "스탠다드 룸에 새로운 리뷰가 등록되었습니다.",
    time: "2시간 전",
    icon: "pi pi-star",
    iconClass: "bg-yellow-500",
    read: true
  }
]);

// 토글 함수
const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  isProfileMenuOpen.value = false;
};

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
  isNotificationsOpen.value = false;
};

// 알림 읽음 처리
const markAsRead = (index: number) => {
  notifications.value[index].read = true;
  unreadCount.value = notifications.value.filter(n => !n.read).length;
};

// 네비게이션 함수
const navigateToProfile = () => {
  router.push('/owner/profile');
  isProfileMenuOpen.value = false;
};

const navigateToSettings = () => {
  router.push('/owner/settings');
  isProfileMenuOpen.value = false;
};

const logout = () => {
  // 로그아웃 로직 구현
  console.log('로그아웃');
  isProfileMenuOpen.value = false;
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
