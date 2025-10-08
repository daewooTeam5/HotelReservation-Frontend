<template>
  <aside
    class="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col transition-all duration-300 relative"
    :class="isOpen ? 'w-64' : 'w-0'"
  >
    <div v-if="isOpen" class="flex items-center justify-between p-4 border-b border-gray-700/50">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <i class="pi pi-building text-white text-sm"></i>
        </div>
        <span class="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        </span>

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
                class="text-base transition-colors duration-200 text-white"
                :style="$route.path === item.path ? 'color: white' : 'color: white'"
              ></i>
            </div>
            <span
              class="font-medium text-base transition-colors duration-200"
              :class="$route.path === item.path ? 'text-white' : 'text-white'"
            >
            {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div
      class="mt-auto px-4 py-3 border-t border-gray-700/50 text-xs text-gray-400"
    >
      ⓒ 2025 Hotel Reservation<br />
      v1.0.0
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


// 배지 제거된 메뉴 리스트
const menuItems = computed(() => [
  { name: "대시보드", path: "/admin", icon: "pi pi-th-large" },
  { name: "숙소 관리", path: "/admin/place", icon: "pi pi-building" },
  { name: "유저 관리", path: "/admin/user", icon: "pi pi-user" },
  { name: "리뷰 관리", path: "/admin/review", icon: "pi pi-star" },
  { name: "결제 관리", path: "/admin/payment", icon: "pi pi-wallet" },
  { name: "통계", path: "/admin/statistics", icon: "pi pi-chart-bar" },
]);
</script>
