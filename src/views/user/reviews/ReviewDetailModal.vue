<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResult } from '@/types/ApiResult';
import type { ReviewResponse } from '@/types/review';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import { Gravatar } from '@sauromates/vue-gravatar';
import ReviewFormModal from './ReviewFormModal.vue';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';

// --- Props & Emits ---
const props = defineProps<{
  visible: boolean;
  placeId: number;
  initialReviewId?: number | null; // 특정 리뷰로 스크롤하기 위한 prop
}>();

const emit = defineEmits(['update:visible']);

// --- 상태 관리 ---
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const isReviewFormModalVisible = ref(false);
const isReviewGuidanceModalVisible = ref(false);
const canWriteReview = ref(false);
const isCheckingPermission = ref(true);

// --- 정렬 옵션 ---
const sortOption = ref({ name: '최신순', value: 'createdAt,desc' });
const sortOptions = ref([
  { name: '최신순', value: 'createdAt,desc' },
  { name: '평점 높은순', value: 'rating,desc' },
  { name: '평점 낮은순', value: 'rating,asc' },
]);

// --- 데이터 가져오기 ---
const fetchReviews = async (sortBy: string) => {
  const response = await apiClient.get<ApiResult<ReviewResponse[]>>(`/v1/places/${props.placeId}/reviews?sortBy=${sortBy}`);
  return response.data;
};

const { isLoading: isLoadingReviews, data: reviewsData, refetch } = useQuery<ApiResult<ReviewResponse[]>>({
  queryKey: ['reviews', props.placeId, sortOption],
  queryFn: () => fetchReviews(sortOption.value.value),
  enabled: computed(() => props.visible && !!props.placeId), // 모달이 보일 때만 쿼리 실행
});

// --- 리뷰 삭제 ---
const { mutate: deleteReview } = useMutation({
  mutationFn: (reviewId: number) => apiClient.delete(`/v1/places/${props.placeId}/reviews/${reviewId}`),
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '리뷰가 삭제되었습니다.', life: 3000 });
    queryClient.invalidateQueries({ queryKey: ['reviews', props.placeId] });
  },
  onError: (error: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: error.response?.data?.error?.detail || '리뷰 삭제에 실패했습니다.', life: 3000 });
  }
});

const confirmDelete = (reviewId: number) => {
  if (confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
    deleteReview(reviewId);
  }
};

const checkReviewPermission = async () => {
  isCheckingPermission.value = true;
  try {
    if (!authStore.accessToken) {
      canWriteReview.value = false;
      return;
    }
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
const allReviewImages = computed(() => reviews.value.flatMap(r => r.imageUrls).filter(Boolean));

const ratingStats = computed(() => {
  const stats = {
    total: reviews.value.length,
    average: 0,
    counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
  if (stats.total === 0) return stats;

  let totalRating = 0;
  reviews.value.forEach(review => {
    stats.counts[review.rating as keyof typeof stats.counts]++;
    totalRating += review.rating;
  });
  stats.average = totalRating / stats.total;
  return stats;
});


// --- 함수 및 로직 ---
const closeModal = () => {
  emit('update:visible', false);
}

watch(() => props.visible, (newValue) => {
  if (newValue) {
    checkReviewPermission();
    refetch(); // 모달이 열릴 때마다 데이터를 새로고침
    if (props.initialReviewId) {
      nextTick(() => {
        const modalContent = document.querySelector('.review-list-container');
        const element = document.getElementById(`review-${props.initialReviewId}`);
        if (modalContent && element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }
});


const handleWriteReviewClick = () => {
  closeModal(); // 상세 모달 먼저 닫기

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
  queryClient.invalidateQueries({ queryKey: ['reviews', props.placeId] });
  checkReviewPermission();
};

</script>

<template>
  <Dialog :visible="props.visible" @update:visible="closeModal" modal header=" " :style="{ width: '60vw', height: '90vh' }" contentClass="p-0">
    <div class="grid grid-cols-12 h-full">
      <div class="col-span-4 bg-gray-50 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 class="font-bold text-lg">리뷰 평점</h3>
          <div class="flex items-center gap-4 mt-2">
            <div class="text-5xl font-bold text-blue-600">{{ ratingStats.average.toFixed(1) }}</div>
            <div class="flex flex-col">
              <Rating :model-value="ratingStats.average" readonly :cancel="false" />
              <span class="text-sm text-gray-500">{{ ratingStats.total }}개의 평가</span>
            </div>
          </div>
        </div>
        <div class="space-y-1">
          <div v-for="i in 5" :key="i" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 w-8">{{ 6 - i }}점</span>
            <ProgressBar :value="(ratingStats.counts[6-i] / ratingStats.total) * 100" :showValue="false" class="h-2 flex-1" />
            <span class="text-sm text-gray-500 w-8 text-right">{{ ratingStats.counts[6-i] }}</span>
          </div>
        </div>
        <div class="border-t pt-4">
          <h3 class="font-bold text-lg mb-4">리뷰 사진 모아보기</h3>
          <div v-if="allReviewImages.length > 0" class="grid grid-cols-3 gap-2">
            <img v-for="(img, idx) in allReviewImages.slice(0, 9)" :key="idx" :src="img" class="w-full h-24 object-cover rounded" />
          </div>
          <div v-else class="text-sm text-gray-500 text-center py-4">
            작성된 사진이 없습니다.
          </div>
        </div>
      </div>

      <div class="col-span-8 p-6 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <Dropdown v-model="sortOption" :options="sortOptions" optionLabel="name" placeholder="정렬" />
          <Button label="리뷰 작성하기" icon="pi pi-pencil" @click="handleWriteReviewClick" :loading="isCheckingPermission" />
        </div>
        <div class="flex-1 overflow-y-auto space-y-6 pr-2 review-list-container">
          <div v-for="review in reviews" :key="review.reviewId" :id="`review-${review.reviewId}`" class="border-b pb-4 scroll-mt-4">
            <div class="flex items-start gap-3">
              <Gravatar :email="review.userName + '@example.com'" class="w-10 h-10 rounded-full flex-shrink-0" />
              <div class="flex-1">
                <div class="flex items-center">
                  <span class="font-semibold">{{ review.userName }}</span>
                  <span class="text-xs text-gray-500 ml-2">{{ new Date(review.createdAt).toLocaleDateString() }}</span>
                  <Button v-if="authStore.userAuth?.name === review.userName" icon="pi pi-trash" text severity="danger" @click.stop="confirmDelete(review.reviewId)" class="ml-auto w-8 h-8" />
                </div>
                <div class="text-xs text-gray-500">{{ review.nights }}박 · {{ review.roomType }}</div>
                <Rating :model-value="review.rating" readonly :cancel="false" class="mt-1" />
                <p class="mt-2 text-gray-700 whitespace-pre-wrap">{{ review.comment }}</p>
                <div v-if="review.imageUrls.length > 0" class="flex gap-2 mt-2 flex-wrap">
                  <img v-for="url in review.imageUrls" :key="url" :src="url" class="w-24 h-24 rounded object-cover" />
                </div>
                <div v-if="review.commentByOwner" class="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p class="font-semibold text-sm text-gray-800">{{ review.commentByOwner.managerName }} (사장님)</p>
                  <p class="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{{ review.commentByOwner.comment }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isLoadingReviews" class="text-center py-4">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
        </div>
      </div>
    </div>
  </Dialog>

  <ReviewFormModal
    v-if="placeId"
    :place-id="props.placeId"
    v-model:visible="isReviewFormModalVisible"
    @review-submitted="onReviewSubmitted"
  />

  <Dialog v-model:visible="isReviewGuidanceModalVisible" modal header="리뷰 작성 안내" :style="{ width: '25rem' }">
    <p>리뷰를 작성하려면 로그인이 필요하며, 해당 숙소의 체크아웃을 완료해야 합니다.</p>
    <template #footer>
      <Button label="닫기" @click="isReviewGuidanceModalVisible = false" text />
      <Button v-if="!authStore.accessToken" label="로그인" @click="goToSignIn" />
    </template>
  </Dialog>
</template>

<style scoped>
.review-list-container {
  scroll-behavior: smooth;
}
</style>
