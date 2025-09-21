<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { PlaceDetailResponse } from '@/types/place.ts';

const props = defineProps<{
  hotelId: number;
}>();

const { isLoading, data, isError, error } = useQuery<ApiResult<PlaceDetailResponse>>({
  queryKey: ['v1', 'places', props.hotelId],
  queryFn: httpFetcher
});
</script>

<template>
  <template v-if="isLoading">
    <Skeleton />
    loading...
  </template>

  <template v-else-if="data">
    <PrimeCard>
      <template #header>
        <div class="flex items-top pl-2 pt-2 gap-4">
          <img :src="data.data?.fileUrls?.[0]" alt="호텔 이미지"
               class="w-32 h-32 object-cover mb-4 rounded-xl shadow-md border" />

          <div>
            <!-- 호텔 이름 -->
            <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
              <i class="pi pi-building text-blue-500"></i>
              {{ data.data?.name }}
            </h2>

            <!-- 평점 -->
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-star-fill text-yellow-400"></i>
              <span class="font-semibold">{{ data.data?.avgRating ?? 'N/A' }}</span>
            </div>

            <!-- 주소 -->
            <p class="mb-2 flex items-center gap-2 text-gray-700">
              <i class="pi pi-map-marker text-red-500"></i>
              <span>
                {{ data.data?.sido }} {{ data.data?.sigungu }} {{ data.data?.roadName }}
              </span>
            </p>
          </div>
        </div>
      </template>

      <div class="max-w-4xl mx-auto p-4 border rounded-lg shadow-md">
        <!-- 추가 정보 자리 -->
        <p class="text-gray-500 flex items-center gap-2">
          <i class="pi pi-info-circle text-blue-400"></i>
          호텔에 대한 상세 설명이 여기에 들어갑니다 ✨
        </p>
      </div>
    </PrimeCard>
  </template>
</template>

<style scoped>
</style>
