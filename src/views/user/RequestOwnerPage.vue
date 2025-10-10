<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useToast } from 'primevue';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { Business } from '@/types/owner.ts';
import OwnerRequestForm from '@/components/owner/OwnerRequestForm.vue';

const { isLoading, data, isError, error, refetch } = useQuery<ApiResult<Business>>({
  queryKey: ['v1', 'users', 'my', 'hotel-owner', 'status'],
  queryFn: httpFetcher
});

const toast = useToast();
const showRequestForm = ref(false);
const showRejectionDialog = ref(false);

// 폼 제출 성공 시 호출
const onFormSuccess = () => {
  showRequestForm.value = false;
  refetch();
};

// 거절 사유 모달 표시
const showRejectionReason = () => {
  showRejectionDialog.value = true;
};

// 재신청 버튼 클릭
const handleReapply = () => {
  showRequestForm.value = true;
};

// 상태에 따른 태그 색상
const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'PENDING': return 'warn';
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    default: return 'info';
  }
};

// 상태 텍스트
const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return '검토 중';
    case 'APPROVED': return '승인됨';
    case 'REJECTED': return '거절됨';
    default: return status;
  }
};
</script>

<template>

  <!-- 로딩 상태 -->
  <div v-if="isLoading" class="bg-gray-50 h-full flex items-center justify-center p-4">
    <div class="w-full max-w-2xl space-y-4">
      <Skeleton height="4rem" />
      <Skeleton height="8rem" />
      <Skeleton height="12rem" />
    </div>
  </div>

  <!-- 에러 상태 -->
  <div v-else-if="isError" class="bg-gray-50 h-full flex items-center justify-center p-4">
    <Message severity="error" class="w-full max-w-2xl">{{ error }}</Message>
  </div>

  <!-- 신청 데이터가 없는 경우 (최초 신청) 또는 재신청 폼 표시 -->
  <div v-else-if="!data?.data || showRequestForm" class="bg-gray-50 h-full flex items-center justify-center p-4">
    <OwnerRequestForm @success="onFormSuccess" />
  </div>

  <!-- 신청 데이터가 있는 경우 (신청 현황 표시) -->
  <div v-else class="bg-gray-50 h-full flex items-center justify-center p-4">
    <PrimeCard class="w-full max-w-2xl shadow-xl rounded-2xl overflow-hidden">
      <template #header>
        <div class="bg-gradient-to-r from-blue-500 to-indigo-400 text-white py-6 px-8">
          <h2 class="text-2xl font-bold tracking-wide">📋 신청 현황</h2>
          <p class="text-xs mt-1 opacity-90">내 호텔 오너 신청 상태를 확인하세요.</p>
        </div>
      </template>

      <template #content>
        <div class="p-6 space-y-6">
          <div class="flex flex-col gap-2">
            <span class="text-gray-600 font-semibold">사업장 이름</span>
            <span class="text-lg font-bold text-gray-800">{{ data.data.user?.name }}</span>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-gray-600 font-semibold">사업자 등록번호</span>
            <span class="text-lg font-mono text-blue-700">{{ data.data.businessNumber }}</span>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-gray-600 font-semibold">신청 상태</span>
            <Tag
              :value="getStatusText(data.data.status)"
              :severity="getStatusSeverity(data.data.status)"
              class="text-base px-3 py-1 w-fit"
            />
          </div>

          <!-- 승인 상태 안내 및 버튼 -->
          <div v-if="data.data.status === 'APPROVED'" class="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <i class="pi pi-check-circle text-emerald-500 text-2xl"></i>
            <div class="flex-1">
              <div class="font-bold text-emerald-700 text-lg mb-1">호텔 오너로 인증되었습니다!</div>
              <div class="text-gray-700 text-sm">이제 호텔 관리 서비스를 이용하실 수 있습니다.</div>
            </div>
            <PrimeButton label="내 호텔 관리하러 가기" icon="pi pi-home" severity="success" @click="$router.push('/owner')" class="ml-4" />
          </div>

          <!-- 거절 상태일 때만 거절 사유 표시 버튼 -->
          <div v-if="data.data.status === 'REJECTED' && data.data.rejectionReason" class="flex flex-col gap-2">
            <span class="text-gray-600 font-semibold">거절 사유</span>
            <PrimeButton
              label="거절 사유 보기"
              icon="pi pi-exclamation-triangle"
              severity="danger"
              outlined
              @click="showRejectionReason"
              class="w-fit"
            />
          </div>

          <div class="mt-6 flex gap-3">
            <PrimeButton
              v-if="data.data.status !=='APPROVED'"
              label="새로고침"
              icon="pi pi-refresh"
              severity="info"
              outlined
              @click="refetch"
            />

            <!-- 거절 상태일 때만 재신청 버튼 표시 -->
            <PrimeButton
              v-if="data.data.status === 'REJECTED'"
              label="재신청하기"
              icon="pi pi-paper-plane"
              severity="success"
              @click="handleReapply"
            />
          </div>
        </div>
      </template>
    </PrimeCard>
  </div>

  <!-- 거절 사유 모달 다이얼로그 -->
  <Dialog
    v-model:visible="showRejectionDialog"
    modal
    header="거절 사유"
    :style="{ width: '32rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="py-4">
      <div class="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-400 rounded">
        <i class="pi pi-exclamation-triangle text-red-500 text-xl mt-1"></i>
        <div>
          <h4 class="font-semibold text-red-700 mb-2">신청이 거절되었습니다</h4>
          <p class="text-gray-700 leading-relaxed">{{ data?.data?.rejectionReason }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <PrimeButton
          label="닫기"
          icon="pi pi-times"
          severity="secondary"
          @click="showRejectionDialog = false"
        />
        <PrimeButton
          label="재신청하기"
          icon="pi pi-paper-plane"
          severity="success"
          @click="showRejectionDialog = false; handleReapply()"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* PrimeVue 컴포넌트 디자인을 Tailwind에 맞게 미세 조정 */
:deep(.p-fileupload-buttonbar) {
  padding: 0.5rem;
}

:deep(.p-fileupload-content) {
  padding: 0.5rem;
}
</style>
