<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center px-4 lg:px-6 relative"
  >
    <!-- 모바일 햄버거 메뉴 -->
    <button
      @click="$emit('toggleSidebar')"
      class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors mr-3"
    >
      <i class="pi pi-bars text-xl text-gray-700"></i>
    </button>

    <!-- 가운데 타이틀 -->
    <h1
      class="absolute left-1/2 transform -translate-x-1/2 text-base md:text-2xl lg:text-3xl font-bold
             bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
             cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="router.push('/')"
    >
      <span class="hidden md:inline">Hotel Reservation Hotel Owner</span>
      <span class="md:hidden">Hotel Owner</span>
    </h1>

    <!-- 오른쪽 끝 프로필 -->
    <div class="absolute right-4 lg:right-6 flex items-center space-x-3">
      <UserProfile type="admin" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import UserProfile from "@/components/common/UserProfile.vue";

const router = useRouter();

defineEmits<{
  toggleSidebar: [];
}>();
</script>

<style scoped>
</style>
