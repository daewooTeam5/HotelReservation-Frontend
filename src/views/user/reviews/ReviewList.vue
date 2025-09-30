<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/utils/axiosClient.ts';

interface MyReview {
  reviewId: number;
  comment: string;
  rating: number;
  placeId: number;
  reservationId: number;
  userId: number;
}

const authStore = useAuthStore();
const myReviews = ref<MyReview[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchMyReviews = async () => {
  if (!authStore.accessToken) return;
  loading.value = true;
  error.value = null;

  try {
    const res = await apiClient.get('/v1/reviews/my', {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    myReviews.value = res.data.data;
  } catch (err: any) {
    console.error(err);
    error.value = '리뷰를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMyReviews);
</script>

<template>
  <div class="lg:p-10 flex flex-col items-center mt-10 w-full max-w-5xl px-4">
    <h2 style="margin-bottom:10px;" class="text-3xl font-bold mb-2">내 리뷰 목록</h2>

    <div v-if="loading" class="mb-4 text-gray-500">불러오는 중...</div>
    <div v-if="error" class="mb-4 text-red-500">{{ error }}</div>

    <div
      class="w-full border border-gray-300 rounded-lg overflow-hidden"
    >
      <table class="min-w-full text-left border-collapse">
        <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border-b">리뷰 ID</th>
          <th class="px-4 py-2 border-b">코멘트</th>
          <th class="px-4 py-2 border-b">평점</th>
          <th class="px-4 py-2 border-b">숙소 ID</th>
          <th class="px-4 py-2 border-b">예약 ID</th>
          <th class="px-4 py-2 border-b">유저 ID</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-if="myReviews.length === 0"
          class="text-gray-500"
        >
          <td class="px-4 py-4 text-center" colspan="6">
            작성한 리뷰가 없습니다.
          </td>
        </tr>
        <tr
          v-for="review in myReviews"
          :key="review.reviewId"
          class="hover:bg-gray-50"
        >
          <td class="px-4 py-2 border-b">{{ review.reviewId }}</td>
          <td class="px-4 py-2 border-b">{{ review.comment }}</td>
          <td class="px-4 py-2 border-b">{{ review.rating }}</td>
          <td class="px-4 py-2 border-b">{{ review.placeId }}</td>
          <td class="px-4 py-2 border-b">{{ review.reservationId }}</td>
          <td class="px-4 py-2 border-b">{{ review.userId }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* 테이블 라운드 유지, 기본 border만, shadow 없음 */
table {
  border-collapse: collapse;
}
</style>
