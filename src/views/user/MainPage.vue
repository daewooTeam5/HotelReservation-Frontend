<template>
  <main class="relative flex flex-col items-center bg-white">
    <img
      src="https://static.yeogi.com/_next/static/media/05_Kv_PC_Light_B.8067bd3b.webp"
      alt="상단 메인 이미지"
      class="absolute inset-0 w-full h-[400px] object-cover"
    />
    <div class="relative z-10 pt-32 flex flex-col gap-10">
      <h1 class="text-2xl font-bold text-left text-white">
        대우개발원 예약 시스템
      </h1>
      <SearchBox />
    </div>
  </main>
</template>

<script setup lang="ts">
import SearchBox from "@/components/SearchBox.vue";
</script>
