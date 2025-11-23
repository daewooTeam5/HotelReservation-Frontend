<template>
  <main class="flex flex-col gap-6" ref="scrollContainer">
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
          <p class="text-gray-600 text-xs md:text-sm flex items-center gap-1 mt-1!">
            <i class="pi pi-map-marker text-red-500 text-xs"></i>
            <span class="text-gray-500 line-clamp-1">{{ place.sido }}</span>
          </p>
          <div class="flex items-center gap-2 mt-1!">
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

        <div class="flex gap-2 mt-2! self-end">
          <PrimeButton variant="text" @click="toggleLike(place)"
                       class="p-4! w-8 h-8 md:w-10 md:h-10 p-button-rounded p-button-secondary p-button-outlined flex items-center justify-center">
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

    <!-- 무한스크롤 로딩 인디케이터 -->
    <div
      v-if="isFetchingNextPage"
      class="text-center py-8"
      ref="loadingIndicator"
    >
      <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">더 많은 숙소를 불러오는 중...</p>
    </div>

    <!-- 스크롤 감지용 요소 -->
    <div
      v-if="hasNextPage && !isFetchingNextPage"
      ref="scrollTrigger"
      class="h-20"
    ></div>

    <!-- 더 이상 데이터가 없을 때 -->
    <div
      v-if="!hasNextPage && places.length > 0"
      class="text-center py-8 text-gray-500"
    >
      <p>모든 숙소를 불러왔습니다.</p>
    </div>
  </main>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import PrimeButton from 'primevue/button';

const router = useRouter();
const route = useRoute();

const props = defineProps<{
  places: any[];
  searchNotice: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}>();

const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

// Intersection Observer를 위한 ref
const scrollTrigger = ref<HTMLElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// Intersection Observer 설정
const setupIntersectionObserver = () => {
  if (!scrollTrigger.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      // 스크롤 트리거가 화면에 보이고, 다음 페이지가 있고, 현재 로딩중이 아닐 때
      if (entry.isIntersecting && props.hasNextPage && !props.isFetchingNextPage) {
        emit('load-more');
      }
    },
    {
      root: null, // viewport를 root로 사용
      rootMargin: '100px', // 트리거가 화면에 나타나기 100px 전에 미리 로드
      threshold: 0.1,
    }
  );

  observer.observe(scrollTrigger.value);
};

// scrollTrigger가 변경될 때마다 observer 재설정
watch(scrollTrigger, (newVal) => {
  if (observer) {
    observer.disconnect();
  }
  if (newVal) {
    setupIntersectionObserver();
  }
});

onMounted(() => {
  setupIntersectionObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

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
