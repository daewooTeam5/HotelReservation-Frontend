<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useToast } from 'primevue';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { Business } from '@/types/owner.ts';
import OwnerRequestForm from '@/components/owner/OwnerRequestForm.vue';
import OwnerStatusCard from '@/components/owner/OwnerStatusCard.vue';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Divider from 'primevue/divider';

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
  <div class="p-1 md:p-8 bg-gray-100 min-h-screen">
    <div class="bg-white w-full p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
      <!-- 헤더 -->
      <div class="mb-6!">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2!">호텔 오너 신청</h1>
        <p class="text-gray-600 text-sm mb-1!">사업자 등록 및 오너 신청 현황을 확인하세요.</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="space-y-3">
        <Skeleton v-for="i in 3" :key="i" height="8rem" borderRadius="8px"></Skeleton>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="isError">
        <Message severity="error" :closable="false">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-xl"></i>
            <div>
              <p class="font-semibold">오류 발생</p>
              <p class="text-sm mt-1">{{ error }}</p>
            </div>
          </div>
        </Message>
      </div>

      <!-- 신청 데이터가 없는 경우 (최초 신청) 또는 재신청 폼 표시 -->
      <div v-else-if="!data?.data || showRequestForm">
        <OwnerRequestForm @success="onFormSuccess" />
      </div>

      <!-- 신청 데이터가 있는 경우 (신청 현황 표시) -->
      <div v-else>
        <!-- 신청 현황 카드 -->
        <div class="border border-gray-300 rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <!-- 상단: 사업장 정보 & 상태 태그 -->
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6! pb-6 border-b border-gray-200">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2!">
                <i class="pi pi-building text-blue-600 text-2xl"></i>
                <h2 class="text-xl md:text-2xl font-bold text-gray-900">{{ data.data.user?.name || '사업장명 미입력' }}</h2>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <i class="pi pi-id-card text-sm"></i>
                <span class="text-sm">사업자 등록번호</span>
                <span class="font-mono font-semibold text-blue-700">{{ data.data.businessNumber }}</span>
              </div>
            </div>
            <div>
              <Tag
                :value="getStatusText(data.data.status)"
                :severity="getStatusSeverity(data.data.status)"
                class="text-lg px-4 py-2 font-semibold"
              />
            </div>
          </div>

          <!-- 상태별 안내 메시지 -->
          <div class="mb-6!">
            <!-- 승인됨 -->
            <div v-if="data.data.status === 'APPROVED'"
                 class="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <i class="pi pi-check text-white text-2xl"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-emerald-800 mb-1!">
                    축하합니다! 호텔 오너로 인증되었습니다 🎉
                  </h3>
                  <p class="text-emerald-700 text-sm">
                    이제 호텔 관리 서비스를 이용하실 수 있습니다. 지금 바로 관리 페이지로 이동하여 호텔을 등록하고 운영을 시작하세요.
                  </p>
                </div>
              </div>
            </div>

            <!-- 검토 중 -->
            <div v-else-if="data.data.status === 'PENDING'"
                 class="p-5 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                    <i class="pi pi-clock text-white text-2xl"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-yellow-800 mb-1!">신청이 검토 중입니다</h3>
                  <p class="text-yellow-700 text-sm">
                    관리자가 신청 내용을 검토하고 있습니다. 영업일 기준 2-3일 이내에 결과를 알려드립니다.
                  </p>
                </div>
              </div>
            </div>

            <!-- 거절됨 -->
            <div v-else-if="data.data.status === 'REJECTED'"
                 class="p-5 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <i class="pi pi-times text-white text-2xl"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-red-800 mb-2!">신청이 거절되었습니다</h3>
                  <div v-if="data.data.rejectionReason" class="bg-white/70 rounded-lg p-3 mb-3!">
                    <p class="text-sm font-semibold text-red-700 mb-1!">거절 사유:</p>
                    <p class="text-red-600 text-sm leading-relaxed">{{ data.data.rejectionReason }}</p>
                  </div>
                  <p class="text-red-700 text-sm">
                    거절 사유를 확인하신 후, 수정하여 재신청해 주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex flex-wrap gap-3">
            <PrimeButton
              v-if="data.data.status === 'APPROVED'"
              label="내 호텔 관리하러 가기"
              icon="pi pi-home"
              severity="success"
              size="large"
              class="flex-1 md:flex-none"
              @click="$router.push('/owner')"
            />
            <PrimeButton
              v-if="data.data.status === 'REJECTED'"
              label="재신청하기"
              icon="pi pi-refresh"
              severity="info"
              size="large"
              class="flex-1 md:flex-none"
              @click="handleReapply"
            />
            <PrimeButton
              v-if="data.data.status !== 'APPROVED'"
              label="새로고침"
              icon="pi pi-sync"
              severity="secondary"
              outlined
              size="large"
              class="flex-1 md:flex-none"
              @click="refetch"
            />
          </div>

          <!-- 신청 정보 상세 (접을 수 있는 섹션) -->
          <Divider />
          <details class="group">
            <summary class="cursor-pointer text-gray-700 font-semibold hover:text-blue-600 transition-colors flex items-center gap-2">
              <i class="pi pi-info-circle"></i>
              <span>신청 정보 상세보기</span>
              <i class="pi pi-chevron-down text-xs group-open:rotate-180 transition-transform ml-auto"></i>
            </summary>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-500 block mb-1!">사업장명</span>
                <span class="font-semibold text-gray-900">{{ data.data.user?.name || '-' }}</span>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-500 block mb-1!">사업자 등록번호</span>
                <span class="font-mono font-semibold text-gray-900">{{ data.data.businessNumber }}</span>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-500 block mb-1!">신청 상태</span>
                <span class="font-semibold text-gray-900">{{ getStatusText(data.data.status) }}</span>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-500 block mb-1!">사업자 ID</span>
                <span class="font-mono text-gray-900">{{ data.data.businessId || '-' }}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 커스텀 스타일 */
details summary::-webkit-details-marker {
  display: none;
}
</style>
