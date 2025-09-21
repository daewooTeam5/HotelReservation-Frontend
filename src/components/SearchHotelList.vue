<template>
  <main class="flex flex-col gap-6">
    <div
      v-if="searchNotice"
      class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
      role="alert"
    >
      <p>{{ searchNotice }}</p>
    </div>

    <div
      v-for="place in places"
      :key="place.id"
      class="bg-white shadow rounded-lg overflow-hidden flex mb-6"
    >
      <!-- 이미지 -->
      <div class="relative w-1/5 h-48">
        <img
          v-if="place.fileUrl"
          :src="place.fileUrl"
          alt="호텔 이미지"
          class="object-cover h-full w-full"
        />
        <span
          v-else
          class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500"
        >
          이미지 없음
        </span>
      </div>

      <!-- 정보 -->
      <div class="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold">{{ place.name }}</h2>
          <p class="text-gray-600 text-sm flex items-center gap-1">
            <i class="pi pi-map-marker"></i> {{ place.sido }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-sm text-gray-600">평점 {{ place.avgRating }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="text-right">
            <p class="text-red-500 font-bold">₩{{ Number(place.price).toLocaleString() }}</p>
          </div>
          <div class="flex gap-2">
            <PrimeButton variant="text" @click="toggleLike(place)">
              <i
                :class="[
                  'pi',
                  place.isLiked === 1 ? 'pi-heart-fill text-red-500' : 'pi-heart'
                ]"
              ></i>
            </PrimeButton>

            <!-- 상세보기 -->
            <PrimeButton @click="goToDetail(place.id)">
              상세보기
            </PrimeButton>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';

const router = useRouter();
const route = useRoute();

defineProps<{
  places: any[];
  searchNotice: string;
}>();

const toggleLike = async (place: any) => {
  try {
    if (place.isLiked === 1) {
      await apiClient.delete(`/v1/wishlist/${place.id}`);
      place.isLiked = 0;
    } else {
      await apiClient.post(`/v1/wishlist/${place.id}`);
      place.isLiked = 1;
    }
  } catch (err) {
    console.error('찜 상태 변경 실패:', err);
  }
};

// 상세보기 클릭 시 체크인/체크아웃 날짜도 함께 전달
const goToDetail = (placeId: number) => {
  router.push({
    name: 'PlaceDetail',
    params: { id: placeId },
    query: {
      checkIn: route.query.checkIn,
      checkOut: route.query.checkOut,
      adults: route.query.adults,
      children: route.query.children,
      rooms: route.query.rooms
    }
  });
};
</script>
