<template>
  <div class="flex flex-col min-h-screen">
    <UserHeader />

    <main class="flex-1 w-full pb-16 md:pb-0 overflow-y-auto">
      <slot />
    </main>

    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from "./UserHeader.vue";
import DefaultFooter from "./DefaultFooter.vue";
</script>
