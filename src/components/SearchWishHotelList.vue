<template>
  <main class="grid grid-cols-3 gap-6">
    <div
      v-for="place in places"
      :key="place.id"
    >
      <PrimeCard style="width: 100%; overflow: hidden">
        <!-- 헤더 영역: 호텔 이미지 -->
        <template #header>
          <img
            v-if="place.fileUrl"
            :src="place.fileUrl"
            alt="호텔 이미지"
            class="object-cover h-48 w-full"
          />
          <div
            v-else
            class="h-48 flex items-center justify-center bg-gray-200 text-gray-500"
          >
            이미지 없음
          </div>
        </template>

        <!-- 타이틀 영역 -->
        <template #title>
          <div class="flex justify-between items-center">
            <span class="font-bold text-lg">{{ place.name }}</span>
            <PrimeButton variant="text" @click="toggleLike(place)">
              <i
                :class="[
                  'pi',
                  place.isLiked === 1 ? 'pi-heart-fill text-red-500' : 'pi-heart'
                ]"
              ></i>
            </PrimeButton>
          </div>
        </template>

        <!-- 부제목 -->
        <template #subtitle>
          <div class="flex items-center gap-1 text-gray-600 text-sm">
            <i class="pi pi-map-marker"></i>
            {{ place.sido }}
          </div>
        </template>

        <!-- 본문 -->
        <template #content>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">평점 {{ place.avgRating }}</span>
            <span class="text-red-500 font-bold">₩{{ Number(place.price).toLocaleString() }}</span>
          </div>
        </template>

        <!-- 푸터 버튼 -->
        <template #footer>
          <PrimeButton
            class="w-full"
            label="상세보기"
            @click="router.push({ name: 'PlaceDetail', params: { id: place.id } })"
          />
        </template>
      </PrimeCard>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient.ts";

const router = useRouter();

const props = defineProps<{
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
    console.error("찜 상태 변경 실패:", err);
  }
};
</script>
