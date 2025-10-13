<template>
  <div class="p-6 lg:p-8">
    <h1 style="margin-bottom: 8px" class="text-2xl font-bold mb-6">환경 설정</h1>

    <div class="bg-white rounded shadow p-6 max-w-xl space-y-6">
      <!-- 푸시 알림 설정 -->
      <div style="margin-bottom: 8px" class="flex items-center justify-between py-4 border-b">
        <div>
          <label class="block font-medium text-lg mb-1">푸시 알림 수신</label>
          <span class="text-gray-500 text-sm">예약, 혜택 등 주요 알림을 푸시로 받아보세요.</span>
        </div>
        <ToggleSwitch v-model="pushEnabled" inputId="push" class="scale-125" />
      </div>
      <div v-if="pushEnabled" class="mt-2 text-green-600 text-sm flex items-center gap-1">
        <i class="pi pi-check-circle"></i>
        푸시 알림이 활성화되어 있습니다.
      </div>
      <div v-else class="mt-2 text-gray-400 text-sm flex items-center gap-1">
        <i class="pi pi-times-circle"></i>
        푸시 알림이 꺼져 있습니다.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const PUSH_KEY = 'pushEnabled';
const pushEnabled = ref(false);

// 초기값 로드
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(PUSH_KEY);
  if (saved !== null) pushEnabled.value = saved === 'true';
}

// 변경 시 로컬스토리지에 저장
watch(pushEnabled, (val) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PUSH_KEY, String(val));
  }
});
</script>

<style scoped>
.bg-white {
  background: #fff;
}
</style>
