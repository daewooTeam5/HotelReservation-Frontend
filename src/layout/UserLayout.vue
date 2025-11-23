<template>
  <div class="flex flex-col min-h-screen">
    <UserHeader />

    <main id="main" class="flex-1 w-full pb-16 md:pb-0 overflow-y-auto" ref="mainRef">
      <slot />
    </main>

    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from "./UserHeader.vue";
import DefaultFooter from "./DefaultFooter.vue";
import { onMounted, ref, provide } from 'vue';
import "../assets/main.css"

const mainRef = ref<HTMLElement | null>(null);

// 스크롤을 맨 위로 이동하는 함수를 provide
const scrollToTop = () => {
  if (mainRef.value) {
    mainRef.value.scrollTo({ top: 0, behavior: 'instant' });
  }
};

provide('scrollToTop', scrollToTop);

onMounted(() => {
  const el = mainRef.value!;

  el.addEventListener("scroll", () => {
    const scrollTop = el.scrollTop;

    if (window.AndroidBridge && window.AndroidBridge.updateScrollPosition) {
      window.AndroidBridge.updateScrollPosition(scrollTop);
    }
  });
});

</script>
