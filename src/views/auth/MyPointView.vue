<script setup lang="ts">
import PointSummary from '@/components/point/PointSummary.vue';
import PointHistory from '@/components/point/PointHistory.vue';
</script>

<template>
  <section class=" mx-auto p-4 space-y-6 flex flex-col gap-4">
    <PointSummary />
    <PointHistory />
  </section>
</template>

<style scoped>
/* page spacing only */
</style>
