<template>
  <div class="flex flex-col h-screen">
    <UserHeader />

    <main class="flex-1 overflow-y-auto flex">

      <SideBar />

      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>

    </main>

    <DefaultFooter />

  </div>
</template>

<script setup lang="ts">
import UserHeader from '@/layout/UserHeader.vue';
import SideBar from '@/components/SideBar.vue';
import DefaultFooter from '@/layout/DefaultFooter.vue';
</script>
