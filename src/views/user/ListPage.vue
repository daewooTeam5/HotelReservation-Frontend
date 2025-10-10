<template>
  <div class="flex flex-col items-center w-full gap-4 bg-gray-50">
    <div class="w-full bg-white shadow-sm py-4 flex justify-center">
      <div class="w-full max-w-5xl">
        <SearchBox @search="resetFilters" />
      </div>
    </div>

    <div class="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
        <p class="mt-4 text-gray-600">숙소 목록을 불러오는 중...</p>
      </div>
      <div v-else-if="isError" class="text-red-500 text-center py-20">
        <i class="pi pi-exclamation-triangle text-4xl"></i>
        <p class="mt-4">{{ error }}</p>
      </div>
      <div v-else class="flex flex-col md:flex-row gap-6">
        <aside class="w-full md:w-72 flex-shrink-0">
          <div class="sticky top-4 bg-white shadow-md rounded-lg p-6 flex flex-col gap-6">
            <div>
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-bold text-lg">1박당 요금</h2>
                <button class="text-blue-600 text-sm font-semibold hover:underline" @click="resetFilters">
                  초기화
                </button>
              </div>
              <Slider
                v-model="priceRange"
                :min="0"
                :max="400000"
                :step="10000"
               style="margin-top: 10px; margin-bottom: 10px;"
                range
                class="w-full"
                @change="updateFiltersDebounced"
              />
              <div class="flex items-center justify-between text-sm mt-2">
                <span>{{ priceRange[0].toLocaleString() }}원</span>
                <span>{{ priceRange[1].toLocaleString() }}원</span>
              </div>
            </div>

            <div class="border-t pt-4">
              <h2 class="font-bold text-lg mb-2">숙소 종류</h2>
              <div class="flex flex-col gap-2 text-sm">
                <label v-for="cat in categories" :key="cat.value" class="flex items-center">
                  <input
                    style="margin-right: 4px;"
                    type="checkbox"
                    :value="cat.value"
                    v-model="selectedCategories"
                    @change="updateFilters"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-gray-700">{{ cat.label }}</span>
                </label>
              </div>
            </div>

            <div class="border-t pt-4">
              <h2 class="font-bold text-lg mb-2">평점</h2>
              <div class="flex flex-col gap-2 text-sm">
                <label v-for="rating in ratings" :key="rating.value" class="flex items-center">
                  <input
                    style="margin-right: 4px;"
                    type="radio"
                    name="rating"
                    :value="rating.value"
                    v-model="selectedRating"
                    @change="updateFilters"
                    class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-gray-700">{{ rating.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <div class="flex-1 min-w-0">
          <SearchHotelList :places="places" :searchNotice="searchNotice" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchBox from '@/components/SearchBox.vue';
import SearchHotelList from '@/components/SearchHotelList.vue';
import Slider from 'primevue/slider';
import { apiClient } from '@/utils/axiosClient.ts';
import { useToast } from 'primevue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const priceRange = ref([0, 400000]);
const selectedCategories = ref<string[]>([]);
const selectedRating = ref<string>('');

const categories = [
  { label: '아파트', value: '아파트' },
  { label: '호텔', value: '호텔' },
  { label: '리조트', value: '리조트' },
  { label: '게스트하우스', value: '게스트하우스' },
  { label: '모텔', value: '모텔' },
];

const ratings = [
  { label: '5점+', value: '5' },
  { label: '4점+', value: '4' },
  { label: '3점+', value: '3' },
  { label: '2점+', value: '2' },
  { label: '1점+', value: '1' },
  { label: '상관없음', value: '' },
];


const places = ref<any[]>([]);
const isLoading = ref(true);
const isError = ref(false);
const error = ref('');
const searchNotice = ref('');

let debounceTimer: number | null = null;

const updateFilters = () => {
  router.push({
    query: {
      ...route.query,
      placeCategory: selectedCategories.value.join(','),
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1],
      minRating: selectedRating.value || undefined,
    },
  });
};

const updateFiltersDebounced = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    updateFilters();
  }, 200);
};

const fetchAllPlaces = async () => {
  const res = await apiClient.get('http://localhost:8080/api/v1/places',
    {
    params: {
      start: 1,
    },
  });
  return res.data.data.content;
};

const fetchSearchPlaces = async () => {
  const params = {
    ...route.query,
    start: 1, // Or handle pagination
    placeCategory: route.query.placeCategory || undefined,
    minPrice: route.query.minPrice || 0,
    maxPrice: route.query.maxPrice || 400000,
    minRating: route.query.minRating || undefined,
  };
  const res = await apiClient.get('/v1/places', { params });
  return res.data.data.content;
};

const resetFilters = () => {
  priceRange.value = [0, 400000];
  selectedCategories.value = [];
  selectedRating.value = '';

  router.push({
    query: {
      name: route.query.name,
      checkIn: route.query.checkIn,
      checkOut: route.query.checkOut,
      adults: route.query.adults,
      children: route.query.children,
      rooms: route.query.rooms,
      address: route.query.address,
    },
  });
};

const loadPlaces = async () => {
  isLoading.value = true;
  isError.value = false;
  error.value = '';
  searchNotice.value = '';

  try {
    let results = await fetchSearchPlaces();
    if (!results || results.length === 0) {
      searchNotice.value = '조건에 맞는 숙소가 없습니다.';
    }
    places.value = results;
  } catch(e) {
    isError.value = true;
    error.value = '숙소 데이터를 불러오는 데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (route.query.placeCategory) {
    selectedCategories.value = (route.query.placeCategory as string).split(',');
  }
  if (route.query.minRating) {
    selectedRating.value = route.query.minRating as string;
  }
  if (route.query.minPrice && route.query.maxPrice) {
    priceRange.value = [Number(route.query.minPrice), Number(route.query.maxPrice)];
  }
  loadPlaces();
});

watch(
  () => route.query,
  () => {
    loadPlaces();
  },
  { deep: true },
);
</script>

<style scoped>
/* PrimeVue Slider 커스텀 */
:deep(.p-slider-range) {
  background-color: #3b82f6;
}
:deep(.p-slider-handle) {
  border-color: #3b82f6;
}
</style>
