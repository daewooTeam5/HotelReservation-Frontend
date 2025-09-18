<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { ReviewResponse } from '@/types/review';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Skeleton from 'primevue/skeleton';

// --- 상태 관리 ---

// 주석: 부모 컴포넌트로부터 어떤 숙소의 리뷰를 가져올지 ID를 받습니다.
// 이 컴포넌트를 사용하려면 <ReviewSection :place-id="1" /> 처럼 placeId를 전달해야 합니다.
const props = defineProps<{
  placeId: number;
}>();

// 주석: 전체 리뷰를 보여주는 모달(Dialog)의 열림/닫힘 상태를 관리합니다.
const isAllReviewsModalVisible = ref(false);

// --- 데이터 가져오기 (vue-query) ---

// 주석: vue-query의 useQuery를 사용해 리뷰 데이터를 비동기적으로 가져옵니다.
// queryKey는 데이터 캐싱 및 관리를 위한 고유 식별자 역할을 합니다.
// placeId가 변경되면 자동으로 새로운 데이터를 가져옵니다.
const { isLoading, data } = useQuery<ApiResult<ReviewResponse[]>>({
  queryKey: ['v1', 'places', props.placeId, 'reviews'], // [API 버전, 리소스, ID, 하위 리소스] 형태로 구성
  queryFn: httpFetcher, // 실제 API를 호출하는 함수
  enabled: !!props.placeId, // placeId가 유효한 값일 때만 쿼리를 실행합니다.
});

// --- 데이터 가공 (Computed) ---

// 주석: API 응답 데이터에서 실제 리뷰 목록만 안전하게 추출합니다. 데이터가 없으면 빈 배열을 반환합니다.
const reviews = computed(() => data.value?.data || []);

// 주석: 화면에 처음 보여줄 3개의 리뷰만 잘라냅니다.
const briefReviews = computed(() => reviews.value.slice(0, 3));

</script>

<template>
  <section class="mt-10 p-4 border rounded-lg shadow-sm bg-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">리뷰 ({{ reviews.length }})</h2>
    </div>

    <div v-if="isLoading" class="space-y-4">
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
      <div v-for="review in briefReviews" :key="review.reviewId" class="border-b pb-6 last:border-b-0 last:pb-0">
        <div class="flex items-center mb-2">
          <Rating :model-value="review.rating" readonly :cancel="false" />
          <span class="ml-4 font-semibold text-gray-700">{{ review.userName }}</span>
          <span class="ml-auto text-sm text-gray-500">{{ new Date(review.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-gray-600 pl-1">{{ review.comment }}</p>
      </div>
    </div>

    <div v-if="reviews.length > 3" class="mt-6 text-center">
      <Button
        label="리뷰 전체보기"
        @click="isAllReviewsModalVisible = true"
        outlined
        severity="secondary"
      />
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
  </section>
</template>
