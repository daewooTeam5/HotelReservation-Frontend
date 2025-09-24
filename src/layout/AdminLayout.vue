// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/layout/AdminLayout.vue
<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <AdminSidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main content -->
    <main
      class="flex-1 bg-gray-50 flex flex-col transition-all duration-300"
      :class="isSidebarOpen ? 'ml-0' : ''"
    >
      <!-- Header -->
      <AdminHeader @toggleSidebar="toggleSidebar" />

      <!-- Content -->
      <section class="p-6 overflow-y-auto flex-1">
        <router-view />
      </section>

      <!-- Footer -->
      <AdminFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import AdminFooter from './AdminFooter.vue';

const isSidebarOpen = ref(true);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

