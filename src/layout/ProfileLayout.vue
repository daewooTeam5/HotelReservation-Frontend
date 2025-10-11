<template>
  <div class="flex flex-col h-screen">
    <UserHeader @toggleSidebar="toggleSidebar" />

    <main class="flex-1 overflow-hidden flex relative">
      <!-- Mobile Overlay -->
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="isSidebarOpen = false"
      ></div>

      <!-- Sidebar -->
      <div
        :class="[
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <SideBar @close="isSidebarOpen = false" />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>

    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserHeader from '@/layout/UserHeader.vue';
import SideBar from '@/components/SideBar.vue';
import DefaultFooter from '@/layout/DefaultFooter.vue';

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>
