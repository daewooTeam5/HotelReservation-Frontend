<template>
  <div class="flex flex-col items-center w-full gap-4">
    <!-- 검색창 -->
    <div class="w-full max-w-7xl px-6 mt-4! flex justify-center">
      <SearchBox @search="resetFilters" />
    </div>

    <!-- 필터 + 리스트 -->
    <div class="w-full max-w-7xl px-6">
      <div class="p-6 bg-gray-50 min-h-screen">
        <div v-if="isLoading">불러오는 중...</div>
        <div v-else-if="isError" class="text-red-500">❌ {{ error }}</div>

        <div class="flex gap-6">
          <!-- 왼쪽 필터 -->
          <div class="w-64 bg-white shadow rounded-lg p-4 flex flex-col gap-8">
            <!-- 1박당 요금 -->
            <div class="flex flex-col gap-4">
              <div class="flex justify-between items-center">
                <h2 class="font-semibold">1박당 요금</h2>
                <button class="text-blue-500 text-sm hover:underline" @click="resetFilters">
                  적용 해제
                </button>
              </div>
              <!-- ✅ 슬라이더 -->
              <Slider
                v-model="priceRange"
                :min="0"
                :max="400000"
                range
                class="w-full"
                @change="updateFiltersDebounced"
              />
              <div class="flex items-center gap-2 text-sm">
                <span>₩</span>
                <input
                  type="number"
                  v-model.number="priceRange[0]"
                  class="w-full border rounded px-2 py-1 no-spinner"
                  @change="updateFiltersDebounced"
                />
                <span> ~ </span>
                <span>₩</span>
                <input
                  type="number"
                  v-model.number="priceRange[1]"
                  class="w-full border rounded px-2 py-1 no-spinner"
                  @change="updateFiltersDebounced"
                />
              </div>
            </div>

            <!-- 숙소 종류 -->
            <div class="flex flex-col">
              <h2 class="font-semibold">숙소 종류</h2>
              <div class="flex flex-col gap-1 text-sm">
                <label
                  ><input
                    type="checkbox"
                    value="아파트"
                    v-model="selectedCategories"
                    @change="updateFilters"
                  />
                  아파트</label
                >
                <label
                  ><input
                    type="checkbox"
                    value="호텔"
                    v-model="selectedCategories"
                    @change="updateFilters"
                  />
                  호텔</label
                >
                <label
                  ><input
                    type="checkbox"
                    value="리조트"
                    v-model="selectedCategories"
                    @change="updateFilters"
                  />
                  리조트</label
                >
                <label
                  ><input
                    type="checkbox"
                    value="게스트하우스"
                    v-model="selectedCategories"
                    @change="updateFilters"
                  />
                  게스트하우스 / 비앤비</label
                >
                <label
                  ><input
                    type="checkbox"
                    value="모텔"
                    v-model="selectedCategories"
                    @change="updateFilters"
                  />
                  모텔</label
                >
              </div>
            </div>

            <!-- 투숙객 평가 점수 -->
            <div class="flex flex-col">
              <h2 class="font-semibold">투숙객 평가 점수</h2>
              <div class="flex flex-col gap-1 text-sm">
                <label
                  ><input
                    type="radio"
                    name="rating"
                    value="5"
                    v-model="selectedRating"
                    @change="updateFilters"
                  />
                  5+ 최고</label
                >
                <label
                  ><input
                    type="radio"
                    name="rating"
                    value="4"
                    v-model="selectedRating"
                    @change="updateFilters"
                  />
                  4+ 우수</label
                >
                <label
                  ><input
                    type="radio"
                    name="rating"
                    value="3"
                    v-model="selectedRating"
                    @change="updateFilters"
                  />
                  3+ 양호</label
                >
                <label
                  ><input
                    type="radio"
                    name="rating"
                    value="2"
                    v-model="selectedRating"
                    @change="updateFilters"
                  />
                  2+ 낮음</label
                >
                <label
                  ><input
                    type="radio"
                    name="rating"
                    value="1"
                    v-model="selectedRating"
                    @change="updateFilters"
                  />
                  1+ 최악</label
                >
                <label
                  ><input
                    type="radio"
                    name="rating"
                    value=""
                    v-model="selectedRating"
                    @change="updateFilters"
                  />
                  상관없음</label
                >
              </div>
            </div>
          </div>

          <!-- 오른쪽 검색 결과 리스트 -->
          <div class="flex-1">
            <SearchHotelList :places="places" :searchNotice="searchNotice" />
          </div>
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

const route = useRoute();
const router = useRouter();

const priceRange = ref([0, 400000]);
const selectedCategories = ref<string[]>([]);
const selectedRating = ref<string>('');

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
      placeCategory: selectedCategories.value.join(','), // 여러개 선택 시 , 구분
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1],
      minRating: selectedRating.value || '',
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
  const res = await apiClient.get('http://localhost:8080/api/v1/places', {
    params: {
      start: 1,
    },
  });
  return res.data.data.content;
};

const fetchSearchPlaces = async () => {
  const res = await apiClient.get('http://localhost:8080/api/v1/places', {
    params: {
      start: 1,
      name: route.query.name,
      checkIn: route.query.checkIn,
      checkOut: route.query.checkOut,
      adults: route.query.adults,
      children: route.query.children,
      rooms: route.query.rooms,
      placeCategory: route.query.placeCategory || '',
      minPrice: route.query.minPrice || 0,
      maxPrice: route.query.maxPrice || 400000,
      minRating: route.query.minRating || '',
    },
  });
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
      // 필터 조건 제거
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
      searchNotice.value = '조건에 맞는 숙소가 없습니다. 전체 검색 결과를 표시합니다.';
      results = await fetchAllPlaces();
    }

    places.value = results;
  } catch {
    isError.value = true;
    error.value = '숙소 데이터를 불러오는 데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // URL에 필터가 있으면 반영
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
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  -moz-appearance: textfield;
}
</style>
