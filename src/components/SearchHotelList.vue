<template>
  <main class="flex flex-col gap-6">
    <div
      v-if="searchNotice"
      class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg"
      role="alert"
    >
      <p class="font-bold">알림</p>
      <p>{{ searchNotice }}</p>
    </div>

    <div
      v-for="place in places"
      :key="place.id"
      class="bg-white shadow-lg rounded-xl overflow-hidden flex flex-row mb-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div class="relative w-1/3 md:w-1/3 aspect-[3/4] md:aspect-[4/3] overflow-hidden">
        <img
          v-if="place.fileUrl"
          :src="place.fileUrl"
          alt="호텔 이미지"
          class="w-full h-full object-cover"
        />

        <span
          v-else
          class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-xs md:text-base">
          이미지 없음
        </span>
      </div>

      <div class="flex-1 p-3 md:p-6 flex flex-col justify-between">
        <div>
          <h2 class="text-lg md:text-2xl font-bold text-gray-800 line-clamp-1">{{ place.name }}</h2>
          <p class="text-gray-600 text-xs md:text-sm flex items-center gap-1 mt-1">
            <i class="pi pi-map-marker text-red-500 text-xs"></i>
            <span class="text-gray-500 line-clamp-1">{{ place.sido }}</span>
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs md:text-sm text-yellow-500 font-bold flex items-center gap-1">
              <i class="pi pi-star-fill text-xs"></i> {{ place.avgRating.toFixed(1) }}
            </span>
            <span class="text-xs md:text-sm text-gray-500">( {{ place.reviewCount ?? 0 }} )</span>
          </div>
        </div>

        <div class="flex items-end justify-between mt-2 md:mt-4">
          <div class="flex-1"></div>
          <div class="flex flex-col items-end gap-1">
            <div v-if="place.discountValue > 0" class="text-right">
              <span class="bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded mb-1 inline-block">
                {{ Math.round(place.discountValue) }}%
              </span>
              <div class="flex flex-col md:flex-row items-end md:items-baseline gap-0 md:gap-2">
                <span class="text-gray-500 line-through text-xs md:text-sm">
                  {{ Number(place.originalPrice).toLocaleString() }}
                </span>
                <span class="text-gray-900 font-bold text-lg md:text-2xl">
                  {{ (Math.round(place.finalPrice / 100) * 100).toLocaleString() }}원
                </span>
              </div>
            </div>

            <div v-else>
              <span class="text-gray-900 font-bold text-lg md:text-2xl">
                {{ Number(place.originalPrice).toLocaleString() }}원
              </span>
            </div>
            <p style="margin-bottom: 2px;" class="text-[10px] md:text-xs text-gray-500">1박 기준</p>
          </div>
        </div>

        <div class="flex gap-2 mt-2 md:mt-4 self-end">
          <PrimeButton variant="text" @click="toggleLike(place)"
                       class="!p-2 w-8 h-8 md:w-10 md:h-10 p-button-rounded p-button-secondary p-button-outlined flex items-center justify-center">
            <i
              :class="['pi', place.isLiked === 1 ? 'pi-heart-fill text-red-500' : 'pi-heart']"
              class="text-sm md:text-base"
            ></i>
          </PrimeButton>
          <PrimeButton @click="goToDetail(place.id)" class="bg-blue-600 hover:bg-blue-700 !text-xs md:!text-base !px-3 !py-1 md:!px-4 md:!py-2">
            상세
          </PrimeButton>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import PrimeButton from 'primevue/button';

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

const goToDetail = (placeId: number) => {
  router.push({
    name: 'PlaceDetail',
    params: { id: placeId },
    query: route.query
  });
};
</script>
