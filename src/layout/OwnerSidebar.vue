<template>
  <aside
    class="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col relative"
  >
    <!-- 헤더 영역 -->
    <div
      class="h-16 flex items-center justify-between px-4 border-b border-gray-700/50"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
        >
          <i class="pi pi-building text-white text-sm"></i>
        </div>
        <span
          class="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
        >
           &nbsp;Hotel Owner
        </span>
      </div>
    </div>

    <!-- 네비게이션 메뉴 -->
    <nav class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-3">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="group flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/10 hover:translate-x-1"
            :class="[
              $route.path === item.path
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                : 'text-gray-300 hover:text-white'
            ]"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              :class="[
                $route.path === item.path
                  ? 'bg-white/20'
                  : 'group-hover:bg-white/10'
              ]"
            >
              <i
                :class="item.icon"
                class="text-base transition-colors duration-200"
                :style="$route.path === item.path ? 'color: white' : ''"
              ></i>
            </div>
            <span
              class="font-medium text-base transition-colors duration-200"
              :class="$route.path === item.path ? 'text-white' : ''"
            >
              {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 하단 브랜드/버전 정보 -->
    <div
      class="mt-auto px-4 py-3 border-t border-gray-700/50 text-xs text-gray-400"
    >
      ⓒ 2025 Hotel Reservation<br />
      v1.0.0
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 메뉴 리스트
const menuItems = computed(() => [
  { name: "대시보드", path: "/owner", icon: "pi pi-th-large" },
  { name: "숙소 관리", path: "/owner/place", icon: "pi pi-building" },
  { name: "객실 관리", path: "/owner/rooms", icon: "pi pi-home" },
  { name: "예약 관리", path: "/owner/reservations", icon: "pi pi-calendar" },
  { name: "리뷰 관리", path: "/owner/reviews", icon: "pi pi-star" },
  { name: "문의 관리", path: "/owner/inquiries", icon: "pi pi-question-circle" },
  { name: "쿠폰 관리", path: "/owner/coupons", icon: "pi pi-ticket" },
  { name: "통계", path: "/owner/statistics", icon: "pi pi-chart-bar" }
]);
</script>
