<template>
  <div class="p-6 flex flex-col gap-2">
    <h1 class="text-2xl font-bold mb-6">리뷰 관리</h1>

    <div class="flex justify-end mb-6">
      <div>
        <Dropdown v-model="sortOption" :options="sortOptions" optionLabel="name" placeholder="선택" class="w-full md:w-48" />
      </div>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <Skeleton height="6rem" v-for="i in 3" :key="i" />
    </div>
    <div v-else-if="isError" class="text-center py-10 bg-red-50 text-red-700 rounded-lg">
      <p>리뷰를 불러오는 데 실패했습니다.</p>
      <p class="text-sm mt-2">{{ error?.message }}</p>
    </div>
    <div v-else class="bg-white rounded shadow overflow-x-auto flex flex-col gap-4">
      <DataTable :value="reviews" :paginator="reviews.length > 10" :rows="10" stripedRows>
        <Column field="reviewId" header="ID" style="width: 5%" />
        <Column field="userName" header="고객명" style="width: 10%" />
        <Column field="rating" header="평점" style="width: 10%">
          <template #body="slotProps">
            <Rating :model-value="slotProps.data.rating" readonly :cancel="false" />
          </template>
        </Column>
        <Column field="comment" header="내용" style="min-width: 25rem" />
        <Column field="createdAt" header="작성일" style="width: 10%">
          <template #body="slotProps">
            {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
          </template>
        </Column>
        <Column header="답글" style="width: 10%">
          <template #body="slotProps">
            <span v-if="slotProps.data.commentByOwner" class="text-green-600 font-semibold">답변 완료</span>
            <span v-else class="text-gray-500">대기중</span>
          </template>
        </Column>
        <Column header="액션" style="width: 10%">
          <template #body="slotProps">
            <Button
              :label="slotProps.data.commentByOwner ? '답글 수정' : '답글 달기'"
              icon="pi pi-comment"
              class="p-button-text p-button-sm"
              @click="openReplyDialog(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="isReplyDialogOpen" modal header="리뷰 답글 작성" :style="{ width: '500px' }">
      <div>
        <p class="mb-2 text-gray-600"><b>고객:</b> {{ currentReview?.userName }}</p>
        <p class="mb-4 text-gray-600 p-2 bg-gray-100 rounded">"{{ currentReview?.comment }}"</p>
        <Textarea v-model="replyText" rows="4" class="w-full" placeholder="답글을 입력하세요..." />
      </div>
      <template #footer>
        <Button label="취소" class="p-button-text" @click="isReplyDialogOpen = false" />
        <Button label="저장" icon="pi pi-check" class="p-button-primary" @click="saveReply" :loading="isSubmittingComment" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Rating from "primevue/rating";
import Skeleton from 'primevue/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from "primevue/usetoast";
import type { ReviewResponse } from '@/types/review';
import type { ApiResult } from '@/types/ApiResult';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// --- 상태 ---
const queryClient = useQueryClient();
const toast = useToast();
const authStore = useAuthStore();

const sortOption = ref({ name: '최신순', value: 'createdAt,desc' });
const sortOptions = ref([
  { name: '최신순', value: 'createdAt,desc' },
  { name: '평점 높은순', value: 'rating,desc' },
  { name: '평점 낮은순', value: 'rating,asc' },
]);

const placeId = ref(1);

// --- 데이터 가져오기 ---
const fetchOwnerReviews = async (sortBy: string) => {
  // ===== ✅ 친구가 알려준 토큰 갱신 로직 적용 =====
  const refreshClient = axios.create({
    baseURL: apiClient.defaults.baseURL,
    withCredentials: true,
  });
  const res1 = await refreshClient.post("/v1/auth/token");
  const newAccessToken = res1.data.data.accessToken;
  authStore.setAccessToken(newAccessToken);
  // ===============================================

  const response = await apiClient.get<ApiResult<ReviewResponse[]>>(`/v1/places/${placeId.value}/reviews?sortBy=${sortBy}`);
  return response.data;
};

const { data: reviewsData, isLoading, isError, error, refetch } = useQuery<ApiResult<ReviewResponse[]>>({
  queryKey: ['ownerReviews', placeId, sortOption],
  queryFn: () => fetchOwnerReviews(sortOption.value.value),
});

const reviews = computed(() => reviewsData.value?.data || []);

// --- 답글 관리 ---
const isReplyDialogOpen = ref(false);
const currentReview = ref<ReviewResponse | null>(null);
const replyText = ref("");

const { mutate: submitComment, isPending: isSubmittingComment } = useMutation({
  mutationFn: async (payload: { reviewId: number, comment: string }) => {
    // ===== ✅ 여기에도 토큰 갱신 로직 추가 =====
    const refreshClient = axios.create({
      baseURL: apiClient.defaults.baseURL,
      withCredentials: true,
    });
    const res1 = await refreshClient.post("/v1/auth/token");
    authStore.setAccessToken(res1.data.data.accessToken);
    // ===============================================

    return apiClient.post(`/v1/owner/reviews/${payload.reviewId}/comments`, { comment: payload.comment });
  },
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '답글이 등록되었습니다.', life: 3000 });
    isReplyDialogOpen.value = false;
    queryClient.invalidateQueries({ queryKey: ['ownerReviews'] });
  },
  onError: (err: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: err.response?.data?.error?.detail || '답글 등록에 실패했습니다.', life: 3000 });
  }
});

const openReplyDialog = (review: ReviewResponse) => {
  currentReview.value = review;
  replyText.value = review.commentByOwner?.comment || "";
  isReplyDialogOpen.value = true;
};

const saveReply = () => {
  if (currentReview.value && replyText.value.trim()) {
    submitComment({ reviewId: currentReview.value.reviewId, comment: replyText.value });
  }
};

watch(sortOption, () => {
  refetch();
});
</script>
