<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// active step driven by route meta
const activeStep = ref<string>((route.meta.step as string) || '1');
watch(
  () => route.fullPath,
  () => {
    activeStep.value = (route.meta.step as string) || '1';
  }
);

// navigate when user changes step via Stepper
const goToStep = (step: string) => {
  const baseQuery = { ...route.query };
  if (step === '1') router.push({ path: '/places/order', query: baseQuery });
  else if (step === '2') router.push({ path: '/places/payment', query: baseQuery });
  else if (step === '3') router.push({ path: '/places/success', query: baseQuery });
};
</script>

<template>
  <div class="space-y-8 px-2 pt-2">
    <!-- Step header -->
    <Stepper v-model:value="activeStep" @update:value="goToStep" :readonly="true">
      <StepList>
        <Step value="1" disabled>고객 정보 입력</Step>
        <Step value="2" disabled>결제</Step>
        <Step value="3" disabled>예약 완료</Step>
      </StepList>
    </Stepper>

    <!-- Child page -->
    <router-view />
  </div>
</template>
<style>

.p-stepper .p-stepper-header {
  pointer-events: none;
  cursor: default;
  opacity: 0.6;
}
</style>
