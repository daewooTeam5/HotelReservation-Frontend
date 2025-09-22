<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <OwnerSidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main content -->
    <main
      class="flex-1 bg-gray-50 flex flex-col transition-all duration-300"
      :class="isSidebarOpen ? 'ml-0' : ''"
    >
      <!-- Header -->
      <OwnerHeader @toggleSidebar="toggleSidebar" />

      <!-- Content -->
      <section class="p-6 overflow-y-auto flex-1">
        <router-view />
      </section>

      <!-- Footer -->
      <OwnerFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OwnerSidebar from "./OwnerSidebar.vue";
import OwnerHeader from "./OwnerHeader.vue";
import OwnerFooter from "./OwnerFooter.vue";

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>
