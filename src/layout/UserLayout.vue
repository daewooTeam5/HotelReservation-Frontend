<template>
  <div class="flex flex-col h-screen">
    <!-- 상단 헤더 -->
    <UserHeader />

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>

    <!-- 필요하다면 Footer 추가 -->
    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from "./UserHeader.vue";
</script>
