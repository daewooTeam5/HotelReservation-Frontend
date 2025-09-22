<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "@/components/SideBar.vue";
import WishSearchBox from "@/components/WishSearchBox.vue";
import { apiClient } from "@/utils/axiosClient.ts";
import SearchWishHotelList from '@/components/SearchWishHotelList.vue';

const places = ref<any[]>([]);
const isLoading = ref(true);
const isError = ref(false);
const error = ref("");
const searchNotice = ref("");

const loadWishlist = async (searchData?: any) => {
  isLoading.value = true;
  isError.value = false;
  error.value = "";
  searchNotice.value = "";

  try {
    const res = await apiClient.get("http://localhost:8080/api/v1/places/wishlist", {
      params: {
        start: 0,
        ...(searchData || {}),
      },
    });

    const results = res.data.data.content || res.data.data;

    if (!results || results.length === 0) {
      searchNotice.value = "조건에 맞는 위시리스트가 없습니다.";
    }

    places.value = results;
  } catch {
    isError.value = true;
    error.value = "위시리스트를 불러오는 데 실패했습니다.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => loadWishlist());
</script>

<template>
  <div class="wishlist-page flex">
    <Sidebar />

    <div class="content flex-1 p-6">
      <!-- 검색창: 가운데 정렬 -->
      <div class="flex justify-center mb-6!">
        <WishSearchBox @search="loadWishlist" />
      </div>

      <!-- 상태 표시 -->
      <div v-if="isLoading" class="mt-6 text-center">불러오는 중...</div>
      <div v-else-if="isError" class="mt-6 text-center text-red-500">❌ {{ error }}</div>
      <div v-else-if="!places.length" class="mt-6 text-center text-gray-500">
        위시리스트가 비어 있습니다.
      </div>

      <!-- 리스트 -->
      <div v-else class="mt-6 flex justify-center">
        <div class="max-w-6xl w-full px-4">
          <SearchWishHotelList :places="places" :searchNotice="searchNotice" />
        </div>
      </div>
    </div>
  </div>
</template>
