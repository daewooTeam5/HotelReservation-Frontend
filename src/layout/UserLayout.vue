<template>
  <div class="flex flex-col min-h-screen">
    <UserHeader />

    <main class="flex-1 w-full pb-16 md:pb-0 overflow-y-auto" ref="mainRef">
      <slot />
    </main>

    <DefaultFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from "./UserHeader.vue";
import DefaultFooter from "./DefaultFooter.vue";
import { onMounted, ref } from 'vue';

const mainRef = ref<HTMLElement | null>(null);
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
