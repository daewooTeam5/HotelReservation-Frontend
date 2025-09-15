<template>
  <main class="min-h-screen flex flex-col items-center pt-32 bg-white">
    <h1 class="text-2xl font-bold mb-4 text-gray-900">호텔 검색</h1>
    <SearchBox />
  </main>
</template>

<script setup lang="ts">
import SearchBox from "@/components/SearchBox.vue";
</script>
