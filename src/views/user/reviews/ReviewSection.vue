<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/utils/axiosClient';
import type { ApiResult } from '@/types/ApiResult';
import type { ReviewResponse } from '@/types/review';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Skeleton from 'primevue/skeleton';
import ReviewFormModal from './ReviewFormModal.vue';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';

// --- 상태 관리 ---
const props = defineProps<{
  placeId: number;
}>();

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const isAllReviewsModalVisible = ref(false);
const isReviewFormModalVisible = ref(false);
const isReviewGuidanceModalVisible = ref(false);


const canWriteReview = ref(false);
const isCheckingPermission = ref(true);

// --- 데이터 가져오기 ---
const { isLoading: isLoadingReviews, data: reviewsData } = useQuery<ApiResult<ReviewResponse[]>>({
  queryKey: ['v1', 'places', props.placeId, 'reviews'],
  queryFn: httpFetcher,
  enabled: !!props.placeId,
});

const checkReviewPermission = async () => {
  isCheckingPermission.value = true;
  if (!authStore.accessToken) {
    canWriteReview.value = false;
    isCheckingPermission.value = false;
    return;
  }
  try {
    const response = await apiClient.get<{ data: { canReview: boolean } }>(`/v1/reservations/can-review?placeId=${props.placeId}`);
    canWriteReview.value = response.data.data.canReview;
  } catch (error) {
    console.error('리뷰 작성 권한 확인 실패:', error);
    canWriteReview.value = false;
  } finally {
    isCheckingPermission.value = false;
  }
};

// --- 데이터 가공 ---
const reviews = computed(() => reviewsData.value?.data || []);
const briefReviews = computed(() => reviews.value.slice(0, 3));

// --- 함수 ---
const openAllReviewsModal = () => {
  if (reviews.value.length === 0) {
    toast.add({ severity: 'info', summary: '알림', detail: '작성된 리뷰가 없습니다.', life: 3000 });
    return;
  }
  isAllReviewsModalVisible.value = true;
};

const handleWriteReviewClick = () => {
  if (canWriteReview.value) {
    isReviewFormModalVisible.value = true;
  } else {
    isReviewGuidanceModalVisible.value = true;
  }
};

const goToSignIn = () => {
  isReviewGuidanceModalVisible.value = false;
  router.push({
    path: '/auth/signin',
    query: { redirect: route.fullPath }
  });
};

const onReviewSubmitted = () => {
  queryClient.invalidateQueries({ queryKey: ['v1', 'places', props.placeId, 'reviews'] });
  checkReviewPermission();
};

onMounted(() => {
  checkReviewPermission();
});
</script>

<template>
  <section class="mt-10 p-4 border rounded-lg shadow-sm bg-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">리뷰 ({{ reviews.length }})</h2>

      <div class="flex items-center gap-2">
        <Button
          label="리뷰 전체보기"
          icon="pi pi-comments"
          @click="openAllReviewsModal"
          outlined
          severity="secondary"
        />
        <Button
          label="리뷰 작성하기"
          icon="pi pi-pencil"
          @click="handleWriteReviewClick"
          severity="contrast"
          outlined
          :loading="isCheckingPermission"
        />
      </div>
    </div>

    <div v-if="isLoadingReviews" class="space-y-4">
      <div v-for="i in 2" :key="i" class="flex items-start gap-4">
        <Skeleton shape="circle" size="3rem" />
        <div class="flex-1 space-y-2">
          <Skeleton width="10rem" height="1.25rem" />
          <Skeleton width="100%" height="3rem" />
        </div>
      </div>
    </div>
    <div v-else-if="reviews.length === 0" class="text-center text-gray-500 py-8">
      <p class="mb-2"><i class="pi pi-inbox" style="font-size: 1.5rem"></i></p>
      <p>아직 작성된 리뷰가 없습니다.</p>
    </div>
    <div v-else class="space-y-6">
      <div
        v-for="review in briefReviews"
        :key="review.reviewId"
        @click="openAllReviewsModal"
        class="border-b pb-6 last:border-b-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
      >
        <div class="flex items-center mb-2">
          <Rating :model-value="review.rating" readonly :cancel="false" />
          <span class="ml-4 font-semibold text-gray-700">{{ review.userName }}</span>
          <span class="ml-auto text-sm text-gray-500">{{ new Date(review.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-gray-600 pl-1">{{ review.comment }}</p>
      </div>
    </div>

    <Dialog
      v-model:visible="isAllReviewsModalVisible"
      modal
      header="전체 리뷰"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '641px': '100vw' }"
    >
      <div class="space-y-6 max-h-[60vh] overflow-y-auto p-1">
        <div v-for="review in reviews" :key="review.reviewId" class="border-b pb-6 last:border-b-0 last:pb-0">
          <div class="flex items-center mb-2">
            <Rating :model-value="review.rating" readonly :cancel="false" />
            <span class="ml-4 font-semibold">{{ review.userName }}</span>
            <span class="ml-auto text-sm text-gray-500">{{ new Date(review.createdAt).toLocaleDateString() }}</span>
          </div>
          <p class="text-gray-700 pl-1">{{ review.comment }}</p>
        </div>
      </div>
    </Dialog>

    <ReviewFormModal
      v-if="placeId"
      :place-id="props.placeId"
      v-model:visible="isReviewFormModalVisible"
      @review-submitted="onReviewSubmitted"
    />

    <Dialog v-model:visible="isReviewGuidanceModalVisible" modal header="리뷰 작성 안내" :style="{ width: '25rem' }" :closable="false">
      <div class="text-center p-4">
        <i class="pi pi-info-circle text-5xl text-blue-500 mb-4"></i>
        <p class="mb-4">
          리뷰를 작성하려면 로그인이 필요하며, <br/>
          해당 숙소의 체크아웃을 완료해야 합니다.
        </p>
      </div>
      <template #footer>
        <Button label="닫기" icon="pi pi-times" @click="isReviewGuidanceModalVisible = false" text />
        <Button
          v-if="!authStore.accessToken"
          label="로그인 / 회원가입"
          icon="pi pi-user"
          @click="goToSignIn"
        />
      </template>
    </Dialog>
  </section>
</template>
