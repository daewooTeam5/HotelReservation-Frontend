<template>
  <div class="flex flex-col min-h-screen">
    <UserHeader />

    <main class="flex-1 w-full">
      <slot />
    </main>

    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from "./UserHeader.vue";
import DefaultFooter from "./DefaultFooter.vue";
</script>
