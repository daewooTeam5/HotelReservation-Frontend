<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "@/components/SideBar.vue";
import WishSearchBox from "@/components/WishSearchBox.vue";
import SearchHotelList from "@/components/SearchHotelList.vue";
import { apiClient } from "@/utils/axiosClient.ts";
import SearchWishHotelList from '@/components/SearchWishHotelList.vue';

const places = ref<any[]>([]);
const isLoading = ref(true);
const isError = ref(false);
const error = ref("");
const searchNotice = ref("");

/** 위시리스트 불러오기 */
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
      <h1 class="text-2xl font-bold mb-4">위시리스트</h1>

      <WishSearchBox @search="loadWishlist" />

      <div v-if="isLoading" class="mt-6">불러오는 중...</div>
      <div v-else-if="isError" class="mt-6 text-red-500">❌ {{ error }}</div>
      <div v-else-if="!places.length" class="mt-6 text-gray-500">
        위시리스트가 비어 있습니다.
      </div>
      <div v-else class="mt-6">
        <SearchWishHotelList :places="places" :searchNotice="searchNotice" />
      </div>
    </div>
  </div>
</template>
