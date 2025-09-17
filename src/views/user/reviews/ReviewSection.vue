<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ReviewResponse } from '@/types/review';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';

const reviews = ref([]);
const {isLoading,data} = useQuery({queryKey:['v1','places',1,'reviews'] ,queryFn:httpFetcher})

// 주석: 간략히 보여줄 최신 리뷰 3개
const briefReviews = computed(() => reviews);

// 주석: 전체 리뷰 보기 모달의 표시 여부를 관리하는 상태
const isAllReviewsModalVisible = ref(false);
</script>

<template>
  <section class="mt-10">
    asdf
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">리뷰 ({{ reviews.length }})</h2>
<!--      <Button-->
<!--        v-if="canWriteReview"-->
<!--        label="리뷰 작성"-->
<!--        icon="pi pi-pencil"-->
<!--        @click="onWriteReview"-->
<!--      />-->
    </div>

    <div class="space-y-4">
      <div v-if="reviews.length === 0" class="text-center text-gray-500 py-4">
        아직 작성된 리뷰가 없습니다.
      </div>
<!--      <div v-for="review in briefReviews" :key="review.reviewId" class="border p-4 rounded-lg bg-gray-50">-->
<!--        <div class="flex items-center mb-2">-->
<!--          <Rating :model-value="review.rating" readonly :cancel="false" />-->
<!--          <span class="ml-4 font-semibold">{{ review.userName }}</span>-->
<!--          <span class="ml-auto text-sm text-gray-500">{{ new Date(review.createdAt).toLocaleDateString() }}</span>-->
<!--        </div>-->
<!--        <p class="text-gray-700">{{ review.comment }}</p>-->
<!--      </div>-->
    </div>

    <div v-if="reviews.length > 3" class="mt-4 text-center">
      <Button
        label="리뷰 전체보기"
        @click="isAllReviewsModalVisible = true"
        link
      />
    </div>

    <Dialog
      v-model:visible="isAllReviewsModalVisible"
      modal
      header="전체 리뷰"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '641px': '100vw' }"
    >
<!--      <div class="space-y-4 max-h-[60vh] overflow-y-auto p-1">-->
<!--        <div v-for="review in reviews" :key="review.reviewId" class="border p-4 rounded-lg">-->
<!--          <div class="flex items-center mb-2">-->
<!--            <Rating :model-value="review.rating" readonly :cancel="false" />-->
<!--            <span class="ml-4 font-semibold">{{ review.userName }}</span>-->
<!--            <span class="ml-auto text-sm text-gray-500">{{ new Date(review.createdAt).toLocaleDateString() }}</span>-->
<!--          </div>-->
<!--          <p class="text-gray-700">{{ review.comment }}</p>-->
<!--        </div>-->
<!--      </div>-->
    </Dialog>
  </section>
</template>
