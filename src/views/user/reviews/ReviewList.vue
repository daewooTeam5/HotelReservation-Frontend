<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import dayjs from 'dayjs';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

interface PlaceInfo {
  placeId: number;
  placeName: string;
  categoryName: string;
}

interface OwnerCommentInfo {
  commentId: number;
  comment: string;
  ownerName: string;
  createdAt: string;
}

interface Review {
  reviewId: number;
  place: PlaceInfo;
  rating: number;
  comment: string;
  imageUrls: string[];
  ownerComment: OwnerCommentInfo | null;
  createdAt: string;
}

// --- Component State ---
const reviews = ref<Review[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);


// Pagination state
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 5; // 한 페이지에 5개씩 표시

// --- API Fetching ---
const fetchMyReviews = async (page = 0) => {
  loading.value = true;
  error.value = null;

  try {
    // Correct endpoint with pagination parameters
    const res = await apiClient.get('/v1/reviews/my-reviews', {
      params: {
        page: page,
        size: pageSize,
      },
    });
    // Spring Page<> object returns content in the 'content' property
    reviews.value = res.data.content;
    totalPages.value = res.data.totalPages;
    currentPage.value = res.data.number;
  } catch (err: any) {
    console.error('Failed to fetch reviews:', err);
    error.value = '리뷰를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// --- Helper Functions ---
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY년 MM월 DD일');
};

const changePage = (newPage: number) => {
  if (newPage >= 0 && newPage < totalPages.value) {
    fetchMyReviews(newPage);
  }
};

// --- Lifecycle Hook ---
onMounted(() => {
  fetchMyReviews();
});
const deleteReview = async (reviewId: number, placeId: number) => {
  try {
    await apiClient.delete(`/v1/places/${placeId}/reviews/${reviewId}`);
    reviews.value = reviews.value.filter(r => r.reviewId !== reviewId);

    toast.add({
      severity: 'success',
      summary: '삭제 완료',
      detail: '리뷰가 성공적으로 삭제되었습니다.',
      life: 3000
    });
  } catch (err: any) {
    console.error('리뷰 삭제 실패:', err);
    toast.add({
      severity: 'error',
      summary: '삭제 실패',
      detail: '리뷰 삭제 중 문제가 발생했습니다.',
      life: 3000
    });
  }
};

</script>

<template>

  <div class="max-w-4xl mx-auto p-4 md:p-8">
    <Toast />
    <h1 class="text-3xl font-bold! text-gray-900 mb-8!">내가 작성한 리뷰</h1>

    <div v-if="loading" class="space-y-6!">
      <Skeleton v-for="i in 3" :key="i" height="12rem" borderRadius="16px"></Skeleton>
    </div>

    <div v-else-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else-if="reviews.length === 0" class="text-center py-16!">
      <i class="pi pi-inbox text-5xl text-gray-400"></i>
      <p class="mt-4 text-lg text-gray-600">아직 작성한 리뷰가 없습니다.</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="review in reviews"
        :key="review.reviewId"
        class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4!">
          <div>
            <h3 class="text-xl font-bold! text-gray-800">{{ review.place.placeName }}</h3>
            <p class="text-sm! text-gray-500">{{ review.place.categoryName }}</p>
          </div>
          <span class="text-sm! text-gray-500">{{ formatDate(review.createdAt) }}</span>
        </div>

        <div class="flex items-center gap-1 mb-4!">
          <i
            v-for="i in 5"
            :key="i"
            :class="i <= review.rating ? 'pi pi-star-fill text-yellow-400' : 'pi pi-star text-gray-300'"
            class="text-lg"
          ></i>
        </div>

        <p class="text-gray-700 leading-relaxed mb-4">
          {{ review.comment }}
        </p>
        <div class="flex justify-end mt-4">
          <Button
            label="삭제"
            icon="pi pi-trash"
            severity="danger"
            size="small"
            @click="deleteReview(review.reviewId, review.place.placeId)"
            class="mt-4 ml-auto"
          />
        </div>
        <div v-if="review.imageUrls && review.imageUrls.length > 0" class="flex gap-2 mb-4">
          <img
            v-for="(url, idx) in review.imageUrls"
            :key="idx"
            :src="url"
            alt="Review image"
            class="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80"
          />
        </div>

        <div v-if="review.ownerComment" class="bg-gray-50 rounded-lg p-4 mt-4">
          <div class="flex items-center mb-2">
            <Avatar icon="pi pi-building" class="mr-2" shape="circle" />
            <div>
              <p class="font-semibold text-sm text-gray-800">{{ review.ownerComment.ownerName || '숙소 답변' }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(review.ownerComment.createdAt) }}</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ review.ownerComment.comment }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center mt-8 gap-2">
      <PrimeButton
        icon="pi pi-angle-left"
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
        text
        rounded
      />
      <span class="text-sm font-medium text-gray-700">
        페이지 {{ currentPage + 1 }} / {{ totalPages }}
      </span>
      <PrimeButton
        icon="pi pi-angle-right"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        text
        rounded
      />
    </div>
  </div>
</template>
