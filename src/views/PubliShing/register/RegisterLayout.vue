// filepath:
/Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/views/PubliShing/register/RegisterLayout.vue
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const activeStep = ref<string>((route.meta.step as string) || '1');
watch(
  () => route.fullPath,
  () => {
    activeStep.value = (route.meta.step as string) || '1';
  },
);

const goToStep = (step: string) => {
  const baseQuery = { ...route.query };
  switch (step) {
    case '1':
      router.push({ path: '/publishing/register/basic', query: baseQuery });
      break;
    case '2':
      router.push({ path: '/publishing/register/rooms', query: baseQuery });
      break;
    case '3':
      router.push({ path: '/publishing/register/amenities', query: baseQuery });
      break;
    case '4':
      router.push({ path: '/publishing/register/policy', query: baseQuery });
      break;

    case '5':
      router.push({ path: '/publishing/register/address', query: baseQuery });
      break;
    case '6':
      router.push({ path: '/publishing/register/confirm', query: baseQuery });
      break;
  }
};
</script>

<template>
  <div class="flex justify-center m-6 px-2 pt-2 w-full">
    <div class="flex flex-col space-y-8 w-full max-w-[700px]">
      <Stepper v-model:value="activeStep" @update:value="goToStep" :readonly="true">
        <StepList>
          <Step value="1" disabled>기본정보</Step>
          <Step value="2" disabled>객실</Step>
          <Step value="3" disabled>편의</Step>
          <Step value="4" disabled>이용수칙</Step>
          <Step value="5" disabled>주소</Step>
          <Step value="6" disabled>확인</Step>
        </StepList>
      </Stepper>

      <router-view />
    </div>
  </div>
</template>

<style>
.p-stepper .p-stepper-header {
  pointer-events: none;
  cursor: default;
  opacity: 0.6;
  justify-content: center;
}
</style>
