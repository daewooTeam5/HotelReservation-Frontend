<template>
  <div class="flex flex-col h-screen">
    <!-- 상단 헤더 -->
    <UserHeader />

    <main class="flex-1 overflow-y-auto flex">
      <SideBar />
      <slot />
    </main>

    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from '@/layout/UserHeader.vue';
import SideBar from '@/components/SideBar.vue';
</script>
