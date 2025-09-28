<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <OwnerSidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main content -->
    <main
      id="main-content"
      class="flex-1 min-w-0 bg-gray-50 flex flex-col transition-all duration-300"
    >
      <!-- Header -->
      <OwnerHeader @toggleSidebar="toggleSidebar" />

      <!-- Content -->
      <section class="p-6 overflow-y-auto flex-1">
        <!-- router-view에서 컴포넌트 참조 -->
        <Toast/>
        <router-view v-slot="{ Component }">
          <component :is="Component" ref="pageRef" />
        </router-view>
      </section>

      <!-- Footer -->
      <OwnerFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import OwnerSidebar from "./OwnerSidebar.vue";
import OwnerHeader from "./OwnerHeader.vue";
import OwnerFooter from "./OwnerFooter.vue";
import Toast from "primevue/toast";

const isSidebarOpen = ref(true);
const pageRef = ref();

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;

  // transition 끝난 뒤 refreshData 실행
  nextTick(() => {
    setTimeout(() => {
      pageRef.value?.refreshData?.();
    }, 310); // transition duration과 맞춤
  });
};
</script>
