<template>
  <div class="owner-status-card border rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-xl">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-lg font-bold text-gray-900 mb-1">{{ business.user?.name || '사업장명 미입력' }}</div>
        <div class="text-xs text-gray-500">사업자 등록번호: <span class="font-mono">{{ business.businessNumber }}</span></div>
      </div>
      <Tag :value="getStatusText(business.status)" :severity="getStatusSeverity(business.status)" class="text-base px-3 py-1" />
    </div>
    <div class="mb-2">
      <span class="text-gray-600 font-semibold">상태 안내</span>
      <div v-if="business.status === 'APPROVED'" class="mt-2 p-3 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
        <i class="pi pi-check-circle text-emerald-500 text-xl"></i>
        <span class="text-emerald-700 font-medium">호텔 오너로 인증되었습니다!</span>
      </div>
      <div v-else-if="business.status === 'REJECTED' && business.rejectionReason" class="mt-2 p-3 rounded bg-red-50 border border-red-200 flex items-center gap-2">
        <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
        <span class="text-red-700 font-medium">신청이 거절됨: {{ business.rejectionReason }}</span>
      </div>
      <div v-else class="mt-2 text-gray-700 text-sm">{{ getStatusText(business.status) }}</div>
    </div>
    <div class="flex gap-2 mt-4">
      <PrimeButton v-if="business.status === 'APPROVED'" label="내 호텔 관리" icon="pi pi-home" severity="success" @click="$router.push('/owner')" />
      <PrimeButton v-if="business.status === 'REJECTED'" label="재신청" icon="pi pi-refresh" severity="info" outlined @click="$emit('reapply')" />
      <PrimeButton v-if="business.status !== 'APPROVED'" label="새로고침" icon="pi pi-refresh" severity="secondary" outlined @click="$emit('refresh')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag';
import PrimeButton from 'primevue/button';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{ business: any, getStatusText: (s: string) => string, getStatusSeverity: (s: string) => string }>();
defineEmits(['reapply', 'refresh']);
</script>

<style scoped>
.owner-status-card {
  /* 카드뷰 스타일 */
}
</style>

