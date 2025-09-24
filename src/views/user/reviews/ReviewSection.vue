<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import type { ApiResult } from '@/types/ApiResult';
import type { ReviewResponse } from '@/types/review';
import Button from 'primevue/button';
import Carousel from 'primevue/carousel';
import Skeleton from 'primevue/skeleton';
import { Gravatar } from '@sauromates/vue-gravatar';
import ReviewDetailModal from './ReviewDetailModal.vue';
import ReviewFormModal from './ReviewFormModal.vue';
import { useToast } from 'primevue/usetoast';
import type { ReviewableReservation } from '@/types/reservation';

// --- 상태 관리 ---
const props = defineProps<{
  placeId: number;
}>();

const toast = useToast();
const queryClient = useQueryClient();
const isDetailModalVisible = ref(false);
const isReviewFormModalVisible = ref(false);
const isCheckingPermission = ref(false);
const reviewableReservations = ref<ReviewableReservation[]>([]);

// --- 데이터 가져오기 ---
const { isLoading: isLoadingReviews, data: reviewsData } = useQuery<ApiResult<ReviewResponse[]>>({
  queryKey: ['reviews', props.placeId],
  queryFn: () => apiClient.get(`/v1/places/${props.placeId}/reviews`).then(res => res.data),
  enabled: !!props.placeId,
});

const reviews = computed(() => reviewsData.value?.data || []);

// --- 함수 ---
const openDetailModal = () => {
  if (reviews.value.length === 0) {
    handleWriteReviewClick();
    return;
  }
  isDetailModalVisible.value = true;
};

// ✅ [수정] 리뷰 작성 버튼 클릭 시, 작성 가능한 예약이 있는지 먼저 확인
const handleWriteReviewClick = async () => {
  isCheckingPermission.value = true;
  try {
    const res = await apiClient.get<ApiResult<ReviewableReservation[]>>(`/v1/reservations/reviewable?placeId=${props.placeId}`);
    reviewableReservations.value = res.data.data || [];

    if (reviewableReservations.value.length > 0) {
      isReviewFormModalVisible.value = true; // 작성 가능하면 폼 열기
    } else {
      toast.add({ severity: 'info', summary: '알림', detail: '리뷰를 작성할 수 있는 예약 내역이 없습니다.', life: 3000 });
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: '오류', detail: '정보를 불러오는 데 실패했습니다.', life: 3000 });
  } finally {
    isCheckingPermission.value = false;
  }
};

const onReviewSubmitted = () => {
  isReviewFormModalVisible.value = false;
  queryClient.invalidateQueries({ queryKey: ['reviews', props.placeId] });
};

const responsiveOptions = ref([
  { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
  { breakpoint: '768px', numVisible: 1, numScroll: 1 }
]);
</script>

<template>
  <section class="mt-10 p-4">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">실제 투숙객이 꼽은 이 숙소의 장점</h2>

    <div v-if="isLoadingReviews" class="text-center"><Skeleton height="12rem" /></div>
    <div v-else-if="reviews.length === 0" class="text-center text-gray-500 py-8">
      <p class="text-lg font-semibold">🤔 혹시 이 호텔에서 체크아웃 하셨나요?</p>
      <p class="mt-2">이 호텔의 첫번째 리뷰어가 되어보세요!</p>
      <Button label="리뷰 작성하기" class="mt-4" @click="handleWriteReviewClick" :loading="isCheckingPermission" />
    </div>
    <div v-else>
      <Carousel :value="reviews" :numVisible="3" :numScroll="1" :responsiveOptions="responsiveOptions" :showIndicators="false">
        <template #item="slotProps">
          <div class="border rounded-lg p-6 m-2 h-full flex flex-col min-h-[220px]">
            <div class="flex items-center gap-3 mb-4">
              <Gravatar :email="slotProps.data.userName + '@example.com'" class="w-10 h-10 rounded-full" />
              <div>
                <p class="font-semibold">{{ slotProps.data.userName }}</p>
                <p class="text-sm text-gray-500">대한민국</p>
              </div>
            </div>
            <p class="text-gray-700 flex-grow line-clamp-4">"{{ slotProps.data.comment }}"</p>
            <Button label="더 보기" text @click="openDetailModal" class="self-start p-0 mt-2 text-blue-600 hover:text-blue-800" />
          </div>
        </template>
      </Carousel>
    </div>

    <div class="mt-6">
      <Button label="이용후기 모두 보기" @click="openDetailModal" outlined />
    </div>

    <ReviewDetailModal
      :place-id="props.placeId"
      v-model:visible="isDetailModalVisible"
    />

    <ReviewFormModal
      v-if="placeId"
      :place-id="props.placeId"
      :reservations="reviewableReservations"
      v-model:visible="isReviewFormModalVisible"
      @review-submitted="onReviewSubmitted"
    />
  </section>
</template>
