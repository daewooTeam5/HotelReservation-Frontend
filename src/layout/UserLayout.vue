<template>
  <div class="flex flex-col h-screen">
    <UserHeader />

    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>

    <DefaultFooter />

    <Toast />
  </div>
</template>

<script setup lang="ts">
import UserHeader from "./UserHeader.vue";
import DefaultFooter from "./DefaultFooter.vue"; // Footer가 있다면 추가
import Toast from 'primevue/toast'; // Toast 컴포넌트 임포트
</script>
