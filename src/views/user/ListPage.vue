<template>
  <div class="flex flex-col items-center w-full gap-4 bg-gray-50 h-full min-h-screen mr-1">

    <div class="w-full bg-white shadow-sm py-3 sm:py-4 flex justify-center z-10">
      <div class="w-full px-4 sm:px-10 lg:px-16">
        <SearchBox @search="resetFilters" />
      </div>
    </div>

    <div class="w-full max-w-7xl px-3 sm:px-6 lg:px-8 pb-20">

      <div v-if="isLoading" class="text-center py-16 sm:py-20 text-sm sm:text-base">
        <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl text-blue-500"></i>
        <p class="mt-3 sm:mt-4 text-gray-600">숙소 목록을 불러오는 중...</p>
      </div>

      <div v-else-if="isError" class="text-red-500 text-center py-16 sm:py-20 text-sm sm:text-base">
        <i class="pi pi-exclamation-triangle text-3xl sm:text-4xl"></i>
        <p class="mt-3 sm:mt-4">{{ error }}</p>
      </div>

      <div v-else class="flex flex-col md:flex-row gap-4 sm:gap-6">

        <div class="md:hidden w-full sticky top-0 z-20 bg-gray-50 py-2">
          <div style="margin-right: 5px;" class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">

            <Button
              type="button"
              label="지역"
              icon="pi pi-map-marker"
              class="p-button-rounded p-button-outlined p-button-sm whitespace-nowrap bg-white"
              :class="{'p-button-primary': selectedRegion, 'p-button-secondary': !selectedRegion}"
              @click="toggleRegionPop"
            />
            <Popover ref="opRegion" class="w-64">
              <div class="p-4 flex flex-col gap-3">
                <h4 class="font-bold mb-2">여행지 선택</h4>
                <Dropdown
                  v-model="selectedRegion"
                  :options="regions"
                  optionLabel="name"
                  optionValue="query"
                  placeholder="지역을 선택하세요"
                  class="w-full"
                  @change="updateFilters"
                  showClear
                />
              </div>
            </Popover>

            <Button
              type="button"
              label="가격 범위"
              icon="pi pi-wallet"
              class="p-button-rounded p-button-outlined p-button-sm whitespace-nowrap bg-white"
              :class="{'p-button-primary': priceRange[0] > 0 || priceRange[1] < 400000, 'p-button-secondary': priceRange[0] === 0 && priceRange[1] === 400000}"
              @click="togglePricePop"
            />
            <Popover ref="opPrice" class="w-72">
              <div class="p-4 flex flex-col gap-4">

                <h4 class="font-bold text-gray-800 text-base">
                  1박당 요금
                </h4>

                <Slider
                  v-model="priceRange"
                  :min="0"
                  :max="400000"
                  :step="10000"
                  range
                  @slideend="updateFilters"
                  class="w-full"
                />

                <div class="flex justify-between text-sm text-gray-700 font-semibold">
                  <span>{{ priceRange[0].toLocaleString() }}원</span>
                  <span>{{ priceRange[1].toLocaleString() }}원</span>
                </div>

              </div>
            </Popover>

            <Button
              type="button"
              label="숙소 종류"
              icon="pi pi-home"
              class="p-button-rounded p-button-outlined p-button-sm whitespace-nowrap bg-white"
              :class="{'p-button-primary': selectedCategories.length > 0, 'p-button-secondary': selectedCategories.length === 0}"
              @click="toggleCategoryPop"
            />
            <Popover ref="opCategory" class="w-64">
              <div class="p-4 flex flex-col gap-3">
                <h4 class="font-bold mb-2">숙소 종류 선택</h4>
                <label v-for="cat in categories" :key="cat.value" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input type="checkbox" :value="cat.value" v-model="selectedCategories" @change="updateFilters" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" />
                  <span class="text-sm text-gray-700">{{ cat.label }}</span>
                </label>
              </div>
            </Popover>

            <Button
              type="button"
              label="평점"
              icon="pi pi-star"
              class="p-button-rounded p-button-outlined p-button-sm whitespace-nowrap bg-white"
              :class="{'p-button-primary': selectedRating !== '', 'p-button-secondary': selectedRating === ''}"
              @click="toggleRatingPop"
            />
            <Popover ref="opRating" class="w-64">
              <div class="p-4 flex flex-col gap-3">
                <h4 class="font-bold mb-2">최저 평점 선택</h4>
                <label v-for="rating in ratings" :key="rating.value" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input type="radio" name="m_rating" :value="rating.value" v-model="selectedRating" @change="updateFilters" class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" />
                  <span class="text-sm text-gray-700">{{ rating.label }}</span>
                </label>
              </div>
            </Popover>

            <Button
              type="button"
              icon="pi pi-refresh"
              class="p-button-rounded p-button-text p-button-sm p-button-secondary"
              @click="resetFilters"
              v-if="isFilterActive"
            />
          </div>
        </div>

        <aside class="hidden md:block w-72 flex-shrink-0">
          <div class="sticky top-4 bg-white shadow-md rounded-lg p-6 flex flex-col gap-5">

            <div>
              <div class="flex justify-between items-center mb-3">
                <h2 class="font-bold text-lg">여행지</h2>
                <button class="text-blue-600 text-sm font-semibold hover:underline" @click="selectedRegion = null; updateFilters()">해제</button>
              </div>
              <Dropdown
                v-model="selectedRegion"
                :options="regions"
                optionLabel="name"
                optionValue="query"
                placeholder="지역 선택"
                class="w-full"
                @change="updateFilters"
                showClear
              />
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-3 ">
                <h2 style="margin-bottom: 10px;" class="font-bold text-lg pt-2">1박당 요금</h2>
                <button class="text-blue-600 text-sm font-semibold hover:underline" @click="resetFilters">초기화</button>
              </div>
              <Slider v-model="priceRange" :min="0" :max="400000" :step="10000" class="w-full mt-3 mb-3" range @slideend="updateFilters" />
              <div style="margin-top: 10px;" class="flex items-center justify-between text-sm">
                <span>{{ priceRange[0].toLocaleString() }}원</span>
                <span>{{ priceRange[1].toLocaleString() }}원</span>
              </div>
            </div>

            <div class="border-t pt-2 mb-2">
              <h2 class="font-bold text-lg mb-2">숙소 종류</h2>
              <div class="flex flex-col gap-2 text-sm">
                <label v-for="cat in categories" :key="cat.value" class="flex items-center cursor-pointer">
                  <input style="margin-right: 4px;" type="checkbox" :value="cat.value" v-model="selectedCategories" @change="updateFilters" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                  <span class="text-gray-700">{{ cat.label }}</span>
                </label>
              </div>
            </div>

            <div class="border-t pt-2 mb-2">
              <h2 class="font-bold text-lg mb-2">평점</h2>
              <div class="flex flex-col gap-2 text-sm">
                <label v-for="rating in ratings" :key="rating.value" class="flex items-center cursor-pointer">
                  <input style="margin-right: 4px;" type="radio" name="d_rating" :value="rating.value" v-model="selectedRating" @change="updateFilters" class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                  <span class="text-gray-700">{{ rating.label }}</span>
                </label>
              </div>
            </div>

          </div>
        </aside>

        <div class="flex-1 min-w-0">
          <SearchHotelList
            :places="places"
            :searchNotice="searchNotice"
            :hasNextPage="hasMore"
            :isFetchingNextPage="isFetchingMore"
            @load-more="loadMore"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchBox from '@/components/SearchBox.vue';
import SearchHotelList from '@/components/SearchHotelList.vue';
import { apiClient } from '@/utils/axiosClient.ts';
import { useToast } from 'primevue';

// PrimeVue Components
import Slider from 'primevue/slider';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import Dropdown from 'primevue/dropdown';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// UserLayout에서 제공하는 scrollToTop 함수를 inject
const scrollToTop = inject<(() => void) | undefined>('scrollToTop');

// --- Popover Refs ---
const opRegion = ref(); // [NEW] 지역 팝오버
const opPrice = ref();
const opCategory = ref();
const opRating = ref();

const toggleRegionPop = (event: Event) => opRegion.value.toggle(event);
const togglePricePop = (event: Event) => opPrice.value.toggle(event);
const toggleCategoryPop = (event: Event) => opCategory.value.toggle(event);
const toggleRatingPop = (event: Event) => opRating.value.toggle(event);

// --- State ---
const priceRange = ref([0, 400000]);
const selectedCategories = ref<string[]>([]);
const selectedRating = ref<string>('');
const selectedRegion = ref<string | null>(null); // [NEW] 선택된 지역 (query 값)

// [NEW] 지역 데이터
const regions = [
  { name: '서울', query: '서울특별시' },
  { name: '부산', query: '부산광역시' },
  { name: '대구', query: '대구광역시' },
  { name: '인천', query: '인천광역시' },
  { name: '광주', query: '광주광역시' },
  { name: '대전', query: '대전광역시' },
  { name: '울산', query: '울산광역시' },
  { name: '경기', query: '경기도' },
  { name: '강원', query: '강원특별자치도' },
  { name: '충북', query: '충청북도' },
  { name: '충남', query: '충청남도' },
  { name: '전북', query: '전라북도' },
  { name: '전남', query: '전라남도' },
  { name: '경북', query: '경상북도' },
  { name: '경남', query: '경상남도' },
  { name: '제주', query: '제주특별자치도' }
];

const categories = [
  { label: '호텔', value: '호텔' },
  { label: '콘도', value: '콘도' },
  { label: '유스호스텔', value: '유스호스텔' },
  { label: '펜션', value: '펜션' },
  { label: '모텔', value: '모텔' },
  { label: '게스트하우스', value: '게스트하우스' },
  { label: '한옥', value: '한옥' },
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
const currentPage = ref(1);
const isFetchingMore = ref(false);
const hasMore = ref(true);

// 필터 활성화 여부 체크
const isFilterActive = computed(() => {
  return (
    (priceRange.value[0] > 0 || priceRange.value[1] < 400000) ||
    selectedCategories.value.length > 0 ||
    selectedRating.value !== '' ||
    selectedRegion.value !== null // [NEW] 지역 필터 체크
  );
});

// URL 업데이트 (address 파라미터에 지역 query 매핑)
const updateFilters = () => {
  router.push({
    query: {
      ...route.query,
      address: selectedRegion.value || undefined, // [NEW] 지역 필터 적용
      placeCategory: selectedCategories.value.join(','),
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1],
      minRating: selectedRating.value || undefined,
    },
  });
};

const fetchSearchPlaces = async (page: number) => {
  const params = {
    ...route.query,
    start: page,
    address: route.query.address || undefined,
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
  selectedRegion.value = null; // [NEW] 초기화

  // 팝오버 닫기
  opRegion.value?.hide();
  opPrice.value?.hide();
  opCategory.value?.hide();
  opRating.value?.hide();

  router.push({
    query: {
      // 다른 검색 조건(인원수 등)은 유지하려면 여기 남겨두고, 완전 초기화면 제거
      name: route.query.name,
      checkIn: route.query.checkIn,
      checkOut: route.query.checkOut,
      adults: route.query.adults,
      children: route.query.children,
      rooms: route.query.rooms,
      // address는 초기화되므로 여기서 제외하거나 빈값 처리
    },
  });
};

const loadPlaces = async () => {
  // 스크롤을 맨 위로 즉시 이동
  if (scrollToTop) {
    scrollToTop();
  }

  isLoading.value = true;
  isError.value = false;
  error.value = '';
  searchNotice.value = '';
  currentPage.value = 1;
  hasMore.value = true;

  try {
    let results = await fetchSearchPlaces(1);
    if (!results || results.length === 0) {
      searchNotice.value = '조건에 맞는 숙소가 없습니다.';
      hasMore.value = false;
    } else {
      hasMore.value = results.length >= 10; // 10개 미만이면 더 이상 없음
    }
    places.value = results;
  } catch(e) {
    isError.value = true;
    error.value = '숙소 데이터를 불러오는 데 실패했습니다.';
  } finally {
    isLoading.value = false;
    // 데이터 로드 후에도 한 번 더 스크롤 이동
    await nextTick();
    if (scrollToTop) {
      scrollToTop();
    }
  }
};

const loadMore = async () => {
  if (isFetchingMore.value || !hasMore.value) return;

  isFetchingMore.value = true;
  try {
    currentPage.value += 1;
    const results = await fetchSearchPlaces(currentPage.value);

    if (!results || results.length === 0) {
      hasMore.value = false;
    } else {
      places.value = [...places.value, ...results];
      hasMore.value = results.length >= 10; // 10개 미만이면 더 이상 없음
    }
  } catch(e) {
    console.error('추가 데이터 로딩 실패:', e);
  } finally {
    isFetchingMore.value = false;
  }
};

onMounted(() => {
  if (route.query.address) {
    selectedRegion.value = route.query.address as string; // [NEW] URL에서 값 불러오기
  }
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
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

:deep(.p-slider-range) {
  background-color: #3b82f6;
}
:deep(.p-slider-handle) {
  border-color: #3b82f6;

}
/* Dropdown 커스텀 */
:deep(.p-dropdown) {
  border-radius: 0.5rem;
}


</style>
