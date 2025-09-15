<script  lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { UserLegacy } from '@/types/users.ts';
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const { data, isLoading, isError, error } = reactive(useQuery<ApiResult<UserLegacy[]>>({
      queryKey: ['v1', 'users', 'all?start=0&size=10'],
      queryFn: httpFetcher,
    }));
    return {
      data,
      isLoading,
      isError,
      error
    }

  },
});
</script>

<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-4">유저 목록 ✨</h1>

    <div v-if="isLoading">⏳ 불러오는 중...</div>
    <div v-else-if="isError" class="text-red-500">❌ {{ error }}</div>

    <ul v-else class="space-y-2">
      <li v-for="user in data?.data!.content" :key="user.id" class="p-3 rounded-lg bg-gray-100">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      </li>
    </ul>
  </main>
</template>
