<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { ref, onMounted, watch } from 'vue';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';
import HotelRegistrationRestore from '@/components/hotel/HotelRegistrationRestore.vue';

const store = useRegisterStore();
const router = useRouter();
const showRestoreComponent = ref(true);

// 체크인/체크아웃 시간 변경 시 자동 저장
watch(
  () => [store.checkIn, store.checkOut],
  () => {
    store.autoSave();
  }
);

// 데이터 복원 완료 또는 새로 시작 시 호출
const onDataRestored = () => {
  showRestoreComponent.value = false;
};

// 새로 시작하기 선택 시 호출
const onStartNew = () => {
  showRestoreComponent.value = false;
  store.clearStoreAndStorage();
};

const goPrev = () => router.push('/publishing/register/amenities');
const goNext = () => router.push('/publishing/register/rooms');

onMounted(() => {
  // 첫 페이지에서 넘어온 경우 복원 컴포넌트 숨김
  if (store.name || store.categoryId || store.hotelImages.length > 0) {
    showRestoreComponent.value = false;
  }
});
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="w-full p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
      <h2 class="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">이용 수칙</h2>

      <div class="space-y-4 mx-auto ">
        <div style="margin-top:8px; margin-bottom:8px;">
          <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 인 시간</p>
          <input
            type="time"
            v-model="store.checkIn"
            class="w-[60%] border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div class="mx-auto">
          <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크 아웃 시간</p>
          <input
            type="time"
            v-model="store.checkOut"
            class="w-[60%] border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      <HotelRegistrationRestore
        v-if="showRestoreComponent"
        @data-restored="onDataRestored"
        @start-new="onStartNew"
        class="mt-4"
      />

      <div class="flex justify-between pt-4">
        <Button label="이전" severity="secondary" @click="goPrev" />
        <Button label="다음" @click="goNext" />
      </div>
    </div>
  </div>
</template>
