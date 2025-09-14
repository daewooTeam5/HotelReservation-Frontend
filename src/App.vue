<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from '@/layout/Header.vue';
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <Header />
    <div class="flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped></style>
