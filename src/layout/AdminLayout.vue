<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Mobile Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- 헤더 영역 -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="pi pi-cog text-white text-sm"></i>
          </div>
          <span class="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            &nbsp;Admin Panel
          </span>
        </div>
        <!-- 모바일 닫기 버튼 -->
        <button
          class="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          @click="isSidebarOpen = false"
        >
          <i class="pi pi-times text-white"></i>
        </button>
      </div>

      <!-- 네비게이션 메뉴 -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-3">
          <li v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              @click="isSidebarOpen = false"
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
                  class="text-base transition-colors duration-200 text-white"
                ></i>
              </div>
              <span class="font-medium text-base transition-colors duration-200 text-white">
                {{ item.name }}
              </span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 하단 브랜드/버전 정보 -->
      <div class="mt-auto px-4 py-3 border-t border-gray-700/50 text-xs text-gray-400">
        ⓒ 2025 Hotel Reservation<br />
        v1.0.0
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 min-w-0 bg-gray-50 flex flex-col overflow-hidden">
      <!-- Header -->
      <AdminHeader @toggleSidebar="toggleSidebar" />

      <!-- Content -->
      <section class="p-4 lg:p-6 overflow-y-auto flex-1">
        <router-view />
      </section>

      <!-- Footer -->
      <AdminFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminHeader from './AdminHeader.vue';
import AdminFooter from './AdminFooter.vue';

const route = useRoute();
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// 메뉴 리스트
const menuItems = computed(() => [
  { name: "대시보드", path: "/admin", icon: "pi pi-th-large" },
  { name: "숙소 관리", path: "/admin/place", icon: "pi pi-building" },
  { name: "유저 관리", path: "/admin/user", icon: "pi pi-user" },
  { name: "리뷰 관리", path: "/admin/review", icon: "pi pi-star" },
  { name: "결제 관리", path: "/admin/payment", icon: "pi pi-wallet" },
  { name: "통계", path: "/admin/statistics", icon: "pi pi-chart-bar" }
]);
</script>
