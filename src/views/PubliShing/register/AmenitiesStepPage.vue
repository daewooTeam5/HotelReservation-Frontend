<script lang="ts" setup>
import Button from 'primevue/button';
import { ref, onMounted } from 'vue';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import type { Amenity } from '@/types/amenity';
import HotelRegistrationRestore from '@/components/hotel/HotelRegistrationRestore.vue';

const store = useRegisterStore();
const router = useRouter();
const showRestoreComponent = ref(true);

// 서버에서 편의시설 데이터 가져오기
const { data: amenitiesData, isLoading, isError } = useQuery<ApiResult<Amenity[]>>({
  queryKey: [ 'v1', 'amenities', 'place'],
  queryFn: httpFetcher
});

// 선택된 편의시설 ID들을 관리
const selectedAmenities = ref<number[]>([]);

// 편의시설 선택/해제 함수
const toggleAmenity = (amenityId: number) => {
  const index = selectedAmenities.value.indexOf(amenityId);
  if (index > -1) {
    selectedAmenities.value.splice(index, 1);
  } else {
    selectedAmenities.value.push(amenityId);
  }

  // 스토어 업데이트 (기존 방식 유지)
  if (amenitiesData.value?.data) {
    store.amenities = amenitiesData.value.data.map(amenity => ({
      id: amenity.id,
      name: amenity.name,
      checked: selectedAmenities.value.includes(amenity.id)
    }));
  }

  store.autoSave();
};

// 편의시설이 선택되었는지 확인하는 함수
const isAmenitySelected = (amenityId: number) => {
  return selectedAmenities.value.includes(amenityId);
};

// 데이터 복원 완료 또는 새로 시작 시 호출
const onDataRestored = () => {
  showRestoreComponent.value = false;
  // 기존에 선택된 편의시설들을 selectedAmenities에 반영
  selectedAmenities.value = store.amenities
    .filter(a => a.checked)
    .map(a => a.id);
};

// 새로 시작하기 선택 시 호출
const onStartNew = () => {
  showRestoreComponent.value = false;
  selectedAmenities.value = [];
  store.clearStoreAndStorage();
};

const goPrev = () => router.push('/publishing/register/address');
const goNext = () => router.push('/publishing/register/policy');

onMounted(() => {
  // 첫 페이지에서 넘어온 경우 복원 컴포넌트 숨김
  if (store.name || store.categoryId || store.hotelImages.length > 0) {
    showRestoreComponent.value = false;
  }

  // 기존에 선택된 편의시설들을 selectedAmenities에 반영
  selectedAmenities.value = store.amenities
    .filter(a => a.checked)
    .map(a => a.id);
});
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">편의시설을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="isError" class="text-center py-8">
      <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
      <p class="mt-2 text-red-600">편의시설을 불러오는데 실패했습니다.</p>
    </div>

    <!-- 편의시설 목록 -->
    <div v-else-if="amenitiesData?.data">
      <p style="font-size: 24px;" class="font-bold items-center text-center text-blue-400 dark:text-gray-200 mb-6">
        편의시설 제공리스트
      </p>

      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="amenity in amenitiesData.data"
          :key="amenity.id"
          @click="toggleAmenity(amenity.id)"
          class="flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{
            'border-blue-500 bg-blue-50': isAmenitySelected(amenity.id),
            'border-gray-200 hover:border-gray-300': !isAmenitySelected(amenity.id)
          }"
        >
          <!-- 편의시설 아이콘 -->
          <img
            :src="amenity.icon"
            :alt="amenity.name"
            class="w-8 h-8 mb-2 object-contain"
            @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
          />

          <!-- 편의시설 이름 -->
          <p class="text-center text-xs font-medium text-gray-700 dark:text-gray-200">
            {{ amenity.name }}
          </p>

          <!-- 선택 체크 표시 -->
          <div
            class="mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
            :class="{
              'border-blue-500 bg-blue-500': isAmenitySelected(amenity.id),
              'border-gray-300': !isAmenitySelected(amenity.id)
            }"
          >
            <i
              v-if="isAmenitySelected(amenity.id)"
              class="pi pi-check text-white text-[10px]"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>

    <HotelRegistrationRestore
      v-if="showRestoreComponent"
      @data-restored="onDataRestored"
      @start-new="onStartNew"
    />
  </div>
</template>
