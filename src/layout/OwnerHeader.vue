<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center justify-between px-6 relative"
  >
    <!-- 사이드바 토글 버튼 -->
    <button
      @click="$emit('toggleSidebar')"
      class="p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 group"
    >
      <i class="pi pi-bars text-gray-700 group-hover:text-gray-900 transition-colors duration-200"></i>
    </button>

    <!-- 타이틀 -->
    <h1
      class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="router.push('/')"
    >
      Hotel Reservation
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-3 relative">
      <UserProfile />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import UserProfile from '@/components/common/UserProfile.vue';

const router = useRouter();

defineEmits<{
  toggleSidebar: []
}>();
</script>

<style scoped>
</style>
