<template>
  <aside
    class="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col transition-all duration-300 relative"
    :class="isOpen ? 'w-64' : 'w-0'"
  >
    <!-- 헤더 영역 -->
    <div v-if="isOpen" class="flex items-center justify-between p-4 border-b border-gray-700/50">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <i class="pi pi-building text-white text-sm"></i>
        </div>
        <span class="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">호텔 관리</span>
      </div>
      <!-- 닫기 버튼 -->
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
      >
        <i class="pi pi-times text-gray-300 hover:text-white transition-colors duration-200"></i>
      </button>
    </div>

    <!-- 네비게이션 메뉴 -->
    <nav v-if="isOpen" class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/10 hover:translate-x-1"
            :class="[
              $route.path === item.path
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                : 'text-gray-300 hover:text-white'
            ]"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              :class="[
                $route.path === item.path
                  ? 'bg-white/20'
                  : 'group-hover:bg-white/10'
              ]"
            >
              <i
                :class="item.icon"
                class="text-sm transition-colors duration-200"
                :style="$route.path === item.path ? 'color: white' : ''"
              ></i>
            </div>
            <span
              class="font-medium transition-colors duration-200"
              :class="$route.path === item.path ? 'text-white' : ''"
            >
              {{ item.name }}
            </span>
            <div
              v-if="item.badge"
              class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold"
            >
              {{ item.badge }}
            </div>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 하단 영역 (사용자 정보 등) -->
    <div v-if="isOpen" class="p-4 border-t border-gray-700/50">
      <div class="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <i class="pi pi-user text-white"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">관리자</p>
          <p class="text-xs text-gray-400 truncate">admin@hotel.com</p>
        </div>
        <button class="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200">
          <i class="pi pi-cog text-gray-400 hover:text-white text-sm"></i>
        </button>
      </div>
    </div>

    <!-- 사이드바 열기 버튼 (닫혀있을 때) -->
    <button
      v-if="!isOpen"
      @click="$emit('toggle')"
      class="absolute top-4 -right-3 w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg border border-gray-600"
    >
      <i class="pi pi-angle-right text-white text-xs"></i>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

defineProps<{ isOpen: boolean }>();
defineEmits<{
  (e: "close"): void;
  (e: "toggle"): void;
}>();

const menuItems = computed(() => [
  {
    name: "대시보드",
    path: "/owner",
    icon: "pi pi-th-large"
  },
  {
    name: "숙소 관리",
    path: "/owner/place",
    icon: "pi pi-building"
  },
  {
    name: "객실 관리",
    path: "/owner/rooms",
    icon: "pi pi-home"
  },
  {
    name: "예약 관리",
    path: "/owner/reservations",
    icon: "pi pi-calendar",
    badge: "5"
  },
  {
    name: "리뷰 관리",
    path: "/owner/reviews",
    icon: "pi pi-star",
    badge: "2"
  },
  {
    name: "문의 관리",
    path: "/owner/inquiries",
    icon: "pi pi-question-circle"
  },
  {
    name: "통계",
    path: "/owner/statistics",
    icon: "pi pi-chart-bar"
  },
  {
    name: "설정",
    path: "/owner/settings",
    icon: "pi pi-cog"
  }
]);
</script>
