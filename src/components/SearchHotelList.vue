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
          <h2 class="text-lg font-semibold!">{{ place.name }}</h2>
          <p class="text-gray-600 text-sm flex items-center gap-1">
            <i class="pi pi-map-marker"></i> {{ place.sido }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-sm text-gray-600">평점 {{ place.avgRating }}</span>
          </div>
        </div>

        <div class="flex items-end justify-between mt-4">
          <div class="flex flex-col items-end gap-1">
            <div v-if="place.discountValue > 0">
              <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-1">
                {{ Math.round((place.discountValue / place.originalPrice) * 100) }}% 할인
              </span>
              <div class="flex items-baseline gap-2">
                <span class="text-gray-500 line-through text-sm">
                  {{ Number(place.originalPrice).toLocaleString() }}원
                </span>
                <span class="text-gray-900 font-bold text-lg">
                  {{ Number(place.finalPrice).toLocaleString() }}원
                </span>
              </div>
            </div>

            <div v-else>
              <span class="text-gray-900 font-bold text-lg">
                {{ Number(place.originalPrice).toLocaleString() }}원
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <PrimeButton variant="text" @click="toggleLike(place)">
              <i
                :class="['pi', place.isLiked === 1 ? 'pi-heart-fill text-red-500' : 'pi-heart']"></i>
            </PrimeButton>
            <PrimeButton @click="goToDetail(place.id)">상세보기</PrimeButton>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import PrimeButton from 'primevue/button';

interface Place {
  id: number;
  name: string;
  sido: string;
  avgRating: number;
  fileUrl?: string;
  originalPrice: number;
  finalPrice: number;
  discountValue: number;
  isLiked: number;
}

const router = useRouter();
const route = useRoute();

const places = ref<Place[]>([]);
const searchNotice = ref<string>('');

// API 호출해서 데이터 가져오기
const fetchPlaces = async () => {
  try {
    const ownerId = 123; // 실제 로그인한 유저 ID
    const response = await apiClient.get(`/api/hotel/publishing/my-list?ownerId=${ownerId}`);

    // response.data를 places 배열로 맞추기
    if (response.data) {
      const data = response.data;
      places.value = [
        {
          id: data.id,
          name: data.hotelName,
          sido: data.address?.sido || '',
          avgRating: 4.5, // 임시
          fileUrl: data.images?.[0] || '',
          originalPrice: data.rooms?.[0]?.minPrice || 100000,
          finalPrice: data.rooms?.[0]?.minPrice || 100000,
          discountValue: 0,
          isLiked: 0
        }
      ];
    } else {
      searchNotice.value = '등록된 숙소가 없습니다.';
    }
  } catch (err) {
    console.error('숙소 데이터 가져오기 실패:', err);
    searchNotice.value = '숙소 정보를 불러오지 못했습니다.';
  }
};

const toggleLike = async (place: Place) => {
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
    query: {
      checkIn: route.query.checkIn,
      checkOut: route.query.checkOut,
      rooms: route.query.rooms
    }
  });
};

onMounted(() => {
  fetchPlaces();
});
</script>
