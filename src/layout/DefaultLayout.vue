<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <DefaultHeader />

    <!-- Content -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>

    <!-- Footer -->
    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import DefaultHeader from "./DefaultHeader.vue";
import DefaultFooter from "./DefaultFooter.vue";
</script>
